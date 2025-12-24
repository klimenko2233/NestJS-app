import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const mockTaskRepository = () => ({
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    getCount: jest.fn(),
    getMany: jest.fn(),
});

describe('TasksService', () => {
    let service: TasksService;
    let repository: jest.Mocked<Repository<Task>>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TasksService,
                {
                    provide: getRepositoryToken(Task),
                    useFactory: mockTaskRepository,
                },
            ],
        }).compile();

        service = module.get<TasksService>(TasksService);
        repository = module.get(getRepositoryToken(Task));
    });

    describe('getTaskById', () => {
        it('should return a task when found', async () => {
            const mockTask = {
                id: 'test-id',
                title: 'Test Task',
                userId: 'user-123',
            } as Task;

            repository.findOne.mockResolvedValue(mockTask);

            const result = await service.getTaskById('user-123', 'test-id');

            expect(result).toEqual(mockTask);
            expect(repository.findOne).toHaveBeenCalledWith({
                where: { id: 'test-id' },
                relations: ['user'],
            });
        });

        it('should throw NotFoundException when task not found', async () => {
            repository.findOne.mockResolvedValue(null);

            await expect(
                service.getTaskById('user-123', 'test-id'),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException when task belongs to another user', async () => {
            const mockTask = {
                id: 'test-id',
                title: 'Test Task',
                userId: 'user-456', // Другой пользователь
            } as Task;

            repository.findOne.mockResolvedValue(mockTask);

            await expect(
                service.getTaskById('user-123', 'test-id'),
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('createTask', () => {
        it('should create and return a task', async () => {
            const mockTask = {
                id: 'new-id',
                title: 'New Task',
                userId: 'user-123',
                status: 'pending',
            } as Task;

            const mockCreatedTask = {
                title: 'New Task',
                description: 'Description',
                dueDate: '2025-12-31',
                status: 'pending',
                userId: 'user-123',
            };

            repository.create.mockReturnValue(mockCreatedTask as any);
            repository.save.mockResolvedValue(mockTask);

            const result = await service.createTask(
                'user-123',
                'New Task',
                'Description',
                '2025-12-31',
            );

            expect(result).toEqual(mockTask);
            expect(repository.create).toHaveBeenCalledWith({
                title: 'New Task',
                description: 'Description',
                dueDate: '2025-12-31',
                status: 'pending',
                userId: 'user-123',
            });
            expect(repository.save).toHaveBeenCalledWith(mockCreatedTask);
        });
    });

    describe('deleteTask', () => {
        it('should delete a task', async () => {
            const mockTask = {
                id: 'test-id',
                title: 'Test Task',
                userId: 'user-123',
            } as Task;

            repository.findOne.mockResolvedValue(mockTask);
            repository.delete.mockResolvedValue({ affected: 1 } as any);

            await service.deleteTask('user-123', 'test-id');

            expect(repository.delete).toHaveBeenCalledWith('test-id');
        });

        it('should throw NotFoundException when delete affects 0 rows', async () => {
            const mockTask = {
                id: 'test-id',
                title: 'Test Task',
                userId: 'user-123',
            } as Task;

            repository.findOne.mockResolvedValue(mockTask);
            repository.delete.mockResolvedValue({ affected: 0 } as any);

            await expect(
                service.deleteTask('user-123', 'test-id'),
            ).rejects.toThrow(NotFoundException);
        });
    });
});