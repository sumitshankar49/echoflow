import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class InviteCircleMemberDto {
  @ApiProperty({
    description: 'Email of user to invite to this circle',
    example: 'member@example.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(150)
  email!: string;
}