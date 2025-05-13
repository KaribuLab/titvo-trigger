import { AppError } from '@titvo/shared'

export class GithubTokenNotFoundError extends AppError {
  constructor (message: string) {
    super('github-token-not-found', message)
  }
}

export class GithubRepoNameNotFoundError extends AppError {
  constructor (message: string) {
    super('github-repo-name-not-found', message)
  }
}

export class GithubCommitShaNotFoundError extends AppError {
  constructor (message: string) {
    super('github-commit-sha-not-found', message)
  }
}

export class GithubAssigneeNotFoundError extends AppError {
  constructor (message: string) {
    super('github-assignee-not-found', message)
  }
}
