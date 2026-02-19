import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  content: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}
