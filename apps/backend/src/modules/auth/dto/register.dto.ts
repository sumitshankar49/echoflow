import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,100}$/;
const STRONG_PASSWORD_MESSAGE =
  'Password must be 8-100 characters and include uppercase, lowercase, number, and special character';

export class RegisterDto {
  @ApiProperty({
    description: 'Display name of the user',
    example: 'Candy User',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Unique email address',
    example: 'candy@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Account password (min 8 characters)',
    example: 'StrongPass123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  @Matches(STRONG_PASSWORD_REGEX, { message: STRONG_PASSWORD_MESSAGE })
  password!: string;

  @ApiProperty({
    description: 'Confirm account password (must match password)',
    example: 'StrongPass123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  @Matches(STRONG_PASSWORD_REGEX, { message: STRONG_PASSWORD_MESSAGE })
  confirmPassword!: string;

  @ApiProperty({
    description: 'Optional circle invitation id to auto-join after signup',
    example: '8470473c-803f-4b8b-b288-2ce6e5ca2ac5',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  inviteCircleId?: string;
}
