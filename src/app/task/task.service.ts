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
import { ArgumentNotFoundError, RepositoryIdUndefinedException, ScanIdNotFoundError, TaskNotFoundError } from '@trigger/app/task/task.error'

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

  async execute(input: TriggerTaskInputDto): Promise<TriggerTaskOutputDto> {
    const apiKey = await this.validateApiKeyUseCase.execute(input.apiKey)
    this.logger.debug(`Repository URL: ${input.args.repository_url}`)
    if ((input.args.repository_url ?? '') === '') {
      throw new ArgumentNotFoundError("repository_url argument is required")
    }
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

    const environment = [
      { name: 'TITVO_SCAN_TASK_ID', value: scanId }
    ]
    
    if (process.env.AWS_STAGE === 'localstack') {
      this.logger.warn('Using localstack environment variables')
      environment.push({ name: 'TITVO_DYNAMO_TASK_TABLE_NAME', value: process.env.TITVO_DYNAMO_TASK_TABLE_NAME as string })
      environment.push({ name: 'TITVO_DYNAMO_CONFIGURATION_TABLE_NAME', value: process.env.TITVO_DYNAMO_CONFIGURATION_TABLE_NAME as string })
      environment.push({ name: 'TITVO_ENCRYPTION_KEY_NAME', value: process.env.TITVO_ENCRYPTION_KEY_NAME as string })
      environment.push({ name: 'TITVO_LOG_LEVEL', value: process.env.TITVO_LOG_LEVEL?.toUpperCase() as string })
      this.logger.log('Environment variables: %s', environment)
    }
    const response = await this.batchService.submitJob(`${source as string}-security-scan-${scanId}`, jobQueue, jobDefinition, environment)
    await this.taskRepository.save({
      id: scanId,
      args: {
        ...args,
        repository_url: input.args.repository_url
      },
      jobId: response.jobId,
      source,
      repositoryId: `${apiKey.userId}:${repositorySlugHash}`,
      status: TaskStatus.IN_PROGRESS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    return {
      message: 'Scan starting',
      scanId,
    }
  }
}

@Injectable()
export class GetTaskStatusUseCase {
  private readonly logger = new Logger(GetTaskStatusUseCase.name)

  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly validateApiKeyUseCase: ValidateApiKeyUseCase,
    private readonly batchService: BatchService
  ) { }

  async execute(input: GetTaskStatusInputDto): Promise<GetTaskStatusOutputDto> {
    await this.validateApiKeyUseCase.execute(input.apiKey)
    if (input.scanId === undefined) {
      throw new ScanIdNotFoundError('Scan ID not found')
    }
    const task = await this.taskRepository.getById(input.scanId)
    if (task === null) {
      throw new TaskNotFoundError('Task not found')
    }
    if (task.status === TaskStatus.IN_PROGRESS || task.status === TaskStatus.PENDING) {
      const jobStatus = await this.batchService.getJobStatus(task.jobId!)
      this.logger.log(`Job ${task.jobId} status: ${jobStatus.status}`)
      if (jobStatus.isFailed) {
        task.status = TaskStatus.FAILED
        task.updatedAt = new Date().toISOString()
        await this.taskRepository.save(task)
        return {
          status: task.status,
          updatedAt: task.updatedAt,
          result: task.result
        }
      }
    }
    return {
      status: task.status,
      updatedAt: task.updatedAt,
      result: task.result
    }
  }
}
