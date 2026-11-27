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
  @Transform(({ value }: { value: unknown }) =>
    value === null || value === '' ? null : Number(value),
  )
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Validate(IsListeningAudioTimeConstraint)
  audioStartSec?: number | null;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === null || value === '' ? null : Number(value),
  )
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Validate(IsListeningAudioTimeConstraint)
  @Validate(IsAudioEndAfterStartConstraint)
  audioEndSec?: number | null;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  category?: string;
}
