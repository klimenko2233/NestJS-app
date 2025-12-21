import {createParamDecorator} from '@nestjs/common';

export interface CurrentUser {
    id: string;
    email: string;
    name: string;
}

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx): CurrentUser => {
        const request = ctx.switchToHttp().getRequest();

        return request.user as CurrentUser;
    }
);