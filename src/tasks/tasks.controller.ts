import {Body, Controller, Delete, Get, Param, Post, Put, Query} from '@nestjs/common';
import {TasksService} from './tasks.service';
import type {Task}  from './task.model';
import {CreateTaskDto} from './create-task.dto';
import {UpdateTaskDto} from './update-task.dto';

@Controller('tasks')
export class TasksController {
    constructor(private tasksService: TasksService) {}

    @Get()
    getTasks(@Query('status') status?: string): Task[] {
        return this.tasksService.getTasksByStatus(status);
    }

    @Post()
    createTask(@Body() createTaskDto: CreateTaskDto): Task {
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