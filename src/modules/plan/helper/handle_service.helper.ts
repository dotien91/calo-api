import { BadRequestException, ForbiddenException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { CreateHandleServiceDto } from "../dto/create-handle_service.dto";
import { ListHandleServiceDto } from "../dto/list-handle_service.dto";
import { UpdateHandleServiceDto } from "../dto/update-handle_service.dto";
import { HandleServiceService } from "../services/handle_service.service";
/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class HandleServiceHelper {
  constructor(
    private userPermissionService: UserPermissionService,
    private handleServiceService: HandleServiceService
  ) {}

  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createHandleService(createHandleServiceData: CreateHandleServiceDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "handle_service/create")) {
        if (createHandleServiceData.public_album) {
          createHandleServiceData = {
            ...createHandleServiceData,
            ...{ public_album: JSON.parse(createHandleServiceData.public_album) },
          };
        } else {
          createHandleServiceData = {
            ...createHandleServiceData,
            ...{ public_album: [] },
          };
        }

        if (createHandleServiceData.sub_menu) {
          createHandleServiceData = {
            ...createHandleServiceData,
            ...{ sub_menu: JSON.parse(createHandleServiceData.sub_menu) },
          };
        } else {
          createHandleServiceData = {
            ...createHandleServiceData,
            ...{ sub_menu: [] },
          };
        }

        createHandleServiceData = { ...createHandleServiceData, ...{ user_id: userObject._id.toString() } };
        const dataToCreate = await this.handleServiceService.create(createHandleServiceData);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataToCreate);
      } else {
        throw new BadRequestException("You haven't permission for this Action!");
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param id
   * @param createPlan
   * @param res
   * @param req
   * @returns
   */
  async updateHandleService(updateData: UpdateHandleServiceDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "handle_service/update")) {
        if (updateData.public_album) {
          updateData = {
            ...updateData,
            ...{ public_album: JSON.parse(updateData.public_album) },
          };
        }

        if (updateData.sub_menu) {
          updateData = {
            ...updateData,
            ...{ sub_menu: JSON.parse(updateData.sub_menu) },
          };
        }
        const dataReturn = await this.handleServiceService.update(updateData);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new BadRequestException("You haven't permission for this Action!");
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
  async getListHandle(query: ListHandleServiceDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }
      const dataToFilter = query;
      const dataReturn = await this.handleServiceService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.handleServiceService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
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
  async removeHandle(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "handle_service/delete")) {
        //Check Permission
        const dataReturn = await this.handleServiceService.remove(id);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new BadRequestException("You haven't permission for this Action!");
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
  async handleGetDetailService(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const dataReturn = await this.handleServiceService.findById(id);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
