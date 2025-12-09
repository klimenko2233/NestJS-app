import {IsString, IsNotEmpty, Length, IsISO8601, IsOptional} from 'class-validator';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    @Length(1, 100)
    title: string;

    @IsString()
    @IsNotEmpty()
    @Length(1, 500)
    description: string;

    @IsOptional()
    @IsISO8601({ strict: true })
    dueDate?: string;
}