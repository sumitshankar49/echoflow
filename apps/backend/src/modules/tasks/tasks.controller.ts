import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tasks for current user' })
  @ApiOkResponse({ description: 'Tasks fetched successfully', type: Task, isArray: true })
  findAll(@CurrentUser() currentUser: AuthenticatedUser): Promise<Task[]> {
    return this.tasksService.findAll(currentUser);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiCreatedResponse({ description: 'Task created successfully', type: Task })
  create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Task> {
    return this.tasksService.create(createTaskDto, currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by id' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiOkResponse({ description: 'Task fetched successfully', type: Task })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Task> {
    return this.tasksService.findOne(id, currentUser);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing task by id' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiOkResponse({ description: 'Task updated successfully', type: Task })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Task> {
    return this.tasksService.update(id, updateTaskDto, currentUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a task by id' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiOkResponse({
    description: 'Task deleted successfully',
    schema: { example: { message: 'Task deleted successfully' } },
  })
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<{ message: string }> {
    return this.tasksService.remove(id, currentUser);
  }
}
