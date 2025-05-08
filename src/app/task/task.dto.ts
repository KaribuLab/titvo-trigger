export class TaskTriggerInputDto {
  apiKey?: string
  source: string
  args: { [key: string]: string }
}

export class TaskTriggerOutputDto {
  message: string
  scanId: string
}
