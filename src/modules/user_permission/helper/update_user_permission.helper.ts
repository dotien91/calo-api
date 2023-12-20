import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { UserService } from "../../user/services/user.service";
import { CreateUserPermissionDto } from "../dto/create-user_permission.dto";
import { ListUserPermissionDto } from "../dto/list-user_permission.dto";
import { UserPermissionService } from "../services/user_permission.service";

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class UserPermissionHelper {
  constructor(private appUserService: UserService, private userPermissionService: UserPermissionService) {}

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
  async createUserPermission(
    id: string,
    createUserPermission: CreateUserPermissionDto,
    res: Response,
    req: ExpressRequestDto
  ) {
    try {
      const dataToFind = {
        user_id: id,
        permission: createUserPermission.permission,
      };
      const permissionCheck = await this.userPermissionService.findOne(dataToFind);
      if (permissionCheck) {
        const dataUpdate = {
          ...{
            _id: permissionCheck._id.toString(),
          },
          ...{ user_id: id },
          ...createUserPermission,
        };
        const dataCreate = await this.userPermissionService.update(dataUpdate);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataCreate);
      } else {
        const dataCreate = await this.userPermissionService.create({ ...{ user_id: id }, ...createUserPermission });
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataCreate);
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
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }

      const dataToFilter = {};
      const dataReturn = await this.userPermissionService.filter(dataToFilter, orderByOBject, page, limit);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
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
      const dataToFilter = {
        user_id: id,
      };
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }
      const dataReturn = await this.userPermissionService.filter(dataToFilter, orderByOBject, page, limit);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
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
      const dataReturn = await this.userPermissionService.remove(id);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
