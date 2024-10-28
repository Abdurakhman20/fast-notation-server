import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookie = createParamDecorator((key: string, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    return key && key in req.cookies ? req.cookies[key] : key ? null : req.cookies;
});
