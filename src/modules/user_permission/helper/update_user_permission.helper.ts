import { Response, Request } from 'express';
import { ForbiddenException, BadRequestException, HttpStatus, NotFoundException, Injectable, Res, Req, Param } from '@nestjs/common';
import { UserService } from '../../user/services/user.service';
import { ExpressRequestDto } from '../../../dto/express-request.dto';
import { CreateUserPermissionDto } from '../dto/create-user_permission.dto';
import { UserPermissionService } from '../services/user_permission.service';
import { ListUserPermissionDto } from '../dto/list-user_permission.dto';

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class UserPermissionHelper {
  constructor(
    private appUserService: UserService,
    private userPermissionService: UserPermissionService
  ) { }

  /**
   * @author Tony Vu
   * @param userId
   * @param permission
   * @returns
   */
  async isHavePermission(userId: string, permission: string) {
    return this.userPermissionService.isHavePermission(userId, permission);
  }

  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createUserPermission(id: string, createUserPermission: CreateUserPermissionDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException('User is invalid');
      }
      let userId = userObject._id.toString();
      if ((await this.userPermissionService.isSuperAdmin(userId)) || (await this.userPermissionService.isHavePermission(userId, 'user_permission/create'))) {
        //Check Permission
        let dataToFind = {
          user_id: id,
          permission: createUserPermission.permission
        }
        let permissionCheck = await this.userPermissionService.findOne(dataToFind);
        if (permissionCheck) {
          let dataUpdate = {
            ...{
              _id: permissionCheck._id.toString()
            },
            ...{ user_id: id },
            ...createUserPermission
          }
          let dataCreate = await this.userPermissionService.update(dataUpdate);
          return res.set({ 'Access-Control-Expose-Headers': 'X-Authorization, X-Total-Count' }).status(HttpStatus.OK).json(dataCreate);
        } else {
          let dataCreate = await this.userPermissionService.create({ ...{ user_id: id }, ...createUserPermission });
          return res.set({ 'Access-Control-Expose-Headers': 'X-Authorization, X-Total-Count' }).status(HttpStatus.OK).json(dataCreate);
        }
      } else {
        throw new BadRequestException('You haven\'t permission for this Action!');
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param query
   * @param res
   * @param req
   * @returns
   */
  async getAllUserPermission(query: ListUserPermissionDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException('User is invalid');
      }
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } }
      }

      let userId = userObject._id.toString();
      if ((await this.userPermissionService.isSuperAdmin(userId)) || (await this.userPermissionService.isHavePermission(userId, 'user_permission/list'))) {
        //Check Permission
        let dataToFilter = {
        }
        let dataReturn = await this.userPermissionService.filter(dataToFilter, orderByOBject, page, limit);
        return res.set({ 'Access-Control-Expose-Headers': 'X-Authorization, X-Total-Count' }).status(HttpStatus.OK).json(dataReturn);
      } else {
        throw new BadRequestException('You haven\'t permission for this Action!');
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getUserPermission(query: ListUserPermissionDto, id: string, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException('User is invalid');
      }
      let userId = userObject._id.toString();
      if ((await this.userPermissionService.isSuperAdmin(userId)) || (await this.userPermissionService.isHavePermission(userId, 'user_permission/list'))) {
        //Check Permission
        let dataToFilter = {
          user_id: id
        }
        if (Number(query.limit) > 1000) {
          query.limit = 1000;
        }

        let limit = query.limit ? query.limit : 1000;
        let page = query.page ? query.page : 1;
        let orderByOBject = {};
        if (query.order_by) {
          orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } }
        }
        let dataReturn = await this.userPermissionService.filter(dataToFilter, orderByOBject, page, limit);
        return res.set({ 'Access-Control-Expose-Headers': 'X-Authorization, X-Total-Count' }).status(HttpStatus.OK).json(dataReturn);
      } else {
        throw new BadRequestException('You haven\'t permission for this Action!');
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async removePermission(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException('User is invalid');
      }
      let userId = userObject._id.toString();
      if ((await this.userPermissionService.isSuperAdmin(userId)) || (await this.userPermissionService.isHavePermission(userId, 'user_permission/delete'))) {
        //Check Permission
        let dataReturn = await this.userPermissionService.remove(id);
        return res.set({ 'Access-Control-Expose-Headers': 'X-Authorization, X-Total-Count' }).status(HttpStatus.OK).json(dataReturn);
      } else {
        throw new BadRequestException('You haven\'t permission for this Action!');
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

}
