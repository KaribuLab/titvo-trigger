import { TaskStatus } from '@trigger/core/task/task.entity'

export class TaskTriggerInputDto {
  apiKey?: string
  source: string
  args: { [key: string]: string }
}

export class TaskTriggerOutputDto {
  message: string
  scanId: string
}

export class GetTaskStatusInputDto {
  scanId: string
  apiKey?: string
}

export class GetTaskStatusOutputDto {
  status: TaskStatus
  updatedAt: string
  result?: Record<string, string>
}
