import { Injectable, Logger } from '@nestjs/common'
import { TaskTriggerInputDto, TaskTriggerOutputDto } from '@app/task/task.dto'
import { BatchService } from '@titvo/aws'
import { v4 as uuidv4 } from 'uuid'
import { TaskRepository } from '@core/task/task.repository'
import { TaskArgs, TaskSource, TaskStatus } from '@core/task/task.entity'
import { ScmStrategyResolver } from '@app/scm/scm.interface'
import { ValidateApiKeyUseCase } from '@titvo/auth'
import { createHash } from 'crypto'
import { ConfigService } from '@titvo/shared'
import { RepositoryIdUndefinedException } from '@app/task/task.error'

@Injectable()
export class TriggerTaskUseCase {
  private readonly logger = new Logger(TriggerTaskUseCase.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly batchService: BatchService,
    private readonly taskRepository: TaskRepository,
    private readonly scmStrategyResolver: ScmStrategyResolver,
    private readonly validateApiKeyUseCase: ValidateApiKeyUseCase
  ) { }

  async execute(input: TaskTriggerInputDto): Promise<TaskTriggerOutputDto> {
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
      repositoryId: `${userId}:${repositorySlugHash}`,
      status: TaskStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      args
    })
    await this.batchService.submitJob(`${source}-security-scan-${scanId}`, jobQueue, jobDefinition, [
      { name: 'TITVO_SCAN_TASK_ID', value: scanId }
    ])
    return {
      message: 'Scan starting',
      scanId
    }
  }
}
