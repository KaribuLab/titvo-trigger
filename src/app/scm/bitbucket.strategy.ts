import { Injectable } from '@nestjs/common'
import { TaskArgs, TaskSource } from '@core/task/task.entity'
import { ScmStrategy } from '@app/scm/scm.interface'
import { AesService } from '@titvo/shared'
import { BitbucketCommitShaNotFoundError, BitbucketWorkspaceNotFoundError, BitbucketRepoSlugNotFoundError, BitbucketProjectKeyNotFoundError } from './bitbucket.error'

@Injectable()
export class BitbucketStrategy implements ScmStrategy {
  constructor (protected readonly aesService: AesService) {}
  supports (taskSource: TaskSource): boolean {
    return taskSource === TaskSource.BITBUCKET
  }

  async handle (taskArgs: TaskArgs): Promise<TaskArgs> {
    const { bitbucket_commit: bitbucketCommit, bitbucket_workspace: bitbucketWorkspace, bitbucket_repo_slug: bitbucketRepoSlug, bitbucket_project_key: bitbucketProjectKey } = taskArgs

    if (bitbucketCommit === undefined) {
      throw new BitbucketCommitShaNotFoundError('Bitbucket commit sha not found')
    }

    if (bitbucketWorkspace === undefined) {
      throw new BitbucketWorkspaceNotFoundError('Bitbucket workspace not found')
    }
    if (bitbucketRepoSlug === undefined) {
      throw new BitbucketRepoSlugNotFoundError('Bitbucket repo slug not found')
    }
    if (bitbucketProjectKey === undefined) {
      throw new BitbucketProjectKeyNotFoundError('Bitbucket project key not found')
    }

    return {
      repository_slug: `${bitbucketWorkspace}/${bitbucketRepoSlug}`,
      bitbucket_commit: bitbucketCommit,
      bitbucket_workspace: bitbucketWorkspace,
      bitbucket_repo_slug: bitbucketRepoSlug,
      bitbucket_project_key: bitbucketProjectKey
    }
  }
}
