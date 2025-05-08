import { CliFileEntity } from '@core/cli-files/cli-files.entity'

export abstract class CliFilesRepository {
  abstract findByBatchId(batchId: string): Promise<CliFileEntity[]>
}