import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class ReviewResultDto {
  @IsUUID()
  vocabularyId: string;

  @IsBoolean()
  correct: boolean;
}

export class CompleteDailyReviewDto {
  // One entry per word answered across all stages of the session.
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => ReviewResultDto)
  results: ReviewResultDto[];
}
