import { IsOptional, IsUUID } from 'class-validator';

export class LearnedQueryDto {
  @IsOptional()
  @IsUUID()
  topicId?: string;
}
