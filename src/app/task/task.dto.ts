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

export class TaskStatusInputDto {
  scanId: string
  apiKey?: string
}

export class TaskStatusOutputDto {
  status: TaskStatus
  updatedAt: string
  result?: Record<string, string>
}
