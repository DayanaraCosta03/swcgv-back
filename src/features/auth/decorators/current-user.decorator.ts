import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/** Usuario autenticado, tal como lo deja el JwtAuthGuard en la request. */
export interface AuthUser {
  id: number;
  email: string;
  role: string;
}

interface RequestWithUser extends Request {
  user?: AuthUser;
}

/**
 * Inyecta el usuario autenticado (o uno de sus campos) en un handler.
 * Uso: `@CurrentUser() user: AuthUser` o `@CurrentUser('id') userId: number`.
 * Requiere que el endpoint use JwtAuthGuard.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    return data && user ? user[data] : user;
  },
);
