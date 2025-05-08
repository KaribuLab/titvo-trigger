export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ERROR = 'ERROR'
}

export enum TaskSource {
  GITHUB = 'github',
  BITBUCKET = 'bitbucket',
  GITLAB = 'gitlab',
  CLI = 'cli',
}

export interface TaskArgs {
  [key: string]: string
}

export interface TaskEntity {
  id?: string
  source: TaskSource
  repositoryId: string
  args: TaskArgs
  status: TaskStatus
  createdAt: string
  updatedAt: string
}
