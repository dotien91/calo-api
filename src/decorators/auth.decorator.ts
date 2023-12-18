import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	SetMetadata,
	UnauthorizedException,
	UseGuards,
	applyDecorators
} from '@nestjs/common';
import { User } from '../modules/user/schemas/user.schema';
import { UserPermissionService } from '../modules/user_permission/services/user_permission.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
	constructor(
		private service: UserPermissionService,
		private reflector: Reflector,
	) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const allowedPermissions = this.reflector.getAllAndOverride("permissions", [context.getHandler(), context.getClass()]);

		const request = context.switchToHttp().getRequest();
		let userObject: User = request.user_object;

		if (!userObject) throw new UnauthorizedException("Require Token!");
		try {
			// check super admin
			const isSuperAdmin = await this.service.isSuperAdmin(String(userObject._id));
			if (isSuperAdmin) return true;

			// check route permission
			const userPermissions = await this.service.findAll({ user_id: userObject._id });
			const userPermissionArray = userPermissions.map(userPermission => userPermission.permission);

			const parentRoute = request.url.split("/")[2]; // /api/parentRoute/childRoute
			if (userPermissionArray.some(userPermission => userPermission === parentRoute)) return true;

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

export function Permission(...permissions: String[]) {
	return applyDecorators(
		SetMetadata("permissions", permissions),
		UseGuards(PermissionGuard),
	);
}

export const UserPermission = (controller: string) => ({
	ROUTE: `${controller}`,
	ROUTE_VIEW: `${controller}_view`,
	ROUTE_CREATE: `${controller}_create`,
	ROUTE_UPDATE: `${controller}_update`,
	ROUTE_DELETE: `${controller}_delete`,
})
