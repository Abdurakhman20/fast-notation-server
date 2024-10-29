import { IJwtPayload } from '@auth/interfaces';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
    (key: keyof IJwtPayload, ctx: ExecutionContext): IJwtPayload | Partial<IJwtPayload> => {
        const req = ctx.switchToHttp().getRequest();
        return key ? req.user[key] : req.user;
    },
);
