import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  Validate,
} from 'class-validator';
import { TopikSection } from '../entities/topik-question.entity';
import {
  IsAllowedTopikMediaUrlConstraint,
  IsAudioEndAfterStartConstraint,
  IsListeningAudioTimeConstraint,
  IsStoragePublicIdConstraint,
} from './topik-media.validation';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const transformAudioTime = ({ value }: { value: unknown }) => {
  if (value === null || value === '') return null;

  if (typeof value === 'number') {
    return !Number.isInteger(value) && Math.abs(value) < 1e-6
      ? String(value)
      : value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const parsed = Number(trimmed);
    return !Number.isInteger(parsed) && Math.abs(parsed) < 1e-6
      ? trimmed
      : parsed;
  }

  return value;
};

export class TopikQuestionDto {
  @IsEnum(TopikSection)
  section: TopikSection;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  text: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(5000)
  passage?: string;

  // Required for listening questions (checked in the service).
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(3000)
  script?: string;

  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value)
      ? value.map((item) => (typeof item === 'string' ? item.trim() : item))
      : value,
  )
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(300, { each: true })
  options: string[];

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(3)
  answerIndex: number;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(2000)
  explanation?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(2048)
  @Validate(IsAllowedTopikMediaUrlConstraint)
  imageUrl?: string | null;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(200)
  @Validate(IsStoragePublicIdConstraint, ['image'])
  imagePublicId?: string | null;

  @IsOptional()
  @Transform(transformAudioTime)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(999999999.9)
  @Validate(IsListeningAudioTimeConstraint)
  audioStartSec?: number | null;

  @IsOptional()
  @Transform(transformAudioTime)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(999999999.9)
  @Validate(IsListeningAudioTimeConstraint)
  @Validate(IsAudioEndAfterStartConstraint)
  audioEndSec?: number | null;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  category?: string;
}
