import { BadRequestException } from '@nestjs/common';
import { validateUploadFile } from './upload-validation';

describe('validateUploadFile', () => {
  it('accepts a PNG only when the declared type, extension, and signature agree', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    expect(() =>
      validateUploadFile(
        { originalname: 'sample.png', mimetype: 'image/png', buffer: png },
        'image',
      ),
    ).not.toThrow();
    expect(() =>
      validateUploadFile(
        {
          originalname: 'sample.png',
          mimetype: 'image/png',
          buffer: Buffer.from('<svg>'),
        },
        'image',
      ),
    ).toThrow(new BadRequestException('UNSUPPORTED_FILE_TYPE'));
  });

  it('accepts WAV content and rejects text disguised as MP3', () => {
    const wav = Buffer.alloc(12);
    wav.write('RIFF', 0, 'ascii');
    wav.write('WAVE', 8, 'ascii');

    expect(() =>
      validateUploadFile(
        { originalname: 'sample.wav', mimetype: 'audio/wav', buffer: wav },
        'audio',
      ),
    ).not.toThrow();
    expect(() =>
      validateUploadFile(
        {
          originalname: 'sample.mp3',
          mimetype: 'audio/mpeg',
          buffer: Buffer.from('not audio'),
        },
        'audio',
      ),
    ).toThrow('UNSUPPORTED_FILE_TYPE');
  });

  it('rejects supported signatures with a mismatched declared type or extension', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    expect(() =>
      validateUploadFile(
        { originalname: 'sample.jpg', mimetype: 'image/png', buffer: png },
        'image',
      ),
    ).toThrow('UNSUPPORTED_FILE_TYPE');
  });
});
