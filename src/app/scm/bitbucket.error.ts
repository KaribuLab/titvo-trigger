import { AppError } from '@titvo/shared'

export class BitbucketCommitShaNotFoundError extends AppError {
  constructor (message: string) {
    super('bitbucket-commit-sha-not-found', message)
  }
}

export class BitbucketWorkspaceNotFoundError extends AppError {
  constructor (message: string) {
    super('bitbucket-workspace-not-found', message)
  }
}

export class BitbucketRepoSlugNotFoundError extends AppError {
  constructor (message: string) {
    super('bitbucket-repo-slug-not-found', message)
  }
}

export class BitbucketProjectKeyNotFoundError extends AppError {
  constructor (message: string) {
    super('bitbucket-project-key-not-found', message)
  }
} 