import { IsUUID } from 'class-validator';

// Các trường text đi kèm file Excel (multipart/form-data).
export class ImportContentDto {
  @IsUUID()
  topicId: string;
}
