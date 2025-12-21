import {IsIn, IsISO8601, IsNotEmpty, IsOptional, IsString, Length} from 'class-validator';

export class UpdateTaskDto {
    @IsOptional()
    @IsString()
    @Length(1,100)
    title?: string;

    @IsOptional()
    @IsString()
    @Length(1,500)
    description?: string;

    @IsOptional()
    @IsString()
    @IsIn(['pending', 'in-progress', 'completed'])
    status?: 'pending' | 'in-progress' | 'completed';

    @IsOptional()
    @IsISO8601({ strict: true})
    dueDate?: string;
}