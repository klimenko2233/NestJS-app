import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Task} from './task.entity';
import { Repository } from 'typeorm';
import {UpdateTaskDto} from './update-task.dto';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>
    ) {}

    async getAllTasks(status?: string): Promise<Task[]> {
        if (status) {
            return await this.tasksRepository
                .createQueryBuilder('task')
                .where('task.status = :status', {status})
                .getMany();
        }
        return await this.tasksRepository.find();
    }

    async createTask(title: string, description: string, dueDate?: string): Promise<Task> {
        const task = this.tasksRepository.create({
            title,
            description,
            dueDate,
            status: 'pending'
        });
        return await this.tasksRepository.save(task);
    }

    async getTaskById(id:string): Promise<Task> {
        const task = await this.tasksRepository.findOne({where: {id}});

        if (!task) {
            throw new NotFoundException(`Task with ID "${id}" not found!`);
        }
        return task;
    }

    async updateTask(id: string, updateData: UpdateTaskDto): Promise<Task> {
        const task = await this.getTaskById(id);

        const updates: Partial<Task> = {};
        for (const [key, value] of Object.entries(updateData)) {
            if (value !== undefined) updates[key] = value;
        }

        Object.assign(task, updates);
        return await this.tasksRepository.save(task);
    }

    async deleteTask(id: string): Promise<void> {
        const result = await this.tasksRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Task with ID "${id}" not found!`);
        }
    }
}