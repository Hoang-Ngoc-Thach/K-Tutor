import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { join, resolve, sep } from 'path';
import { NotFoundException } from '@nestjs/common';
import {
  StorageDriver,
  StorageFile,
  StorageKind,
  StorageUploadOptions,
  StoredFile,
} from '../storage-driver.interface';
import { getSafeFileExtension } from '../upload-validation';

const UUID_FILE_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|mp3|m4a|aac|wav|ogg)$/i;

export class LocalStorageDriver implements StorageDriver {
  constructor(
    private readonly uploadsDirectory: string,
    private readonly publicBaseUrl: string,
  ) {}

  async upload(
    file: StorageFile,
    options: StorageUploadOptions,
  ): Promise<StoredFile> {
    this.assertFolder(options.folder);
    const extension = getSafeFileExtension(file.mimeType, options.kind);
    const filename = `${randomUUID()}${extension}`;
    const folderPath = join(this.uploadsDirectory, options.folder);

    await mkdir(folderPath, { recursive: true });
    await writeFile(join(folderPath, filename), file.buffer, {
      flag: 'wx',
      mode: 0o640,
    });

    return {
      url: `${this.publicBaseUrl}/uploads/${options.folder}/${filename}`,
      publicId: `${options.folder}/${filename}`,
      kind: options.kind,
      bytes: file.buffer.length,
      mimeType: file.mimeType,
    };
  }

  async delete(publicId: string, kind: StorageKind): Promise<void> {
    const folder = kind === 'image' ? 'images' : 'audio';
    const prefix = `${folder}/`;
    const filename = publicId.startsWith(prefix)
      ? publicId.slice(prefix.length)
      : '';

    if (!UUID_FILE_PATTERN.test(filename)) {
      throw new NotFoundException('STORAGE_FILE_NOT_FOUND');
    }

    const uploadsRoot = resolve(this.uploadsDirectory);
    const filePath = resolve(uploadsRoot, folder, filename);
    const rootPrefix = uploadsRoot.endsWith(sep)
      ? uploadsRoot
      : `${uploadsRoot}${sep}`;
    if (!filePath.startsWith(rootPrefix)) {
      throw new NotFoundException('STORAGE_FILE_NOT_FOUND');
    }

    try {
      await unlink(filePath);
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        throw new NotFoundException('STORAGE_FILE_NOT_FOUND');
      }
      throw error;
    }
  }

  private assertFolder(folder: string): void {
    if (folder !== 'images' && folder !== 'audio') {
      throw new Error('Unsupported storage folder');
    }
  }
}
