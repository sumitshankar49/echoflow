import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,100}$/;
const STRONG_PASSWORD_MESSAGE =
  'Password must be 8-100 characters and include uppercase, lowercase, number, and special character';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Registered email address',
    example: 'candy@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: '6-digit OTP received by email',
    example: '482915',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'OTP must be exactly 6 digits' })
  otp!: string;

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