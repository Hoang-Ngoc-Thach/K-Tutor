import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { resolve } from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { STORAGE_DRIVER } from './storage.constants';
import { CloudinaryStorageDriver } from './drivers/cloudinary-storage.driver';
import { LocalStorageDriver } from './drivers/local-storage.driver';
import { AdminUploadsController } from './admin-uploads.controller';
import { StorageService } from './storage.service';

@Module({
  controllers: [AdminUploadsController],
  providers: [
    {
      provide: STORAGE_DRIVER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const selectedDriver =
          configService.get<string>('STORAGE_DRIVER') || 'local';

        if (selectedDriver === 'local') {
          const port = configService.get<string>('PORT') || '3000';
          const configuredBaseUrl =
            configService.get<string>('PUBLIC_BASE_URL')?.trim() ||
            `http://localhost:${port}`;

          let publicBaseUrl: URL;
          try {
            publicBaseUrl = new URL(configuredBaseUrl);
          } catch {
            throw new Error(
              'PUBLIC_BASE_URL must be an absolute HTTP or HTTPS URL',
            );
          }
          if (
            !['http:', 'https:'].includes(publicBaseUrl.protocol) ||
            publicBaseUrl.username ||
            publicBaseUrl.password ||
            publicBaseUrl.search ||
            publicBaseUrl.hash ||
            publicBaseUrl.pathname !== '/'
          ) {
            throw new Error(
              'PUBLIC_BASE_URL must be an absolute HTTP or HTTPS origin without credentials, query, or fragment',
            );
          }

          return new LocalStorageDriver(
            resolve(__dirname, '..', '..', '..', 'uploads'),
            configuredBaseUrl.replace(/\/+$/, ''),
          );
        }

        if (selectedDriver === 'cloudinary') {
          const names = [
            'CLOUDINARY_CLOUD_NAME',
            'CLOUDINARY_API_KEY',
            'CLOUDINARY_API_SECRET',
          ] as const;
          const missing = names.filter(
            (name) => !configService.get<string>(name)?.trim(),
          );
          if (missing.length > 0) {
            throw new Error(
              `Missing required Cloudinary environment variables: ${missing.join(', ')}`,
            );
          }

          cloudinary.config({
            cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: configService.get<string>('CLOUDINARY_API_KEY'),
            api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
            secure: true,
          });
          return new CloudinaryStorageDriver(cloudinary);
        }

        throw new Error(
          'STORAGE_DRIVER must be either "local" or "cloudinary"',
        );
      },
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
