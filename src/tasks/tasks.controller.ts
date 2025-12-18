import {Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards} from '@nestjs/common';
import {TasksService} from './tasks.service';
import type {Task}  from './task.entity';
import {CreateTaskDto} from './create-task.dto';
import {UpdateTaskDto} from './update-task.dto';
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
    user: {
        id: string;
        email: string;
        name: string;
    };
}

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
    constructor(private tasksService: TasksService) {}

    @Get()
    getTasks(@Req() req: RequestWithUser, @Query('status') status?: string) {
        console.log('The user who makes the request:', req.user);
        return this.tasksService.getAllTasks(status);
    }

    @Post()
    createTask(@Req() req: RequestWithUser, @Body() createTaskDto: CreateTaskDto) {
        console.log('The user creates a task:', req.user.email);
        return this.tasksService.createTask(
            createTaskDto.title,
            createTaskDto.description,
            createTaskDto.dueDate
        );
    }

    @Get(':id')
    getTaskById(@Param('id') id: string) {
        return this.tasksService.getTaskById(id);
    }


    @Put(':id')
    updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
        return this.tasksService.updateTask(id, updateTaskDto);
    }

    @Delete(':id')
    deleteTask(@Param('id') id: string) {
        return this.tasksService.deleteTask(id);
    }
}