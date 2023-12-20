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
import { UserPermissionService } from "../modules/user_permission/services/user_permission.service";

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private service: UserPermissionService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowedPermissions = this.reflector.getAllAndOverride("permissions", [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const userObject: User = request.user_object;

    if (!userObject) throw new UnauthorizedException("Require Token!");
    try {
      // check super admin
      const isSuperAdmin = await this.service.isSuperAdmin(String(userObject._id));
      if (isSuperAdmin) return true;

      // check route permission
      const userPermissions = await this.service.findAll({ user_id: userObject._id });
      const userPermissionArray = userPermissions.map((userPermission) => userPermission.permission);

      const parentRoute = request.url.split("/")[2]; // /api/parentRoute/childRoute
      if (userPermissionArray.some((userPermission) => userPermission === parentRoute)) return true;

      // check specify route permission
      for (const allowedPermission of allowedPermissions) {
        if (!userPermissionArray.includes(allowedPermission)) return false;
      }

      return true;
    } catch (e) {
      console.log(e);
      throw new ForbiddenException();
    }
  }
}

export function Permissions(...permissions: string[]) {
  return applyDecorators(SetMetadata("permissions", permissions), UseGuards(PermissionGuard));
}

export const Permission = (controller: string) => ({
  ALL: `${controller}`,
  LIST: `${controller}/list`,
  CREATE: `${controller}/create`,
  UPDATE: `${controller}/update`,
  DELETE: `${controller}/delete`,
});
