import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserSession } from 'types/auth';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user ;
  },
);