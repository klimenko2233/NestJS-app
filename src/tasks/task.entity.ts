import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import {User} from '../users/user.entity';

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

    @ManyToOne(() => User, (user) => user.tasks, {onDelete: 'CASCADE'})
    user: User;

    @Column({ nullable: true })
    userId?: string;
}