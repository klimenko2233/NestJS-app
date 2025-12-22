import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './refresh-token.entity';
import { User } from '../users/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class RefreshTokensService {
    constructor(
        @InjectRepository(RefreshToken)
        private refreshTokensRepository: Repository<RefreshToken>,
    ) {}

    async createRefreshToken(user: User, ttl: number = 7 * 24 * 60 * 60 * 1000): Promise<RefreshToken> {
        const token = crypto.randomBytes(64).toString('hex');

        const expiresAt = new Date(Date.now() + ttl);

        const refreshToken = this.refreshTokensRepository.create({
            token,
            user,
            userId: user.id,
            expiresAt,
            revoked: false,
        });

        return this.refreshTokensRepository.save(refreshToken);
    }

    async findToken(token: string): Promise<RefreshToken | null> {
        return this.refreshTokensRepository.findOne({
            where: { token },
            relations: ['user'],
        });
    }

    async validateRefreshToken(token: string): Promise<RefreshToken> {
        const refreshToken = await this.findToken(token);

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }

        if (refreshToken.revoked) {
            throw new UnauthorizedException('Refresh token has been revoked');
        }

        if (refreshToken.expiresAt < new Date()) {
            throw new UnauthorizedException('Refresh token has expired');
        }

        return refreshToken;
    }

    async revokeToken(token: string): Promise<void> {
        const refreshToken = await this.findToken(token);
        if (refreshToken) {
            refreshToken.revoked = true;
            await this.refreshTokensRepository.save(refreshToken);
        }
    }

    async revokeAllUserTokens(userId: string): Promise<void> {
        await this.refreshTokensRepository.update(
            { userId, revoked: false },
            { revoked: true }
        );
    }

    async cleanupExpiredTokens(): Promise<void> {
        await this.refreshTokensRepository
            .createQueryBuilder()
            .delete()
            .where('expiresAt < :now', { now: new Date() })
            .orWhere('revoked = :revoked', { revoked: true })
            .execute();
    }
}