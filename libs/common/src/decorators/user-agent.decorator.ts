import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserAgent = createParamDecorator((_: string, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    return req.headers['user-agent'];
});
