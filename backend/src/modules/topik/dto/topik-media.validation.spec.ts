import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTopikExamDto } from './create-topik-exam.dto';

const validExam = {
  title: 'TOPIK I practice',
  level: 'TOPIK I',
  year: 2026,
  durationMinutes: 40,
  questions: [
    {
      section: 'listening',
      text: 'Choose the correct response.',
      script: '안녕하세요.',
      options: ['A', 'B', 'C', 'D'],
      answerIndex: 0,
    },
  ],
};

const AUDIO_ID = 'audio/550e8400-e29b-41d4-a716-446655440000.mp3';
const IMAGE_ID = 'images/550e8400-e29b-41d4-a716-446655440000.png';

async function getValidationMessages(exam: Record<string, unknown>) {
  const instance = plainToInstance(CreateTopikExamDto, exam);
  const errors = await validate(instance);
  const messages: string[] = [];

  function collect(error: (typeof errors)[number]) {
    messages.push(...Object.values(error.constraints ?? {}));
    error.children?.forEach(collect);
  }

  errors.forEach(collect);
  return messages;
}

describe('TOPIK media DTO validation', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalStorageDriver = process.env.STORAGE_DRIVER;

  afterEach(() => {
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
    if (originalStorageDriver === undefined) {
      delete process.env.STORAGE_DRIVER;
    } else {
      process.env.STORAGE_DRIVER = originalStorageDriver;
    }
  });

  it('rejects an audio end time that is not greater than its start time', async () => {
    const exam = {
      ...validExam,
      questions: [
        {
          ...validExam.questions[0],
          audioStartSec: 2.5,
          audioEndSec: 2.5,
        },
      ],
    };

    expect(await getValidationMessages(exam)).toContain(
      'Audio end time must be greater than start time',
    );
  });

  it('allows audio times only for listening questions', async () => {
    const exam = {
      ...validExam,
      questions: [
        {
          ...validExam.questions[0],
          section: 'reading',
          audioStartSec: 1,
        },
      ],
    };

    expect(await getValidationMessages(exam)).toContain(
      'Audio times are only allowed for listening questions',
    );
  });

  it('rejects negative audio times and values with more than one decimal place', async () => {
    const exam = {
      ...validExam,
      questions: [
        {
          ...validExam.questions[0],
          audioStartSec: -0.1,
          audioEndSec: 1.25,
        },
      ],
    };

    const messages = await getValidationMessages(exam);
    expect(messages).toContain('audioStartSec must not be less than 0');
    expect(messages).toContain(
      'audioEndSec must be a number conforming to the specified constraints',
    );
  });

  it('accepts HTTPS URLs with storage IDs that match their media kind', async () => {
    const exam = {
      ...validExam,
      audioUrl: 'https://res.cloudinary.com/demo/video/upload/audio.mp3',
      audioPublicId: 'ktutor/audio/550e8400-e29b-41d4-a716-446655440000',
      questions: [
        {
          ...validExam.questions[0],
          imageUrl: 'https://res.cloudinary.com/demo/image/upload/image.png',
          imagePublicId: 'ktutor/images/550e8400-e29b-41d4-a716-446655440000',
          audioStartSec: 1.2,
          audioEndSec: 3.4,
        },
      ],
    };

    expect(await getValidationMessages(exam)).toEqual([]);
  });

  it('rejects insecure URLs and public IDs invalid for the media kind', async () => {
    process.env.NODE_ENV = 'production';
    process.env.STORAGE_DRIVER = 'cloudinary';
    const exam = {
      ...validExam,
      audioUrl: 'http://example.com/audio.mp3',
      audioPublicId: IMAGE_ID,
      questions: [
        {
          ...validExam.questions[0],
          imageUrl: 'https://user:pass@example.com/image.png',
          imagePublicId: AUDIO_ID,
        },
      ],
    };

    const messages = await getValidationMessages(exam);
    expect(messages).toContain('Media URLs must use HTTPS');
    expect(messages).toContain('The storage public ID is invalid');
  });

  it('accepts HTTP media URLs only for the local driver in development', async () => {
    process.env.NODE_ENV = 'development';
    process.env.STORAGE_DRIVER = 'local';
    const exam = {
      ...validExam,
      audioUrl: 'http://localhost:3000/uploads/audio/file.mp3',
      audioPublicId: AUDIO_ID,
      questions: [
        {
          ...validExam.questions[0],
          imageUrl: 'http://localhost:3000/uploads/images/file.png',
          imagePublicId: IMAGE_ID,
        },
      ],
    };

    expect(await getValidationMessages(exam)).toEqual([]);
  });
});
