import { ForbiddenException, BadRequestException, HttpStatus, NotFoundException, Injectable } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { CreateEventDto } from "../dto/create.event.dto";
import { CreateEventRatingDto } from "../dto/create.event_rating.dto";
import { CreateEventTypeDto } from "../dto/create.event_type.dto";
import { SearchEventDto } from "../dto/search.event.dto";
import { SearchMyEventRatingDto } from "../dto/search.my_event_rating.dto";
import { UpdateEventDto } from "../dto/update.event.dto";
import { UpdateEventRatingDto } from "../dto/update.event_rating.dto";
import { EventService } from "../services/event.service";
import { EventRatingService } from "../services/event_rating.service";
import { EventTypeService } from "../services/event_type.service";

/**
 * @author Tony Vu
 * @class MapHelper
 */
@Injectable()
export class EventRatingHelper {
  constructor(
    private readonly userPermissionService: UserPermissionService,
    private readonly eventService: EventService,
    private readonly eventTypeService: EventTypeService,
    private readonly eventRatingService: EventRatingService
  ) {}

  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewEventRating(createEventTypeData: CreateEventRatingDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      //Check if Exist Rating
      const dataFilter = {
        user_id: userId,
        event_id: createEventTypeData.event_id,
      };
      const dataEvent = await this.eventRatingService.findOne(dataFilter);
      if (dataEvent) {
        throw new BadRequestException("You have created Rating before!");
      }
      let publicAlbum = [];
      if (createEventTypeData.rating_media) {
        publicAlbum = JSON.parse(createEventTypeData.rating_media.toString());
      }
      const newCreate = { ...createEventTypeData, ...{ rating_media: publicAlbum, user_id: userId } };

      const dataCreate = await this.eventRatingService.create(newCreate);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataCreate);
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
  async handleUpdateRating(dataUpdate: UpdateEventRatingDto, res: Response, req: ExpressRequestDto) {
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
      dataUpdate = { ...dataUpdate, ...{ rating_media: publicAlbum, user_id: userId } };

      //Check Permission
      if (await this.userPermissionService.isHavePermission(userId, "event/update")) {
        const dataReturn = await this.eventRatingService.update(dataUpdate);
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
        throw new ForbiddenException("User/Event Type is invalid");
      }
      const userId = userObject._id.toString();
      const dataFilter = {
        user_id: userId,
        event_id: id,
      };
      //Check Permission
      const dataReturn = await this.eventRatingService.findOne(dataFilter);
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
  async getMyListRating(query: SearchMyEventRatingDto, res: Response, req: ExpressRequestDto) {
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
      const dataToFilter = { ...query, user_id: userId };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const dataReturn = await this.eventRatingService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.eventRatingService.count(dataToFilter);
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
  async getAdminList(query: SearchMyEventRatingDto, res: Response, req: ExpressRequestDto) {
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
      const dataToFilter = { ...query };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const dataReturn = await this.eventRatingService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.eventRatingService.count(dataToFilter);
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
      if (await this.userPermissionService.isHavePermission(userId, "event/delete")) {
        //Check Permission
        const dataReturn = await this.eventRatingService.remove(id);
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
