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
import { CreatePlanDto } from "../dto/create-plan.dto";
import { PlanService } from "../services/plan.service";
import { ListPlanDto } from "../dto/list-plan.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { HandleServiceService } from "../services/handle_service.service";
import { UpdatePlanDto } from "../dto/update-plan.dto";
import { SubscribeService } from "../../../modules/subscribe/services/subscribe.service";
/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class PlanHelper {
  constructor(
    private appUserService: UserService,
    private planService: PlanService,
    private userPermissionService: UserPermissionService,
    private handleServiceService: HandleServiceService,
    private subscribeService: SubscribeService
  ) { }

  /**
   * @author Tony Vu
   * @param id
   * @param createPlan
   * @param res
   * @param req
   * @returns
   */
  async createPlan(createPlanData: CreatePlanDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "plan/create")) {
        createPlanData = { ...createPlanData, ...{ user_id: userObject?._id?.toString() } };
        let dataHandleService = await this.handleServiceService.findById(createPlanData.service_id);
        if (dataHandleService) {
          createPlanData = { ...createPlanData, ...{ handle: dataHandleService.handle } };
          let dataReturn = await this.planService.create(createPlanData);
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json(dataReturn);
        } else {
          throw new NotFoundException("Handle Service is not found!");
        }
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
  async updatePlan(updatePlanData: UpdatePlanDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "plan/update")) {
        let dataHandleService = await this.handleServiceService.findById(updatePlanData.service_id);
        if (dataHandleService) {
          updatePlanData = { ...updatePlanData, ...{ handle: dataHandleService.handle } };
          let dataReturn = await this.planService.update(updatePlanData);
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json(dataReturn);
        } else {
          throw new NotFoundException("Handle Service is not found!");
        }
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
  async getListPlan(query: ListPlanDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }

      //Check Permission
      let dataToFilter = query;
      if (!query.version) {
        dataToFilter = { ...dataToFilter, ...{ version: "1.0.0" } };
      }
      delete query.limit;
      delete query.page;
      delete query.order_by;
      let dataReturn = await this.planService.filter(dataToFilter, orderByOBject, page, limit);

      if (query?.service_id && userObject?._id) {
        let channelId = req?.channel_id || "";
        let subscribe = await this.subscribeService.filter(
          { user_id: userObject?._id?.toString(), service_id: query?.service_id?.toString(), channel_id: channelId },
          { createdAt: "DESC" },
          1,
          1
        );
        if (subscribe && subscribe[0]) {
          for (let dataReturnIndex in dataReturn) {
            dataReturn[dataReturnIndex].trial_day = 0;
          }
        }
      }
      let dataCount = await this.planService.count(dataToFilter);
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
  async removePlan(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "plan/delete")) {
        //Check Permission
        let dataReturn = await this.planService.remove(id);
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
  async handleGetDetailPlan(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "plan/list")) {
        let dataFilter = {
          _id: id,
        };
        //Check Permission
        let dataReturn = await this.planService.findOne(dataFilter);
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
