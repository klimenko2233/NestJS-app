import {IsIn, IsInt, IsOptional, IsString, Max, Min} from 'class-validator';
import {Type} from 'class-transformer';

export class GetTasksDto {
    @IsOptional()
    @IsIn(['pending', 'in-progress', 'completed'])
    status?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    @IsIn(['createdAt', 'updatedAt', 'dueDate', 'title'])
    sortBy?: string = 'createdAt';

    @IsOptional()
    @IsString()
    @IsIn(['ASC', 'DESC'])
    order?: 'ASC' | 'DESC' = 'DESC';
}