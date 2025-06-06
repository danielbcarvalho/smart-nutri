import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): AuthenticatedUser | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    // If a specific property is requested, return that property
    if (data && user) {
      return user[data];
    }
    
    // Otherwise return the full user object
    return user;
  },
);
