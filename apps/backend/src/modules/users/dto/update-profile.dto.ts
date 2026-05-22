import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const GENDER_VALUES = ['male', 'female', 'other', 'prefer_not_to_say'] as const;
const RELATIONSHIP_STATUS_VALUES = [
  'single',
  'in_relationship',
  'engaged',
  'married',
  'complicated',
  'prefer_not_to_say',
] as const;

export class UpdateProfileDto {
  @ApiProperty({
    description: 'Updated display name',
    example: 'Candy User',
    minLength: 2,
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'Gender',
    example: 'female',
    required: false,
    enum: GENDER_VALUES,
  })
  @IsOptional()
  @IsIn(GENDER_VALUES)
  gender?: (typeof GENDER_VALUES)[number];

  @ApiProperty({
    description: 'Date of birth (YYYY-MM-DD)',
    example: '1998-04-23',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiProperty({
    description: 'Mobile number in international format',
    example: '+919999999999',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^\+?[0-9]{7,20}$/, {
    message: 'mobileNumber must be a valid phone number',
  })
  mobileNumber?: string;

  @ApiProperty({
    description: 'Relationship status',
    example: 'single',
    required: false,
    enum: RELATIONSHIP_STATUS_VALUES,
  })
  @IsOptional()
  @IsIn(RELATIONSHIP_STATUS_VALUES)
  relationshipStatus?: (typeof RELATIONSHIP_STATUS_VALUES)[number];
}