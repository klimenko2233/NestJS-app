import {Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards, ValidationPipe} from '@nestjs/common';
import {TasksService} from './tasks.service';
import {CreateTaskDto} from './dto/create-task.dto';
import {UpdateTaskDto} from './update-task.dto';
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard';
import {GetTasksDto} from './dto/get-tasks.dto';

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
    getTasks(
        @Req() req: RequestWithUser,
        @Query(new ValidationPipe({ transform: true })) filterDto: GetTasksDto
    ) {
        return this.tasksService.getAllTasks(
            req.user.id,
            filterDto.status,
            filterDto.page,
            filterDto.limit,
            filterDto.sortBy,
            filterDto.order
        );
    }

    @Post()
    createTask(@Req() req: RequestWithUser, @Body() createTaskDto: CreateTaskDto) {
        return this.tasksService.createTask(
            req.user.id,
            createTaskDto.title,
            createTaskDto.description,
            createTaskDto.dueDate
        );
    }

    @Get(':id')
    getTaskById(@Req() req: RequestWithUser, @Param('id') id: string) {
        return this.tasksService.getTaskById(req.user.id, id);
    }

    @Put(':id')
    updateTask(
        @Req() req: RequestWithUser,
        @Param('id') id: string,
        @Body() updateTaskDto: UpdateTaskDto,
    ) {
        return this.tasksService.updateTask(req.user.id, id, updateTaskDto);
    }

    @Delete(':id')
    deleteTask(@Req() req: RequestWithUser, @Param('id') id: string) {
        return this.tasksService.deleteTask(req.user.id, id);
    }
}