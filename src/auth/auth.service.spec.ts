import {AuthService} from './auth.service';
import {UsersService} from '../users/users.service';
import {JwtService} from '@nestjs/jwt';
import {Test, TestingModule} from '@nestjs/testing';
import {RegisterDto} from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import {ConflictException, UnauthorizedException} from '@nestjs/common';
import {LoginDto} from './dto/login.dto';

jest.mock('bcrypt');

const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
};

const mockJwtService = {
    sign: jest.fn()
};

describe('AuthService', () => {
    let service: AuthService;
    let usersService: jest.Mocked<UsersService>
    let jwtService: jest.Mocked<JwtService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {provide: UsersService, useValue: mockUsersService},
                {provide: JwtService, useValue: mockJwtService}
            ]
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get(UsersService);
        jwtService = module.get(JwtService);

        jest.clearAllMocks();
    });

    describe('register', () => {
        const registerDto: RegisterDto = {
            email: 'test@example.com',
            name: 'Test User',
            password: 'Password123',
        };

        it('should successfully register a new user', async () => {
            usersService.findByEmail.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            usersService.create.mockResolvedValue({
                id: 'user-id',
                email: 'test@example.com',
                name: 'Test User',
                password: 'hashedPassword'
            } as any);
            jwtService.sign.mockReturnValue('jwt-token');

            const result = await service.register(registerDto);

            expect(result).toEqual({
                user: {
                    id: 'user-id',
                    email: 'test@example.com',
                    name: 'Test User',
                },
                token: 'jwt-token'
            });
            expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(bcrypt.hash).toHaveBeenCalledWith('Password123', 10);
        });

        it('should throw ConflictException if email is already registered', async () => {
            usersService.findByEmail.mockResolvedValue({
                id: 'existing-id',
                email: 'test@example.com'
            } as any);

            await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('login', () => {
        const loginDto: LoginDto = {
            email: 'test@example.com',
            password: 'Password123',
        };

        it('should successfully login a user', async () => {
            const mockUser = {
                id: 'user-id',
                email: 'test@example.com',
                name: 'Test User',
                password: 'hashedPassword'
            };

            usersService.findByEmail.mockResolvedValue(mockUser as any);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            jwtService.sign.mockReturnValue('jwt-token');

            const result = await service.login(loginDto);

            expect(result).toEqual({
                user: {
                    id: 'user-id',
                    email: 'test@example.com',
                    name: 'Test User',
                },
                token: 'jwt-token'
            });
        });

        it('should throw UnauthorizedException if user not found', async () => {
            usersService.findByEmail.mockResolvedValue(null);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if password is incorrect', async () => {
            const mockUser = {
                id: 'user-id',
                email: 'test@example.com',
                password: 'hashedPassword',
            };

            usersService.findByEmail.mockResolvedValue(mockUser as any);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });
    });
});