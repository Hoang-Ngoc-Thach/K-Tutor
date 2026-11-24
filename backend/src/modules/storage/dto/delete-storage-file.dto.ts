import { IsIn, IsString } from 'class-validator';
import { StorageKind } from '../storage-driver.interface';

export class DeleteStorageFileDto {
  @IsString()
  publicId: string;

  @IsIn(['image', 'audio'])
  kind: StorageKind;
}
