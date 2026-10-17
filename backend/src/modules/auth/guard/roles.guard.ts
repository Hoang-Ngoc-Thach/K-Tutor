import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../../decorator/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { AuthUser } from '../strategy/jwt.strategy';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Route không gắn @Roles thì cho qua
    if (!roles || roles.length === 0) {
      return true;
    }

    const { user } = context
      .switchToHttp()
      .getRequest<{ user?: AuthUser }>();

    if (!user || !roles.includes(user.role)) {
      throw new ForbiddenException('FORBIDDEN');
    }

    return true;
  }
}