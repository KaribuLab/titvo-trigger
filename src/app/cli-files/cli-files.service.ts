import { Injectable } from '@nestjs/common'
import { ConfigService, StorageService } from '@titvo/shared'
import { CliFilesRepository } from '@trigger/core/cli-files/cli-files.repository'
import { randomUUID } from 'crypto'
import { GetCliFilesSignedUrlsInputDo, GetCliFilesSignedUrlsOutputDto } from '@trigger/app/cli-files/cli-files.dto'

const ONE_DAY_IN_SECONDS = 60 * 60 * 24
const ONE_DAY_IN_MS = ONE_DAY_IN_SECONDS * 1000

@Injectable()
export class GetCliFilesSignedUrlsUseCase {
  constructor (private readonly configService: ConfigService, private readonly cliFilesRepository: CliFilesRepository, private readonly storageService: StorageService) {}
  async execute (input: GetCliFilesSignedUrlsInputDo): Promise<GetCliFilesSignedUrlsOutputDto> {
    const bucketName = await this.configService.get('cli_files_bucket_name')
    const presignedUrls = await Promise.all(input.files.map(async (file) => {
      const fileKey = `temp/${input.batchId}/${file.name}`
      const output = await this.storageService.getSignedUrl({
        containerName: bucketName,
        filePath: fileKey,
        contentType: file.contentType,
        expiresIn: ONE_DAY_IN_SECONDS
      })
      await this.cliFilesRepository.create({
        fileId: randomUUID(),
        batchId: input.batchId,
        fileKey,
        tti: Date.now() + ONE_DAY_IN_MS
      })
      return {
        [file.name]: output.url
      }
    }))
    return {
      message: 'Files urls generated successfully',
      urls: presignedUrls.reduce((acc, curr) => ({ ...acc, ...curr }), {})
    }
  }
}
