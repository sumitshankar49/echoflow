import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,100}$/;
const STRONG_PASSWORD_MESSAGE =
  'Password must be 8-100 characters and include uppercase, lowercase, number, and special character';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token from email link',
    example: '6fd0e4cb770c31cb491e45b4eb728d2250f06d98d4c988f3a940cb43fa15a4fa',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    description: 'New account password',
    example: 'NewStrongPass123!',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  @Matches(STRONG_PASSWORD_REGEX, { message: STRONG_PASSWORD_MESSAGE })
  newPassword!: string;

  @ApiProperty({
    description: 'Confirm the new account password',
    example: 'NewStrongPass123!',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  @Matches(STRONG_PASSWORD_REGEX, { message: STRONG_PASSWORD_MESSAGE })
  confirmPassword!: string;
}