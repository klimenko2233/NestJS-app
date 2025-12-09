import {Injectable, NotFoundException} from '@nestjs/common';
import { Task } from './task.model';

@Injectable()
export class TasksService {
    private tasks: Task[] = [];

    createTask(title: string, description: string, dueDate?: string): Task {
        const task: Task = {
            id: Date.now().toString(),
            title,
            description,
            status: 'pending',
            dueDate
        };
        this.tasks.push(task);
        return task;
    }

    updateTask(
        id: string,
        updateData: {
            title?: string;
            description?: string;
            status?: 'pending' | 'in-progress' | 'completed';
            dueDate?: string;
        }
        ): Task {
        const task = this.getTaskById(id);
        const taskIndex = this.tasks.findIndex(task => task.id === id);

        const updates = Object.entries(updateData).reduce((acc, [key, value]) => {
            if (value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {} as Partial<Task>);

        this.tasks[taskIndex] = {...task, ...updates};
        return this.tasks[taskIndex];
    }

    getTaskById(id: string) {
        const task = this.tasks.find(task => task.id === id);
        if (!task) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }
        return task;
    }

    deleteTask(id: string) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex === -1) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }
        this.tasks.splice(taskIndex, 1);
    }

    getTasksByStatus(status?: string): Task[] {
        if (!status) {
            return this.tasks;
        }
        const filtered = this.tasks.filter(task => {
            return task.status === status;
        });

        return filtered;
    }
}