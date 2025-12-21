import {ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Task} from './task.entity';
import { Repository } from 'typeorm';
import {UpdateTaskDto} from './dto/update-task.dto';

export interface PaginatedTasks {
    items: Task[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
}

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>
    ) {}

    async getAllTasks(
        userId: string,
        status?: string,
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'createdAt',
        order: 'ASC' | 'DESC' = 'DESC'
    ): Promise<PaginatedTasks> {
        const offset = (page - 1) * limit;

        const queryBuilder = this.tasksRepository
            .createQueryBuilder('task')
            .where('task.userId = :userId', { userId });

        if (status) {
            queryBuilder.andWhere('task.status = :status', { status });
        }

        const totalItems = await queryBuilder.getCount();

        const tasks = await queryBuilder
            .orderBy(`task.${sortBy}`, order)
            .skip(offset)
            .take(limit)
            .getMany();

        const totalPages = Math.ceil(totalItems / limit);

       return {
            items: tasks,
            meta: {
                totalItems,
                itemCount: tasks.length,
                itemsPerPage: limit,
                totalPages,
                currentPage: page
            }
       };
    }

    async createTask(
        userId: string,
        title: string,
        description: string,
        dueDate?: string
    ): Promise<Task> {
        const task = this.tasksRepository.create({
            title,
            description,
            dueDate,
            status: 'pending',
            userId
        });
        return await this.tasksRepository.save(task);
    }

    async getTaskById(userId: string, id:string): Promise<Task> {
        const task = await this.tasksRepository.findOne({where: {id}, relations: ['user']});

        if (!task) {
            throw new NotFoundException(`Task with ID "${id}" not found!`);
        }

        if(task.userId !== userId) {
            throw new ForbiddenException('You do not have access to this task');
        }

        return task;
    }

    async updateTask(userId: string, id: string, updateData: UpdateTaskDto): Promise<Task> {
        const task = await this.getTaskById(userId, id);

        const updates: Partial<Task> = {};
        for (const [key, value] of Object.entries(updateData)) {
            if (value !== undefined) updates[key] = value;
        }

        Object.assign(task, updates);
        return await this.tasksRepository.save(task);
    }

    async deleteTask(userId: string, id: string): Promise<void> {
        const task = await this.getTaskById(userId, id);

        const result = await this.tasksRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Task with ID "${id}" not found!`);
        }
    }
}