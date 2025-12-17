import {Module} from '@nestjs/common';
import {PassportModule} from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import {JwtModule} from '@nestjs/jwt';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {JwtStrategy} from './strategies/jwt.strategy';


@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'secretKey',
            signOptions: {expiresIn: '1d'},
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService]
})

export class AuthModule {}