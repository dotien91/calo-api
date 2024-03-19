import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { User } from "../modules/user/schemas/user.schema";

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowedPermissions: string[] = this.reflector.getAllAndOverride("permissions", [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const userObject: User = request.user_object;

    // define role point
    const rolePoint = {
      user: 0,
      teacher: 1,
      admin: 2,
      "super-admin": 3,
    };

    if (!userObject) throw new UnauthorizedException("Require Token!");
    try {
      if (
        allowedPermissions.includes(userObject.user_role) ||
        allowedPermissions.filter((permission) => rolePoint[permission] < rolePoint[userObject.user_role]).length
      )
        return true;
      return false;
    } catch (e) {
      throw new ForbiddenException(e.message);
    }
  }
}

export function Permissions(...permissions: string[]) {
  return applyDecorators(SetMetadata("permissions", permissions), UseGuards(PermissionGuard));
}
