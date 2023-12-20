import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Param,
  Req,
  Res,
} from "@nestjs/common";
import { Request, Response } from "express";
import * as _ from "lodash";
import { Types } from "mongoose";
import { ExpressRequestDto } from "src/dto/express-request.dto";
import { MediaService } from "src/modules/media/services/media.service";
import { User } from "src/modules/user/schemas/user.schema";
import { UserService } from "src/modules/user/services/user.service";
import { UserSessionService } from "src/modules/user/services/user_session.service";
import { UserPermissionService } from "src/modules/user_permission/services/user_permission.service";
import { CreateShortDto } from "../dto/create-short.dto";
import { CreateShortLikeDto } from "../dto/create-short_like.dto";
import { CreateShortViewDto } from "../dto/create-short_view.dto";
import { ListShortDto } from "../dto/list-short.dto";
import { UpdateShortDto } from "../dto/update-short.dto";
import { ShortService } from "../services/short.service";
import { ShortLikeService } from "../services/short_like.service";
import { ShortViewService } from "../services/short_view.service";

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class ShortHelper {
  constructor(
    private shortService: ShortService,
    private userPermissionService: UserPermissionService,
    private mediaService: MediaService,
    private shortLikeService: ShortLikeService,
    private shortViewService: ShortViewService,
    private userService: UserService,
    private userSessionService: UserSessionService
  ) { }

  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewShort(createShortData: CreateShortDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      if (createShortData.media_id) {
        //Get Media Data
        let mediaData: any = await this.mediaService.findById(createShortData.media_id);
        if (!mediaData) {
          throw new ForbiddenException("Media is invalid");
        } else {
          let userId = userObject._id.toString();
          createShortData = { ...createShortData, ...{ user_id: userId } };
          let dataCreate: any = await this.shortService.create(createShortData);
          dataCreate = dataCreate.toObject();
          dataCreate = {
            ...dataCreate,
            ...{
              user_id: await this.handleGetUserBase(userObject),
              media_id: mediaData.toObject(),
              is_like: false,
              is_view: false,
            },
          };
          if (Number(createShortData.short_status) === 1 || !createShortData?.short_status) {
            await this.userService.updateCount({ user_id: userObject._id.toString() }, { video_number: 1 });
          }
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json(dataCreate);
        }
      } else {
        throw new ForbiddenException("Media is invalid");
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async updateShort(dataUpdate: UpdateShortDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      //Get Media Data
      let dataCreate: any = await this.shortService.update(dataUpdate);

      if (dataUpdate?.short_status?.toString() && Number(dataUpdate.short_status) !== Number(dataCreate.short_status)) {
        if (Number(dataUpdate.short_status) === 0) {
          await this.userService.updateCount({ user_id: userObject._id.toString() }, { video_number: -1 });
        } else {
          await this.userService.updateCount({ user_id: userObject._id.toString() }, { video_number: 1 });
        }
      }

      let mediaData: any = await this.mediaService.findById(dataCreate.media_id);
      dataCreate = dataCreate.toObject();
      dataCreate = {
        ...dataCreate,
        ...{
          user_id: await this.handleGetUserBase(userObject),
          media_id: mediaData.toObject(),
          is_like: false,
          is_view: false,
        },
      };
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
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getShortListByAdmin(query: ListShortDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "short/list")) {
        if (Number(query.limit) > 1000) {
          query.limit = 1000;
        }

        let limit = query.limit ? query.limit : 1000;
        let page = query.page ? query.page : 1;
        let orderByOBject = {};
        if (query.order_by) {
          orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
        }
        let dataToFilter = { ...query };
        delete dataToFilter.page;
        delete dataToFilter.limit;
        delete dataToFilter.order_by;
        let dataReturn = await this.shortService.filter(dataToFilter, orderByOBject, page, limit);
        let dataCount = await this.shortService.count(dataToFilter);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
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
  async handleGetListLike(query: ListShortDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let sessionObject = null;
      if (req) {
        sessionObject = req?.session_data;
      }

      let userId = userObject._id.toString();

      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }
      let dataToFilter = { ...query, ...{ user_id: userId } };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      let dataReturn: any = await this.shortLikeService.filterShort(dataToFilter, {}, 1, query.limit, {
        video_id: true,
      });

      let dataReturnFinal = [];
      if (dataReturn && dataReturn.length) {
        for (let shortItem of dataReturn) {
          dataReturnFinal.push({ ...shortItem, ...{ is_like: true, is_view: false } });
        }
      }
      if (Number(query?.only_id)) {
        let dataReturn = [];
        if (dataReturnFinal && dataReturnFinal?.length) {
          for (let dataItemFinal of dataReturnFinal) {
            dataReturn.push(dataItemFinal?._id?.toString());
          }
        }
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        //let dataCount = await this.shortService.count(dataToFilter);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturnFinal);
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
  async handleGetListView(query: ListShortDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let sessionObject = null;
      if (req) {
        sessionObject = req?.session_data;
      }

      let userId = userObject._id.toString();

      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }
      let dataToFilter = { ...query, ...{ user_id: userId } };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      let dataReturn: any = await this.shortViewService.filterShort(dataToFilter, {}, 1, query.limit, {
        video_id: true,
      });

      let dataReturnFinal = [];
      if (dataReturn && dataReturn.length) {
        for (let shortItem of dataReturn) {
          dataReturnFinal.push({ ...shortItem, ...{ is_like: true, is_view: false } });
        }
      }
      //let dataCount = await this.shortService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturnFinal);
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
  async getShortList(query: ListShortDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let sessionObject = null;
      if (req) {
        sessionObject = req?.session_data;
      }

      let userId = userObject._id.toString();

      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }
      let dataToFilter = { ...query };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      //Check Video View
      let dataReturn: any = await this.shortService.filter(dataToFilter, orderByOBject, page, limit);
      let dataReturnFinal = [];
      if (dataReturn && dataReturn.length) {
        let videoIds: string[] = [];
        for (let shortItem of dataReturn) {
          videoIds.push(shortItem?._id?.toString());
        }
        let dataFilterLike = {
          video_ids: videoIds,
          user_id: userId,
        };

        if (process.env.BRANCH_NAME === "tik_kid" && query?.is_exclude !== "false") {
          let sessionArray = [];
          if (sessionObject && sessionObject?.length) {
            for (let itemSession of sessionObject) {
              sessionArray.push(itemSession?.toString());
            }
            dataFilterLike = { ...dataFilterLike, ...{ unset: sessionArray } };
          }
        }
        let dataVideoLike = await this.shortLikeService.filter(dataFilterLike, {}, 1, query.limit, { video_id: true });
        let dataVideoLikeIds = [];
        if (dataVideoLike) {
          for (let videoLikeItem of dataVideoLike) {
            dataVideoLikeIds.push(videoLikeItem?.video_id?.toString());
          }
        }

        for (let shortItem of dataReturn) {
          if (dataVideoLikeIds.indexOf(shortItem._id.toString()) !== -1) {
            dataReturnFinal.push({ ...shortItem.toObject(), ...{ is_like: true, is_view: false } });
          } else {
            dataReturnFinal.push({ ...shortItem.toObject(), ...{ is_like: false, is_view: false } });
          }
        }
      }
      //let dataCount = await this.shortService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturnFinal);
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
  async handleGetDetailShort(id: string, res: Response, req: ExpressRequestDto) {
    try {
      if (!id) {
        throw new ForbiddenException("Id is not invalid");
      }
      let objectId = null;
      try {
        objectId = new Types.ObjectId(id.toString());
      } catch (error) {
        objectId = null;
      }
      //Check Permission
      let dataToFilter = {};
      if (objectId) {
        dataToFilter = { ...dataToFilter, ...{ _id: objectId } };
        let dataReturn = await this.shortService.findOne(dataToFilter);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new NotFoundException("Short is not found!");
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleUpdateShortByAdmin(dataUpdate: UpdateShortDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      let dataShort = await this.shortService.findById(dataUpdate._id.toString());
      if (
        dataShort?.user_id?._id.toString() === userObject._id.toString() ||
        (await this.userPermissionService.isHavePermission(userId, "short/update"))
      ) {
        let dataReturn = await this.shortService.update(dataUpdate);
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
  async handleDeleteShort(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();

      let dataShort = await this.shortService.findById(id.toString());
      if (
        dataShort?.user_id?._id.toString() === userObject?._id.toString() ||
        (await this.userPermissionService.isHavePermission(userId, "short/delete"))
      ) {
        let dataReturn = await this.shortService.remove(id);
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
   * @param userObject
   * @returns
   */
  async handleGetUserBase(userObject: User) {
    return {
      _id: userObject._id.toString(),
      user_login: userObject.user_login,
      user_role: userObject.user_role,
      user_status: userObject.user_status,
      last_active: userObject.last_active,
      user_active: userObject.user_active,
      user_avatar: userObject.user_avatar,
      display_name: userObject.display_name,
      user_avatar_thumbnail: userObject.user_avatar_thumbnail,
    };
  }

  /**
   * @author Tony Vu
   * @param dataFollow
   * @param req
   * @param res
   * @returns
   */
  async processFollowUser(dataFollow: CreateShortLikeDto, req: ExpressRequestDto, res: Response) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let videoObject = await this.shortService.findById(dataFollow.video_id);

      if (!videoObject) {
        throw new NotFoundException("Video not found");
      }

      let dataUpdate = {
        user_id: userObject._id.toString(),
        video_id: dataFollow.video_id.toString(),
      };
      let dataReturn = await this.shortLikeService.update(dataUpdate);

      //Update count Video
      let dataUpdateFilter = {
        _id: videoObject._id.toString(),
      };
      await this.shortService.updateCount(dataUpdateFilter, { like_number: 1 });
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param dataFollow
   * @param req
   * @param res
   * @returns
   */
  async processViewUser(dataFollow: CreateShortViewDto, req: ExpressRequestDto, res: Response) {
    try {
      let userObject = req?.user_object;

      let sessionObject = null;
      if (req) {
        sessionObject = req?.session_data;
      }

      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let videoObject = await this.shortService.findById(dataFollow.video_id);

      if (!videoObject) {
        throw new NotFoundException("Video not found");
      }

      let dataFilterView = {
        user_id: userObject._id.toString(),
        video_id: dataFollow.video_id.toString(),
      };

      let dataView = await this.shortViewService.findOne(dataFilterView);

      let dataUpdate = {
        user_id: userObject._id.toString(),
        video_id: dataFollow.video_id.toString(),
        total_time: 0,
      };

      if (dataView && Number(dataView.total_time) > Number(dataFollow.total_time)) {
        dataUpdate = { ...dataUpdate, ...{ total_time: Number(dataView.total_time) } };
      } else {
        dataUpdate = { ...dataUpdate, ...{ total_time: Number(dataFollow.total_time) } };
      }

      let dataReturn = await this.shortViewService.update(dataUpdate);

      if (process.env.BRANCH_NAME === "tik_kid") {
        let dataToUpdate = [];
        let dataUpdateSession = [dataFollow?.video_id];
        let oldData = [];
        if (sessionObject?.unset_ids) {
          for (let dataSessionOld of sessionObject.unset_ids) {
            oldData.push(dataSessionOld.toString());
          }
        }
        dataToUpdate = [...oldData, ...dataUpdateSession];

        let afterData: any[] = _.union(dataToUpdate, []);
        let dataSessionToUpdate = {
          _id: sessionObject?._id.toString(),
          unset_ids: afterData,
        };
        await this.userSessionService.update(dataSessionToUpdate);
      }

      //Update count Video
      let dataUpdateFilter = {
        _id: videoObject._id.toString(),
      };
      await this.shortService.updateCount(dataUpdateFilter, { view_number: 1 });
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param dataFollow
   * @param req
   * @param res
   * @returns
   */
  async processUnFollowUser(dataFollow: CreateShortLikeDto, req: ExpressRequestDto, res: Response) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let videoObject = await this.shortService.findById(dataFollow.video_id);

      if (!videoObject) {
        throw new NotFoundException("Video not found");
      }

      let dataUpdate = {
        user_id: userObject._id.toString(),
        video_id: dataFollow.video_id.toString(),
      };

      let dataReturn = await this.shortLikeService.removeOne(dataUpdate);

      //Update count Video
      let dataUpdateFilter = {
        _id: videoObject._id.toString(),
      };
      await this.shortService.updateCount(dataUpdateFilter, { like_number: -1 });
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
