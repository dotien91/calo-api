import { ForbiddenException, BadRequestException, HttpStatus, NotFoundException, Injectable } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { CreateLawyerRatingDto } from "../dto/create.lawyer_rating.dto";
import { SearchMyLawyerRatingDto } from "../dto/search.my_lawyer_rating.dto";
import { UpdateLawyerRatingDto } from "../dto/update.lawyer_rating.dto";
import { LawyerService } from "../services/lawyer.service";
import { LawyerRatingService } from "../services/lawyer_rating.service";
import { LawyerTypeService } from "../services/lawyer_type.service";

/**
 * @author Tony Vu
 * @class MapHelper
 */
@Injectable()
export class LawyerRatingHelper {
  constructor(
    private readonly userPermissionService: UserPermissionService,
    private readonly lawyerService: LawyerService,
    private readonly lawyerTypeService: LawyerTypeService,
    private readonly lawyerRatingService: LawyerRatingService
  ) {}

  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewLawyerRating(createLawyerTypeData: CreateLawyerRatingDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "lawyer/create")) {
        //Check if Exist Rating
        // let dataFilter = {
        //   createBy: userId,
        //   lawyer_id: createLawyerTypeData.lawyer_id,
        // };
        // let dataLawyer = await this.lawyerRatingService.findOne(dataFilter);
        // if (dataLawyer) {
        //   throw new BadRequestException("You have created Rating before!");
        // }
        let publicAlbum = [];
        if (createLawyerTypeData.rating_media) {
          publicAlbum = JSON.parse(createLawyerTypeData.rating_media.toString());
        }
        const newCreate = { ...createLawyerTypeData, ...{ rating_media: publicAlbum, createBy: userId } };

        const dataCreate = await this.lawyerRatingService.create(newCreate);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataCreate);
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
  async handleUpdateRating(dataUpdate: UpdateLawyerRatingDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();

      let publicAlbum = [];
      if (dataUpdate.rating_media) {
        publicAlbum = JSON.parse(dataUpdate.rating_media.toString());
      }
      dataUpdate = { ...dataUpdate, ...{ rating_media: publicAlbum, createBy: userId } };

      //Check Permission
      if (await this.userPermissionService.isHavePermission(userId, "lawyer/update")) {
        const dataReturn = await this.lawyerRatingService.update(dataUpdate);
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
  async getMyRating(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User/Lawyer Type is invalid");
      }
      const userId = userObject._id.toString();
      const dataFilter = {
        user_id: userId,
        lawyer_id: id,
      };
      //Check Permission
      const dataReturn = await this.lawyerRatingService.findOne(dataFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   *
   * @param query
   * @param res
   * @param req
   */
  async getMyListRating(query: SearchMyLawyerRatingDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }
      const dataToFilter = { ...query, createBy: userId };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const dataReturn = await this.lawyerRatingService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.lawyerRatingService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param query
   * @param res
   * @param req
   */
  async getAdminList(query: SearchMyLawyerRatingDto, res: Response, req: ExpressRequestDto) {
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
      const dataToFilter = { ...query };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const dataReturn = await this.lawyerRatingService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.lawyerRatingService.count(dataToFilter);
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
  async removeRatingByAdmin(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "lawyer/delete")) {
        //Check Permission
        const dataReturn = await this.lawyerRatingService.remove(id);
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
