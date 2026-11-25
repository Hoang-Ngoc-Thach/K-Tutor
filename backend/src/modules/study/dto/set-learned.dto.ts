import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class SetLearnedDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @IsUUID('all', { each: true })
  vocabularyIds: string[];

  // true = mark as learned, false = remove from the learned list.
  @IsBoolean()
  learned: boolean;
}
