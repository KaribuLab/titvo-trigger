import { Injectable, Logger } from '@nestjs/common'
import { TriggerTaskInputDto, TriggerTaskOutputDto, GetTaskStatusInputDto, GetTaskStatusOutputDto } from '@trigger/app/task/task.dto'
import { BatchService } from '@titvo/aws'
import { v4 as uuidv4 } from 'uuid'
import { TaskRepository } from '@trigger/core/task/task.repository'
import { TaskArgs, TaskSource, TaskStatus } from '@trigger/core/task/task.entity'
import { ScmStrategyResolver } from '@trigger/app/scm/scm.interface'
import { ValidateApiKeyUseCase } from '@titvo/auth'
import { createHash } from 'crypto'
import { ConfigService } from '@titvo/shared'
import { RepositoryIdUndefinedException, ScanIdNotFoundError, TaskNotFoundError } from '@trigger/app/task/task.error'

@Injectable()
export class TriggerTaskUseCase {
  private readonly logger = new Logger(TriggerTaskUseCase.name)

  constructor (
    private readonly configService: ConfigService,
    private readonly batchService: BatchService,
    private readonly taskRepository: TaskRepository,
    private readonly scmStrategyResolver: ScmStrategyResolver,
    private readonly validateApiKeyUseCase: ValidateApiKeyUseCase
  ) { }

  async execute (input: TriggerTaskInputDto): Promise<TriggerTaskOutputDto> {
    const userId = await this.validateApiKeyUseCase.execute(input.apiKey)
    const source = input.source as TaskSource
    const strategy = await this.scmStrategyResolver.resolve(source)
    const args = await strategy.handle(input.args as TaskArgs)
    const jobQueue = await this.configService.get('security-scan-job-queue')
    const jobDefinition = await this.configService.get('security-scan-job-definition')
    const scanId = `tvo-scan-${uuidv4()}`

    const repositorySlug = args.repository_slug
    this.logger.debug(`Repository slug: ${repositorySlug}`)
    const repositorySlugHash = repositorySlug !== undefined
      ? createHash('md5').update(repositorySlug).digest('hex')
      : undefined

    if (repositorySlugHash === undefined) {
      throw new RepositoryIdUndefinedException()
    }

    await this.taskRepository.save({
      id: scanId,
      source,
      repositoryId: `${userId as string}:${repositorySlugHash}`,
      status: TaskStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      args
    })
    await this.batchService.submitJob(`${source as string}-security-scan-${scanId}`, jobQueue, jobDefinition, [
      { name: 'TITVO_SCAN_TASK_ID', value: scanId }
    ])
    return {
      message: 'Scan starting',
      scanId
    }
  }
}

@Injectable()
export class GetTaskStatusUseCase {
  constructor (
    private readonly taskRepository: TaskRepository,
    private readonly validateApiKeyUseCase: ValidateApiKeyUseCase
  ) { }

  async execute (input: GetTaskStatusInputDto): Promise<GetTaskStatusOutputDto> {
    await this.validateApiKeyUseCase.execute(input.apiKey)
    if (input.scanId === undefined) {
      throw new ScanIdNotFoundError('Scan ID not found')
    }
    const task = await this.taskRepository.getById(input.scanId)
    if (task === null) {
      throw new TaskNotFoundError('Task not found')
    }
    return {
      status: task.status,
      updatedAt: task.updatedAt,
      result: task.result
    }
  }
}
