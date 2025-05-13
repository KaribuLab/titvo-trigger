export interface CliFile {
  name: string
  contentType: string
}

export class GetCliFilesSignedUrlsInputDo {
  apiKey?: string
  batchId: string
  source: string
  files: CliFile[]
}

export class GetCliFilesSignedUrlsOutputDto {
  message: string
  urls: Record<string, string>
}
