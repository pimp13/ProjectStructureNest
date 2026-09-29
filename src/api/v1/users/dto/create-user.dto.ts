import { ApiProperty } from '@nestjs/swagger';
import { InputJsonValue } from '@prisma/client/runtime/library';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ default: 'example@mail.com' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ default: null })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'حاوی عدد و حروف' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'Password must contain at least one letter and one number',
  })
  password!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(95)
  username!: string;

  @ApiProperty({ description: 'Metadata', default: null })
  @IsObject()
  @IsOptional()
  meta?: InputJsonValue | null;

  @ApiProperty({ description: 'Metadata', default: null })
  @IsNumber()
  @IsOptional()
  role?: number | null;
}
