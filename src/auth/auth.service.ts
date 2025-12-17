import {ConflictException, Injectable, UnauthorizedException} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import {JwtService} from '@nestjs/jwt';
import {RegisterDto} from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import {LoginDto} from './dto/login.dto';


@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
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

        const token = this.generateToken(user.id, user.email);

        return {
            user:{
                id: user.id,
                email: user.email,
                name: user.name,
            },
            token
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

        const token = this.generateToken(user.id, user.email);

        return {
            user:{
                id: user.id,
                email: user.email,
                name: user.name,
            },
            token
        };
    }

    private generateToken(userId: string, email: string): string {
        const payload = { sub: userId, email };
        return this.jwtService.sign(payload);
    }

}