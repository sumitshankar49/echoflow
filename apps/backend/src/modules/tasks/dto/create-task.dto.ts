import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsArray,
	IsBoolean,
	IsDateString,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator';

import { TaskPriorityEnum } from './task-priority.enum';

export class CreateTaskDto {
	@ApiProperty({
		description: 'Task title',
		example: 'Finish project proposal',
		minLength: 1,
		maxLength: 200,
	})
	@IsString()
	@IsNotEmpty()
	@MinLength(1)
	@MaxLength(200)
	title!: string;

	@ApiPropertyOptional({
		description: 'Detailed task description',
		example: 'Draft the final proposal document and share it with the team.',
	})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({
		description: 'Task due date and time',
		example: '2026-06-05T14:00:00.000Z',
	})
	@IsDateString()
	dueDate!: string;

	@ApiProperty({
		description: 'Task priority',
		enum: TaskPriorityEnum,
		example: TaskPriorityEnum.MEDIUM,
	})
	@IsEnum(TaskPriorityEnum)
	priority!: TaskPriorityEnum;

	@ApiPropertyOptional({
		description: 'Whether the task is completed',
		example: false,
		default: false,
	})
	@IsOptional()
	@IsBoolean()
	isCompleted?: boolean;

	@ApiPropertyOptional({
		description: 'Optional task tags',
		example: ['work', 'planning'],
		type: [String],
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	tags?: string[];
}
