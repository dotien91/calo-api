import { Response, Request, response } from "express";
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
import { CreateNeedHelpDto } from "../dto/create-need_help.dto";
import { NeedHelpService } from "../services/need_help.service";
import { ListNeedHelpDto } from "../dto/list-need_help.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UpdateNeedHelpDto } from "../dto/update-need_help.dto";
import axios from "axios";
import { UserOptionService } from "../../../modules/user/services/user_option.service";

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class NeedHelpHelper {
  constructor(
    private appUserService: UserService,
    private needHelpService: NeedHelpService,
    private userService: UserService,
    private userOptionService: UserOptionService,
    private userPermissionService: UserPermissionService
  ) {}

  /**
   * @author Tony Vu
   * @param createPlanData
   * @param res
   * @param req
   * @returns
   */
  async createNeedHelp(createNeedHelpData: CreateNeedHelpDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      createNeedHelpData = { ...createNeedHelpData, ...{ user_id: userId } };
      const dataReturn = await this.needHelpService.create(createNeedHelpData);
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
   * @param updateNeedHelpData
   * @param res
   * @param req
   * @returns
   */
  async updateNeedHelp(updateNeedHelpData: UpdateNeedHelpDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();

      //Check Permission
      const contactFormData = await this.needHelpService.findOne({ _id: updateNeedHelpData._id.toString() });
      if (contactFormData && contactFormData.user_id.toString()) {
        if (
          contactFormData.user_id.toString() !== userId &&
          !(await this.userPermissionService.isHavePermission(userId, "contact_form/update"))
        ) {
          throw new BadRequestException("You haven't permission for this Action!");
        }
        updateNeedHelpData = { ...updateNeedHelpData, ...{ user_id: userId } };
        const dataReturn = await this.needHelpService.update(updateNeedHelpData);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new NotFoundException("NeedHelp is not exist!");
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
  async getAllNeedHelpByAdmin(query: ListNeedHelpDto, res: Response, req: ExpressRequestDto) {
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

      //Check Permission
      const dataToFilter = query;
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const dataReturn = await this.needHelpService.filter(dataToFilter, orderByOBject, page, limit);
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
  async getNeedHelpByUserId(query: ListNeedHelpDto, id: string, res: Response, req: ExpressRequestDto) {
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
      //Check Permission
      let dataToFilter = {
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
      const dataToFilterBefore = query;
      delete dataToFilterBefore.page;
      delete dataToFilterBefore.limit;
      delete dataToFilterBefore.order_by;
      dataToFilter = { ...dataToFilterBefore, ...dataToFilter };
      const dataReturn = await this.needHelpService.filter(dataToFilter, orderByOBject, page, limit);
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
  async removeNeedHelp(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "contact_form/delete")) {
        //Check Permission
        const dataReturn = await this.needHelpService.remove(id);
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
  async handleGetDetailNeedHelp(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const dataFilter = {
        _id: id,
      };
      //Check Permission
      const dataReturn = await this.needHelpService.findOne(dataFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
