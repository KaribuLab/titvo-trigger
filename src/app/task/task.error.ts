import { AppError } from '@titvo/shared'

export class RepositoryIdUndefinedException extends AppError {
  constructor () {
    super('repository-id-undefined', 'Repository ID is undefined')
  }
}

export class ScanIdNotFoundError extends AppError {
  constructor (message: string) {
    super('scan-id-not-found', message)
    this.name = 'ScanIdNotFoundError'
  }
}

export class TaskNotFoundError extends AppError {
  constructor (message: string) {
    super('task-not-found', message)
    this.name = 'TaskNotFoundError'
  }
}
