import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

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
  newPassword!: string;

  @ApiProperty({
    description: 'Confirm the new account password',
    example: 'NewStrongPass123!',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  confirmPassword!: string;
}