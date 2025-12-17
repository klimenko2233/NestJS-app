import {IsEmail, IsString, Matches, MaxLength, MinLength} from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    name: string;

    @IsString()
    @MinLength(8)
    @MaxLength(32)
    @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    })
    password: string;
}