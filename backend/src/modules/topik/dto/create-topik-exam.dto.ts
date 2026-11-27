import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  Validate,
  ValidateNested,
} from 'class-validator';
import { TOPIK_LEVELS, TopikExamStatus } from '../entities/topik-exam.entity';
import {
  IsAllowedTopikMediaUrlConstraint,
  IsStoragePublicIdConstraint,
} from './topik-media.validation';
import { TopikQuestionDto } from './topik-question.dto';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateTopikExamDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsIn(TOPIK_LEVELS)
  level: string;

  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(50)
  round?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(300)
  durationMinutes: number;

  @IsOptional()
  @IsEnum(TopikExamStatus)
  status?: TopikExamStatus;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(2048)
  @Validate(IsAllowedTopikMediaUrlConstraint)
  audioUrl?: string | null;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(200)
  @Validate(IsStoragePublicIdConstraint, ['audio'])
  audioPublicId?: string | null;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => TopikQuestionDto)
  questions: TopikQuestionDto[];
}
