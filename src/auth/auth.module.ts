import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { RefreshTokensService } from './refresh-tokens.service';
import { RefreshToken } from './refresh-token.entity';

@Module({
    imports: [
        UsersModule,
        PassportModule,
        TypeOrmModule.forFeature([RefreshToken]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const secret = configService.get<string>('JWT_SECRET');
                const expiresInString = configService.get<string>('JWT_EXPIRES_IN', '24h');

                if (!secret) {
                    throw new Error('JWT_SECRET is not defined in environment variables');
                }

                const expiresInMs = expiresInString.endsWith('h')
                    ? parseInt(expiresInString) * 60 * 60 * 1000
                    : parseInt(expiresInString);

                const expiresInSeconds = Math.floor(expiresInMs / 1000);

                return {
                    secret,
                    signOptions: {
                        expiresIn: expiresInSeconds,
                    },
                };
            },
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        RefreshTokensService,
    ],
    exports: [AuthService, RefreshTokensService],
})
export class AuthModule {}