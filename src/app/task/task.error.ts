import { AppError } from '@titvo/shared'

export class RepositoryIdUndefinedException extends AppError {
  constructor() {
    super('repository-id-undefined', 'Repository ID is undefined')
  }
} 