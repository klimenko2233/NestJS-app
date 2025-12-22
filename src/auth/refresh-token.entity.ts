import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    token: string;

    @Column()
    userId: string;

    @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'timestamptz' })
    expiresAt: Date;

    @Column({ default: false })
    revoked: boolean;

    isValid(): boolean {
        return !this.revoked && new Date() < this.expiresAt;
    }
}