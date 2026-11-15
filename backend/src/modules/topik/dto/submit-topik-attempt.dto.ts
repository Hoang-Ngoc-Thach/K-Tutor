import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class TopikAnswerDto {
  @IsUUID()
  questionId: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(3)
  answerIndex: number;
}

export class SubmitTopikAttemptDto {
  // Only answered questions are sent; the rest count as wrong.
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => TopikAnswerDto)
  answers: TopikAnswerDto[];

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(86400)
  durationSec: number;
}
