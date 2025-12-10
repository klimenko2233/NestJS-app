import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import {CreateTaskDto} from './create-task.dto';

@Entity()
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column({
        type: 'varchar',
        default: 'pending'
    })
    status: 'pending' | 'in-progress' | 'completed';

    @Column({nullable: true})
    dueDate?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}