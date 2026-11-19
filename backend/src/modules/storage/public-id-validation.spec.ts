import { BadRequestException } from '@nestjs/common';
import { StorageKind } from './storage-driver.interface';
import { validatePublicId } from './public-id-validation';

const UUID = '123e4567-e89b-42d3-a456-426614174000';

describe('validatePublicId', () => {
  it.each([
    ['image local ID', `images/${UUID}.png`, 'image'],
    ['image Cloudinary ID', `ktutor/images/${UUID}`, 'image'],
    ['audio local ID', `audio/${UUID}.wav`, 'audio'],
    ['audio Cloudinary ID', `ktutor/audio/${UUID}`, 'audio'],
  ])('accepts a generated %s', (_name, publicId, kind) => {
    expect(() => validatePublicId(publicId, kind as StorageKind)).not.toThrow();
  });

  it.each([
    ['../../kt-nonexistent-check', 'image'],
    ['ktutor/images/../../x', 'image'],
    ['..\\..\\x', 'image'],
    ['/etc/passwd', 'image'],
    ['C:\\Windows\\win.ini', 'image'],
    ['%2e%2e/%2e%2e/x', 'image'],
    [`images/${UUID}.png\0`, 'image'],
    [`images/${UUID}.png${'x'.repeat(201)}`, 'image'],
    [`audio/${UUID}.wav`, 'image'],
    [`images/${UUID}.wav`, 'image'],
  ])('rejects invalid publicId %s for kind %s', (publicId, kind) => {
    expect(() => validatePublicId(publicId, kind as StorageKind)).toThrow(
      new BadRequestException('INVALID_PUBLIC_ID'),
    );
  });
});
