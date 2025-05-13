import { TaskEntity } from '@trigger/core/task/task.entity'

export interface TaskRepositoryOptions {
  tableName: string
  awsStage: string
  awsEndpoint: string
}

export abstract class TaskRepository {
  abstract save (document: TaskEntity): Promise<void>

  abstract getById (scanId: string): Promise<TaskEntity | null>
}
