import { Response, Request } from "express";
import {
  ForbiddenException,
  BadRequestException,
  HttpStatus,
  NotFoundException,
  Injectable,
  Res,
  Req,
  Param,
} from "@nestjs/common";
import { UserService } from "../../user/services/user.service";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateSubscribeDto } from "../dto/create-subscribe.dto";
import { SubscribeService } from "../services/subscribe.service";
import { ListSubscribeDto } from "../dto/list-subscribe.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UpdateSubscribeDto } from "../dto/update-subscribe.dto";
import { PlanService } from "../../../modules/plan/services/plan.service";
import { UserUpdateSubscribeDto } from "../dto/update-user_subscribe.dto";

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class SubscribeHelper {
  constructor(
    private appUserService: UserService,
    private appSubscribeService: SubscribeService,
    private userPermissionService: UserPermissionService,
    private planService: PlanService
  ) {}

  /**
   * @author Tony Vu
   * @param query
   * @param res
   * @param req
   * @returns
   */
  async getAllSubscribeAdmin(query: ListSubscribeDto, res: Response, req: ExpressRequestDto) {
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

      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "subscribe/list")) {
        const channelId = req?.channel_id || "";
        //Check Permission
        const dataToFilter = { ...query, ...{ is_admin: 1, channel_id: channelId } };
        const dataReturn = await this.appSubscribeService.filter(dataToFilter, orderByOBject, page, limit);
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
   * @param dataCreateSubscribe
   * @param res
   * @param req
   * @returns
   */
  async createSubscribe(dataCreateSubscribe: CreateSubscribeDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "subscribe/create")) {
        // dataCreateSubscribe = { ...dataCreateSubscribe, ...{ user_id: userObject._id.toString() } };
        const planObject = await this.planService.findById(dataCreateSubscribe.plan_id);
        if (!planObject) {
          throw new NotFoundException("Plan is not found!");
        }
        const userObject = await this.appUserService.findOne({ _id: dataCreateSubscribe.user_id });
        if (!userObject) {
          throw new NotFoundException("User is not found!");
        }
        dataCreateSubscribe = {
          ...dataCreateSubscribe,
          ...{
            service_id: planObject.service_id.toString(),
            service_name: planObject.handle.toString(),
          },
        };
        const dataToCreate = await this.appSubscribeService.create(dataCreateSubscribe);
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
   * @param updateData
   * @param res
   * @param req
   * @returns
   */
  async updateSubscribe(updateData: UpdateSubscribeDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "subscribe/update")) {
        const dataReturn = await this.appSubscribeService.update(updateData);
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
   *
   * @param updateData
   * @param res
   * @param req
   * @returns
   */
  async updateSubscribeUser(updateData: UserUpdateSubscribeDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      const subscribeObject = await this.appSubscribeService.findById(updateData?._id?.toString());
      if (!subscribeObject) {
        throw new ForbiddenException("Subscription not found!");
      }
      if (userId !== subscribeObject?.user_id?._id?.toString()) {
        throw new ForbiddenException("You not have permission for this action!");
      }
      //
      const dataReturn = await this.appSubscribeService.update(updateData);
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
  async getSubscribes(query: ListSubscribeDto, id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (id !== userObject._id.toString()) {
        if (!(await this.userPermissionService.isHavePermission(userId, "subscribe/list"))) {
          throw new BadRequestException("You haven't permission for this Action!");
        }
      }
      const channelId = req?.channel_id || "";
      //Check Permission
      const dataToFilter = {
        ...{ user_id: id, channel_id: channelId },
        ...query,
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
      const dataReturn = await this.appSubscribeService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.appSubscribeService.count(dataToFilter);
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
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getExpiredSubscribes(query: ListSubscribeDto, id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (id !== userObject._id.toString()) {
        if (!(await this.userPermissionService.isHavePermission(userId, "subscribe/list"))) {
          throw new BadRequestException("You haven't permission for this Action!");
        }
      }
      const channelId = req?.channel_id || "";
      //Check Permission
      const dataToFilter = {
        user_id: id,
        is_expired: 1,
        channel_id: channelId,
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
      const dataReturn = await this.appSubscribeService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.appSubscribeService.count(dataToFilter);
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
  async handleGetDetailSubscribe(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "subscribe/list")) {
        //Check Permission
        const dataReturn = await this.appSubscribeService.findById(id.toString());
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
}
