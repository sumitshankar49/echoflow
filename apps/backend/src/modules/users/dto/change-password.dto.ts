import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current account password',
    example: 'CurrentPass123!',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  currentPassword!: string;

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