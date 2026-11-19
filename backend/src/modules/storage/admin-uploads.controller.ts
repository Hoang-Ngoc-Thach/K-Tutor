import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ResponseMessage } from '../../decorator/customize';
import { Roles } from '../../decorator/roles.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { DeleteStorageFileDto } from './dto/delete-storage-file.dto';
import { FileTooLargeExceptionFilter } from './file-too-large.filter';
import { StorageKind } from './storage-driver.interface';
import { StorageService } from './storage.service';
import { validatePublicId } from './public-id-validation';
import { validateUploadFile } from './upload-validation';

const IMAGE_MAX_FILE_SIZE = 5 * 1024 * 1024;
const AUDIO_MAX_FILE_SIZE = 90 * 1024 * 1024;

@Controller('admin/uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUploadsController {
  constructor(private readonly storageService: StorageService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: IMAGE_MAX_FILE_SIZE, files: 1 },
    }),
  )
  @UseFilters(FileTooLargeExceptionFilter)
  @ResponseMessage('Upload image successfully')
  uploadImage(@UploadedFile() file: Express.Multer.File | undefined) {
    return this.upload(file, 'image', 'images');
  }

  @Post('audio')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: AUDIO_MAX_FILE_SIZE, files: 1 },
    }),
  )
  @UseFilters(FileTooLargeExceptionFilter)
  @ResponseMessage('Upload audio successfully')
  uploadAudio(@UploadedFile() file: Express.Multer.File | undefined) {
    return this.upload(file, 'audio', 'audio');
  }

  @Delete()
  @ResponseMessage('Delete uploaded file successfully')
  async delete(@Body() dto: DeleteStorageFileDto): Promise<null> {
    validatePublicId(dto.publicId, dto.kind);
    await this.storageService.delete(dto.publicId, dto.kind);
    return null;
  }

  private upload(
    file: Express.Multer.File | undefined,
    kind: StorageKind,
    folder: string,
  ) {
    if (!file) {
      throw new BadRequestException('FILE_REQUIRED');
    }
    validateUploadFile(file, kind);
    return this.storageService.upload(
      {
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype.toLowerCase(),
      },
      { kind, folder },
    );
  }
}
