import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import { StorageKind } from './storage-driver.interface';

interface UploadFormat {
  kind: StorageKind;
  extension: string;
  mimeTypes: string[];
  signature: 'jpeg' | 'png' | 'webp' | 'mp3' | 'mp4' | 'aac' | 'wav' | 'ogg';
}

const UPLOAD_FORMATS: UploadFormat[] = [
  {
    kind: 'image',
    extension: '.jpg',
    mimeTypes: ['image/jpeg'],
    signature: 'jpeg',
  },
  {
    kind: 'image',
    extension: '.jpeg',
    mimeTypes: ['image/jpeg'],
    signature: 'jpeg',
  },
  {
    kind: 'image',
    extension: '.png',
    mimeTypes: ['image/png'],
    signature: 'png',
  },
  {
    kind: 'image',
    extension: '.webp',
    mimeTypes: ['image/webp'],
    signature: 'webp',
  },
  {
    kind: 'audio',
    extension: '.mp3',
    mimeTypes: ['audio/mpeg', 'audio/mp3'],
    signature: 'mp3',
  },
  {
    kind: 'audio',
    extension: '.m4a',
    mimeTypes: ['audio/mp4', 'audio/x-m4a'],
    signature: 'mp4',
  },
  {
    kind: 'audio',
    extension: '.aac',
    mimeTypes: ['audio/aac'],
    signature: 'aac',
  },
  {
    kind: 'audio',
    extension: '.wav',
    mimeTypes: ['audio/wav', 'audio/x-wav'],
    signature: 'wav',
  },
  {
    kind: 'audio',
    extension: '.ogg',
    mimeTypes: ['audio/ogg', 'application/ogg'],
    signature: 'ogg',
  },
];

export function hasValidFileSignature(
  buffer: Buffer,
  signature: UploadFormat['signature'],
): boolean {
  switch (signature) {
    case 'jpeg':
      return (
        buffer.length >= 3 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff
      );
    case 'png':
      return (
        buffer.length >= 8 &&
        buffer
          .subarray(0, 8)
          .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
      );
    case 'webp':
      return (
        buffer.length >= 12 &&
        buffer.toString('ascii', 0, 4) === 'RIFF' &&
        buffer.toString('ascii', 8, 12) === 'WEBP'
      );
    case 'mp3':
      return (
        (buffer.length >= 3 && buffer.toString('ascii', 0, 3) === 'ID3') ||
        (buffer.length >= 2 &&
          buffer[0] === 0xff &&
          (buffer[1] & 0xe0) === 0xe0)
      );
    case 'mp4': {
      if (buffer.length < 12 || buffer.toString('ascii', 4, 8) !== 'ftyp') {
        return false;
      }
      const brand = buffer.toString('ascii', 8, 12);
      return ['M4A ', 'M4B ', 'M4P ', 'isom', 'mp41', 'mp42'].includes(brand);
    }
    case 'aac':
      return (
        buffer.length >= 2 && buffer[0] === 0xff && (buffer[1] & 0xf6) === 0xf0
      );
    case 'wav':
      return (
        buffer.length >= 12 &&
        buffer.toString('ascii', 0, 4) === 'RIFF' &&
        buffer.toString('ascii', 8, 12) === 'WAVE'
      );
    case 'ogg':
      return buffer.length >= 4 && buffer.toString('ascii', 0, 4) === 'OggS';
  }
}

export function validateUploadFile(
  file: Pick<Express.Multer.File, 'originalname' | 'mimetype' | 'buffer'>,
  kind: StorageKind,
): void {
  const extension = extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();
  const format = UPLOAD_FORMATS.find(
    (candidate) =>
      candidate.kind === kind &&
      candidate.extension === extension &&
      candidate.mimeTypes.includes(mimeType),
  );

  if (
    !format ||
    !Buffer.isBuffer(file.buffer) ||
    !hasValidFileSignature(file.buffer, format.signature)
  ) {
    throw new BadRequestException('UNSUPPORTED_FILE_TYPE');
  }
}

export function getSafeFileExtension(
  mimeType: string,
  kind: StorageKind,
): string {
  const format = UPLOAD_FORMATS.find(
    (candidate) =>
      candidate.kind === kind &&
      candidate.mimeTypes.includes(mimeType.toLowerCase()),
  );
  if (!format) {
    throw new BadRequestException('UNSUPPORTED_FILE_TYPE');
  }
  return format.extension;
}
