import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { get } from 'lodash-es';
import {
  AuthenticatedUser,
  RequestWithUser,
} from '../interfaces/authenticated-user.interface';

export const User = createParamDecorator(
  (path: keyof AuthenticatedUser, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    return path ? get(user, path) : user;
  },
);
