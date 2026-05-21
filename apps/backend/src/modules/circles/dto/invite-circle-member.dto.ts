import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class InviteCircleMemberDto {
  @ApiProperty({
    description: 'Email address of user to invite',
    example: 'member@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Membership status for invited user',
    example: 'invited',
    enum: ['invited', 'accepted'],
    default: 'invited',
  })
  @IsString()
  @IsNotEmpty()
  status!: 'invited' | 'accepted';
}
