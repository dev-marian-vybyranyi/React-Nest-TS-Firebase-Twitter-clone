import {
  IsEmail,
  IsOptional,
  IsString,
  isURL,
  IsUrl,
  MinLength,
} from 'class-validator';

export class CreateAuthDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  surname: string;

  @IsUrl()
  @IsOptional()
  photo?: string;
}
