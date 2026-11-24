import {
  BadGatewayException,
  HttpException,
  Injectable,
  Logger,
  Inject,
} from '@nestjs/common';
import { STORAGE_DRIVER } from './storage.constants';
import {
  StorageDriver,
  StorageFile,
  StorageKind,
  StorageUploadOptions,
  StoredFile,
} from './storage-driver.interface';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(@Inject(STORAGE_DRIVER) private readonly driver: StorageDriver) {}

  async upload(
    file: StorageFile,
    options: StorageUploadOptions,
  ): Promise<StoredFile> {
    try {
      return await this.driver.upload(file, options);
    } catch {
      this.logger.error('Storage upload failed');
      throw new BadGatewayException('STORAGE_UPLOAD_FAILED');
    }
  }

  async delete(publicId: string, kind: StorageKind): Promise<void> {
    try {
      await this.driver.delete(publicId, kind);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Storage delete failed');
      throw new BadGatewayException('STORAGE_DELETE_FAILED');
    }
  }
}
