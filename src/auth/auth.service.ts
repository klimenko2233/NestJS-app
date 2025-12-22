import {ConflictException, Injectable, UnauthorizedException} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import {JwtService} from '@nestjs/jwt';
import {RegisterDto} from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import {LoginDto} from './dto/login.dto';
import {RefreshTokensService} from './refresh-tokens.service';
import {User} from '../users/user.entity';


@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private refreshTokenService: RefreshTokensService,
    ) {}

    async register(registerDto: RegisterDto) {
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new ConflictException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const user = await this.usersService.create({
            ...registerDto,
            password: hashedPassword,
        });

        const tokens = await this.generateTokens(user);

        return {
            user:{
                id: user.id,
                email: user.email,
                name: user.name,
            },
            ...tokens
        };
    }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const tokens = await this.generateTokens(user);

        return {
            user:{
                id: user.id,
                email: user.email,
                name: user.name,
            },
            ...tokens
        };
    }

    async refreshTokens(refreshToken: string) {
        const storedToken = await this.refreshTokenService.validateRefreshToken(refreshToken);

        await this.refreshTokenService.revokeToken(refreshToken);

        const tokens = await this.generateTokens(storedToken.user);

        return {
            user: {
                id: storedToken.user.id,
                email: storedToken.user.email,
                name: storedToken.user.name,
            },
            ...tokens
        };
    }

    async logout(refreshToken: string) {
        await this.refreshTokenService.revokeToken(refreshToken);
    }

    async logoutAll(userId: string) {
        await this.refreshTokenService.revokeAllUserTokens(userId);
    }

    private async generateTokens(user: User) {
        const accessToken = this.generateAccessToken(user.id, user.email);
        const refreshToken = await this.refreshTokenService.createRefreshToken(user);

        return {
            accessToken,
            refreshToken: refreshToken.token,
        };
    }


    private generateAccessToken(userId: string, email: string): string {
        const payload = { sub: userId, email };
        return this.jwtService.sign(payload);
    }

}