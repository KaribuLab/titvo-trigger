import { Injectable } from '@nestjs/common'
import { TaskArgs, TaskSource } from '@trigger/core/task/task.entity'
import { ScmStrategy } from '@trigger/app/scm/scm.interface'
import { CliFilesRepository } from '@trigger/core/cli-files/cli-files.repository'
import { BatchIdNotFoundError, BatchIdRequiredError, RepositoryUrlRequiredError, RepositoryUrlInvalidError } from '@trigger/app/scm/cli.error'

@Injectable()
export class CliStrategy implements ScmStrategy {
  constructor (private readonly cliFilesRepository: CliFilesRepository) {}
  supports (taskSource: TaskSource): boolean {
    return taskSource === TaskSource.CLI
  }

  async handle (taskArgs: TaskArgs): Promise<TaskArgs> {
    const { batch_id: batchId, repository_url: repositoryUrl } = taskArgs
    if (batchId === undefined) {
      throw new BatchIdRequiredError('Batch ID is required')
    }
    const files = await this.cliFilesRepository.findByBatchId(batchId)
    if (files.length === 0) {
      throw new BatchIdNotFoundError(`Batch ID not found ${batchId}`)
    }
    if (repositoryUrl === undefined) {
      throw new RepositoryUrlRequiredError('Repository URL is required')
    }
    let repositorySlug: string | undefined
    if ((repositoryUrl).startsWith('git@')) {
      repositorySlug = (repositoryUrl).replace(/^git@[^:]+:(.+)$/, '$1').replace(/\.git$/, '')
    } else if ((repositoryUrl).startsWith('http')) {
      repositorySlug = new URL(repositoryUrl).pathname.slice(1).replace(/\.git$/, '')
    }
    if (repositorySlug === undefined) {
      throw new RepositoryUrlInvalidError('Repository URL is invalid')
    }
    return {
      batch_id: batchId,
      repository_slug: repositorySlug
    }
  }
}
