import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  authorId: string;

  @IsString()
  @IsNotEmpty()
  authorUsername: string;

  @IsString()
  @IsOptional()
  authorPhotoURL?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  content: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}
