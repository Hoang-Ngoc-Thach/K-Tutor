import { BadRequestException } from '@nestjs/common';
import { StorageKind } from './storage-driver.interface';

const UUID_PATTERN =
  '[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';

const PUBLIC_ID_PATTERNS: Record<StorageKind, RegExp[]> = {
  image: [
    new RegExp(`^images/${UUID_PATTERN}\\.(jpg|jpeg|png|webp)$`, 'i'),
    new RegExp(`^ktutor/images/${UUID_PATTERN}$`, 'i'),
  ],
  audio: [
    new RegExp(`^audio/${UUID_PATTERN}\\.(mp3|m4a|aac|wav|ogg)$`, 'i'),
    new RegExp(`^ktutor/audio/${UUID_PATTERN}$`, 'i'),
  ],
};

export function validatePublicId(publicId: string, kind: StorageKind): void {
  const isValid =
    typeof publicId === 'string' &&
    publicId.length <= 200 &&
    !publicId.includes('..') &&
    !publicId.includes('\\') &&
    !publicId.startsWith('/') &&
    !/^[a-z]:/i.test(publicId) &&
    !/%[0-9a-f]{2}/i.test(publicId) &&
    !publicId.includes('\0') &&
    PUBLIC_ID_PATTERNS[kind].some((pattern) => pattern.test(publicId));

  if (!isValid) {
    throw new BadRequestException('INVALID_PUBLIC_ID');
  }
}
