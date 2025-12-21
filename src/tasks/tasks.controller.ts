import {Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards, ValidationPipe} from '@nestjs/common';
import {TasksService} from './tasks.service';
import {CreateTaskDto} from './dto/create-task.dto';
import {UpdateTaskDto} from './dto/update-task.dto';
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard';
import {GetTasksDto} from './dto/get-tasks.dto';
import {CurrentUser} from '../auth/decorators/current-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
    constructor(private tasksService: TasksService) {}

    @Get()
    getTasks(
        @CurrentUser() user: { id: string },
        @Query(new ValidationPipe({ transform: true })) filterDto: GetTasksDto
    ) {
        return this.tasksService.getAllTasks(
            user.id,
            filterDto.status,
            filterDto.page,
            filterDto.limit,
            filterDto.sortBy,
            filterDto.order
        );
    }

    @Post()
    createTask(
        @CurrentUser() user: { id: string },
        @Body() createTaskDto: CreateTaskDto
    ) {
        return this.tasksService.createTask(
            user.id,
            createTaskDto.title,
            createTaskDto.description,
            createTaskDto.dueDate
        );
    }

    @Get(':id')
    getTaskById(
        @CurrentUser() user: { id: string },
        @Param('id') id: string
    ) {
        return this.tasksService.getTaskById(user.id, id);
    }

    @Put(':id')
    updateTask(
        @CurrentUser() user: { id: string },
        @Param('id') id: string,
        @Body() updateTaskDto: UpdateTaskDto,
    ) {
        return this.tasksService.updateTask(user.id, id, updateTaskDto);
    }

    @Delete(':id')
    deleteTask(
        @CurrentUser() user: { id: string },
        @Param('id') id: string
    ) {
        return this.tasksService.deleteTask(user.id, id);
    }
}