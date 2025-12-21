import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {Injectable} from '@nestjs/common';
import {UsersService} from '../../users/users.service';

@ValidatorConstraint({ name: 'IsEmailUnique', async: true })
@Injectable()
export class IsEmailUniqueConstraint implements ValidatorConstraintInterface {
    constructor(private userService: UsersService) {}

    async validate(email: string, args: ValidationArguments): Promise<boolean> {
        if(!email) return true;

        const user = await this.userService.findByEmail(email);

        return !user;
    }

    defaultMessage(args: ValidationArguments): string {
        return 'Email address already exists';
    }
}