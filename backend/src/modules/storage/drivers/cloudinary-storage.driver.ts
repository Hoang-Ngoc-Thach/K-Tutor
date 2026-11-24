import { randomUUID } from 'crypto';
import { Readable } from 'stream';
import { NotFoundException } from '@nestjs/common';
import {
  UploadApiOptions,
  UploadApiResponse,
  v2 as cloudinary,
} from 'cloudinary';
import {
  StorageDriver,
  StorageFile,
  StorageKind,
  StorageUploadOptions,
  StoredFile,
} from '../storage-driver.interface';

export class CloudinaryStorageDriver implements StorageDriver {
  constructor(private readonly sdk: typeof cloudinary) {}

  async upload(
    file: StorageFile,
    options: StorageUploadOptions,
  ): Promise<StoredFile> {
    this.assertFolder(options.folder);
    const resourceType = options.kind === 'image' ? 'image' : 'video';
    const uploadOptions: UploadApiOptions = {
      resource_type: resourceType,
      folder: `ktutor/${options.folder}`,
      public_id: randomUUID(),
      overwrite: false,
      unique_filename: false,
      use_filename: false,
      use_asset_folder_as_public_id_prefix: true,
    };
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = this.sdk.uploader.upload_stream(
        uploadOptions,
        (error, uploaded) => {
          if (error) {
            reject(error);
            return;
          }
          if (!uploaded) {
            reject(new Error('Cloudinary returned no upload result'));
            return;
          }
          resolve(uploaded);
        },
      );
      Readable.from([file.buffer]).pipe(uploadStream);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      kind: options.kind,
      bytes: result.bytes,
      mimeType: file.mimeType,
    };
  }

  async delete(publicId: string, kind: StorageKind): Promise<void> {
    const folder = kind === 'image' ? 'images' : 'audio';
    const expectedPrefix = `ktutor/${folder}/`;
    const assetId = publicId.startsWith(expectedPrefix)
      ? publicId.slice(expectedPrefix.length)
      : '';

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        assetId,
      )
    ) {
      throw new NotFoundException('STORAGE_FILE_NOT_FOUND');
    }

    const result = await this.sdk.uploader.destroy(publicId, {
      resource_type: kind === 'image' ? 'image' : 'video',
    });
    if (result.result === 'not found') {
      throw new NotFoundException('STORAGE_FILE_NOT_FOUND');
    }
  }

  private assertFolder(folder: string): void {
    if (folder !== 'images' && folder !== 'audio') {
      throw new Error('Unsupported storage folder');
    }
  }
}
