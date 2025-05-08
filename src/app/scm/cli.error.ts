import { AppError } from '@titvo/shared'

export class BatchIdNotFoundError extends AppError {
  constructor (message: string) {
    super('batch-id-not-found', message)
  }
}

export class BatchIdRequiredError extends AppError {
  constructor (message: string) {
    super('batch-id-required', message)
  }
}

export class RepositoryUrlRequiredError extends AppError {
  constructor (message: string) {
    super('repository-url-required', message)
  }
}

export class RepositoryUrlInvalidError extends AppError {
  constructor (message: string) {
    super('repository-url-invalid', message)
  }
}
