import { Injectable } from '@nestjs/common'
import { TaskArgs, TaskSource } from '@core/task/task.entity'
import { ScmStrategy } from '@app/scm/scm.interface'
import { AesService } from '@titvo/shared'
import { GithubTokenNotFoundError, GithubRepoNameNotFoundError, GithubCommitShaNotFoundError, GithubAssigneeNotFoundError } from './github.error'

@Injectable()
export class GithubStrategy implements ScmStrategy {
  constructor (protected readonly aesService: AesService) {}
  supports (taskSource: TaskSource): boolean {
    return taskSource === TaskSource.GITHUB
  }

  async handle (taskArgs: TaskArgs): Promise<TaskArgs> {
    const { github_assignee: githubAssignee, github_repo_name: githubRepoName, github_token: githubToken, github_commit_sha: githubCommitSha } = taskArgs
    if (githubToken === undefined) {
      throw new GithubTokenNotFoundError('Github token not found')
    }
    if (githubRepoName === undefined) {
      throw new GithubRepoNameNotFoundError('Github repo not found')
    }
    if (githubCommitSha === undefined) {
      throw new GithubCommitShaNotFoundError('Github commit sha not found')
    }
    if (githubAssignee === undefined) {
      throw new GithubAssigneeNotFoundError('Github assignee not found')
    }
    return {
      repository_slug: githubRepoName,
      github_assignee: githubAssignee,
      github_repo_name: githubRepoName,
      github_token: await this.aesService.encrypt(githubToken),
      github_commit_sha: githubCommitSha
    }
  }
}
