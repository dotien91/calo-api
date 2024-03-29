import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService as ConfigServiceNest } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";
import * as _ from "lodash";
import { Types } from "mongoose";
import { DecodeUserToken } from "../../../dto/decode-user-token.dto";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CoursePublicStatus } from "../../../modules/course/interfaces/course.interface";
import { OrderService } from "../../../modules/order/services/order.service";
import { ReferralType } from "../../../modules/referral/interfaces/referral.interface.i";
import { ReferralService } from "../../../modules/referral/services/referral.service";
import { CourseService } from "../../course/services/course.service";
import { CourseUserService } from "../../course/services/course_user.service";
import { SearchAdminFilterDto } from "../dto/search-admin_filter.dto";
import { SearchBaseUserDto } from "../dto/search-base_user.dto";
import { SearchBlockListDto } from "../dto/search-block_list.dto";
import { SearchFollowCountDto } from "../dto/search-follow_count.dto";
import { GetRankingBoardParams, SearchUserDto } from "../dto/search-user.dto";
import { SearchUserFollowDto } from "../dto/search-user_follow.dto";
import { SearchUserLocationDto } from "../dto/search-user_location.dto";
import { SearchUserMoodDto } from "../dto/search-user_mood.dto";
import { User } from "../schemas/user.schema";
import { UserService } from "../services/user.service";
import { UserBlockService } from "../services/user_block.service";
import { UserDisagreeService } from "../services/user_disagree.service";
import { UserFollowService } from "../services/user_follow.service";
import { UserLocationService } from "../services/user_location.service";
import { UserMoodService } from "../services/user_mood.service";
import { UserQuestionService } from "../services/user_question.service";
import { UserViewService } from "../services/user_view.service";
/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class UserFilterHelper {
  constructor(
    private appUserService: UserService,
    private userFollowService: UserFollowService,
    private userViewService: UserViewService,
    private orderService: OrderService,
    private userDisagreeService: UserDisagreeService,
    private userBlockService: UserBlockService,
    private userMoodService: UserMoodService,
    private userQuestionService: UserQuestionService,
    private userLocationService: UserLocationService,
    private courseService: CourseService,
    private courseUserService: CourseUserService,
    private referralService: ReferralService
  ) { }

  /**
   * @author Tony Vu
   * @param query
   * @param req
   * @param res
   */
  async searchBlockList(query: SearchBlockListDto, req: ExpressRequestDto, res: Response) {
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
        orderByOBject = { ...orderByOBject, ...{ updatedAt: query.order_by } };
      }

      const userId = userObject._id.toString();
      //Check Permission
      const dataToFilter = {
        user_id: userId,
      };
      const dataReturn = await this.userBlockService.filter(dataToFilter, orderByOBject, page, limit);
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
   * @param req
   * @param res
   * @returns
   */
  async handleFilterUser(query: SearchUserDto, req: ExpressRequestDto, res: Response) {
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

      const orderByOBject = {};
      if (query.sort_by) {
        orderByOBject[query.sort_by] = query.order_by || "DESC";
      } else {
        orderByOBject["createdAt"] = query.order_by || "DESC";
      }

      let dataToFilter = {
        ...query,
        ...{ search: query?.search ? query.search : null },
      };
      if (query?.ids) {
        if (query?.ids?.indexOf(",")) {
          const dataIds = query?.ids?.split(",");
          dataToFilter = { ...dataToFilter, ...{ ids: dataIds } };
        } else {
          dataToFilter = { ...dataToFilter, ...{ ids: [query?.ids] } };
        }
      }

      const dataReturn = await this.appUserService.filterAdminWithSearch(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.appUserService.count(dataToFilter);
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
   * @param req
   * @param res
   * @returns
   */
  async getListFollowing(query: SearchUserFollowDto, req: ExpressRequestDto, res: Response) {
    try {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ updatedAt: query.order_by } };
      }

      const userId = query?.user_id;

      //Check Permission
      const dataToFilter = {
        user_id: userId,
      };
      const dataReturn: any = await this.userFollowService.filterUser(dataToFilter, orderByOBject, page, limit);

      const dataChannelPermission = [];
      // //Get Data level
      // if (query?.channel_id) {
      //   const dataUserIds = dataReturn?.map((value) => {
      //     return value?.partner_id?._id?.toString();
      //   });
      //   //get permission
      //   const dataFilterMember = {
      //     channel_id: query?.channel_id,
      //     user_ids: dataUserIds,
      //   };
      //   dataChannelPermission = await this.channelPermissionService.filterWithoutChannel(
      //     dataFilterMember,
      //     {},
      //     1,
      //     limit
      //   );
      // }

      if (dataReturn) {
        const dataIds = dataReturn?.map((dataItem) => {
          return dataItem?.partner_id?._id?.toString();
        });

        const dataToFilterFollow = {
          partner_ids: dataIds,
          user_id: query?.user_id,
        };
        const orderByOBject = {};
        const dataUserFollow = await this.userFollowService.filterUser(
          dataToFilterFollow,
          orderByOBject,
          1,
          limit,
          false
        );

        const dataPartnerFollow = dataUserFollow?.map((value) => {
          return value?.partner_id?._id?.toString();
        });
        for (const dataItemIndex in dataReturn) {
          const partnerId = dataReturn[dataItemIndex]?.partner_id?._id?.toString();
          //@ts-ignore
          const dataToAdd = dataReturn[dataItemIndex]?.toObject();
          if (dataPartnerFollow.indexOf(partnerId) !== -1) {
            dataReturn[dataItemIndex] = {
              ...dataToAdd,
              ...{ is_follow: true, partner_id: dataToAdd.partner_id, user_id: userId },
            };
          } else {
            dataReturn[dataItemIndex] = {
              ...dataToAdd,
              ...{ is_follow: false, partner_id: dataToAdd.partner_id, user_id: userId },
            };
          }

          //Check user
          const dataToMerge = dataChannelPermission?.reduce(function (filtered: any, value: any) {
            if (value?.user_id?._id?.toString() == dataReturn[dataItemIndex]?.partner_id?._id?.toString()) {
              filtered.push({
                ...value?.user_id?.toObject(),
                ...{
                  channel_role: value?.channel_role,
                  coin_number: value?.coin_number,
                  permission: value?.permission,
                  point: value?.point,
                  level_number: value?.level_number,
                },
              });
            }
            return filtered;
          }, []);

          if (dataToMerge && dataToMerge[0]) {
            dataReturn[dataItemIndex] = { ...dataReturn[dataItemIndex], ...{ partner_id: dataToMerge[0] } };
          }
        }
      }
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
   * @param req
   * @param res
   * @returns
   */
  async getListFollower(query: SearchUserFollowDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ updatedAt: query.order_by } };
      }

      const userId = query?.user_id;

      //Check Permission
      const dataToFilter = {
        partner_id: userId,
      };
      let dataReturn: any = await this.userFollowService.filterUser(dataToFilter, orderByOBject, page, limit);

      const dataChannelPermission = [];
      //Get Data level
      // if (query?.channel_id) {
      //   const dataUserIds = dataReturn?.map((value) => {
      //     return value?.user_id?._id?.toString();
      //   });
      //   //get permission
      //   const dataFilterMember = {
      //     channel_id: query?.channel_id,
      //     user_ids: dataUserIds,
      //   };
      //   dataChannelPermission = await this.channelPermissionService.filterWithoutChannel(
      //     dataFilterMember,
      //     {},
      //     1,
      //     limit
      //   );
      // }

      if (dataReturn) {
        const dataIds = dataReturn?.map((dataItem) => {
          return dataItem?.user_id?._id?.toString();
        });

        const dataToFilterFollow = {
          partner_ids: dataIds,
          user_id: query?.user_id,
        };
        const orderByOBject = {};
        const dataUserFollow = await this.userFollowService.filterUser(
          dataToFilterFollow,
          orderByOBject,
          1,
          limit,
          false
        );
        const dataPartnerFollow = dataUserFollow?.map((value) => {
          return value?.user_id?._id?.toString();
        });
        for (const dataItemIndex in dataReturn) {
          const partnerId = dataReturn[dataItemIndex]?.user_id?._id?.toString();
          //@ts-ignore
          const dataToAdd = dataReturn[dataItemIndex]?.toObject();
          if (dataPartnerFollow.indexOf(partnerId) !== -1) {
            dataReturn[dataItemIndex] = {
              ...dataToAdd,
              ...{ is_follow: true, partner_id: dataToAdd.user_id, user_id: userId },
            };
          } else {
            dataReturn[dataItemIndex] = {
              ...dataToAdd,
              ...{ is_follow: false, partner_id: dataToAdd.user_id, user_id: userId },
            };
          }

          //Check user
          const dataToMerge = dataChannelPermission?.reduce(function (filtered: any, value: any) {
            if (value?.user_id?._id?.toString() == dataReturn[dataItemIndex]?.partner_id?._id?.toString()) {
              filtered.push({
                ...value?.user_id?.toObject(),
                ...{
                  channel_role: value?.channel_role,
                  coin_number: value?.coin_number,
                  permission: value?.permission,
                  point: value?.point,
                  level_number: value?.level_number,
                },
              });
            }
            return filtered;
          }, []);

          if (dataToMerge && dataToMerge[0]) {
            dataReturn[dataItemIndex] = { ...dataReturn[dataItemIndex], ...{ partner_id: dataToMerge[0] } };
          }
        }

        // should filter ignored follower
        if (userObject)
          dataReturn = dataReturn.filter((elem) => {
            return !userObject.ignore_followers.find((ignoreFollower) => {
              return ignoreFollower.toString() === elem.partner_id._id.toString();
            });
          });
      }
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param query
   * @param req
   * @param res
   * @returns
   */
  async getListUserLocation(query: SearchUserLocationDto, req: ExpressRequestDto, res: Response) {
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
        orderByOBject = { ...orderByOBject, ...{ updatedAt: query.order_by } };
      }

      const dataReturn = await this.userLocationService.filter(query, orderByOBject, page, limit);
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
   * @param req
   * @param res
   * @returns
   */
  async getListDisagree(query: SearchUserFollowDto, req: ExpressRequestDto, res: Response) {
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
        orderByOBject = { ...orderByOBject, ...{ updatedAt: query.order_by } };
      }

      const userId = userObject._id.toString();
      //Check Permission
      const dataToFilter = {
        user_id: userId,
      };
      const dataReturn = await this.userDisagreeService.filterUser(dataToFilter, orderByOBject, page, limit);
      const dataToAdd = [];
      if (dataReturn) {
        for (const dataItem of dataReturn) {
          dataToAdd.push({ ...dataItem.toObject(), ...{ user_id: dataItem.user_id, partner_id: userId } });
        }
      }
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
   * @param req
   * @param res
   * @returns
   */
  async getListMatch(query: SearchUserFollowDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }
      if (!query.order_by) {
        query.order_by = "DESC";
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ updatedAt: query.order_by } };
      }

      const userId = userObject._id.toString();
      //Check Permission
      const dataToFilter = {
        partner_id: userId,
        match_status: 1,
      };
      const dataReturn = await this.userFollowService.filterUser(dataToFilter, orderByOBject, page, limit);
      let dataToAdd = [];
      if (dataReturn) {
        for (const dataItem of dataReturn) {
          dataToAdd.push({ ...dataItem.toObject(), ...{ partner_id: dataItem.user_id, user_id: userId } });
        }
      }

      if (query.search) {
        dataToAdd = dataToAdd.filter((user) =>
          user?.partner_id?.display_name?.toLowerCase().match(query.search?.toLowerCase())
        );
      }

      const dataToFilterUnMatch = {
        partner_id: userId,
        match_status: 0,
      };
      const dataCountFollowing = await this.userFollowService.count(dataToFilterUnMatch);

      return res
        .set({
          "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count",
          "X-Total-Count": Number(dataCountFollowing),
        })
        .status(HttpStatus.OK)
        .json(dataToAdd);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param query
   * @param req
   * @param res
   * @returns
   */
  async getListMatchLocation(query: SearchUserFollowDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }
      if (!query.order_by) {
        query.order_by = "DESC";
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ updatedAt: query.order_by } };
      }

      const userId = userObject._id.toString();
      //Check Permission
      const dataToFilter = {
        partner_id: userId,
        match_status: 1,
      };
      const dataReturn = await this.userFollowService.filterLocation(dataToFilter, orderByOBject, page, limit);
      const dataToAdd = [];
      if (dataReturn) {
        for (const dataItem of dataReturn) {
          dataToAdd.push({ ...dataItem.toObject(), ...{ partner_id: dataItem.user_id, user_id: userId } });
        }
      }

      const dataToFilterUnMatch = {
        partner_id: userId,
        match_status: 0,
      };
      const dataCountFollowing = await this.userFollowService.count(dataToFilterUnMatch);

      return res
        .set({
          "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count",
          "X-Total-Count": Number(dataCountFollowing),
        })
        .status(HttpStatus.OK)
        .json(dataToAdd);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param query
   * @param req
   * @param res
   * @returns
   */
  async getListView(query: SearchUserFollowDto, req: ExpressRequestDto, res: Response) {
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
      const dataToFilter = {
        partner_id: userId,
      };
      const dataReturn = await this.userViewService.filter(dataToFilter, orderByOBject, page, limit);
      const dataToAdd = [];
      if (dataReturn) {
        for (const dataItem of dataReturn) {
          //@ts-ignore
          dataToAdd.push({ ...dataItem.toObject(), ...{ partner_id: dataItem.user_id, user_id: userId } });
        }
      }
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataToAdd);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param query
   * @param req
   * @param res
   * @returns
   */
  async getListAdminFilter(query: SearchAdminFilterDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      if (Number(query.limit) > 100) {
        query.limit = 100;
      }

      const limit = query.limit ? query.limit : 100;
      const page = query.page ? query.page : 1;
      let orderByObject = {};
      if (query.order_by) {
        orderByObject = { ...orderByObject, ...{ createdAt: query.order_by } };
      }

      let dataReturn: any = [];
      if (query?.type === "order") {
        dataReturn = await this.orderService.filterAdmin(query, orderByObject, page, limit);
      } else {
        dataReturn = await this.appUserService.filterAdmin(query, orderByObject, page, limit);
      }

      let dataToBrowser = [];
      if (dataReturn) {
        for (const returnItem of dataReturn) {
          if (query.select === "_id" || !query.select) {
            dataToBrowser.push(returnItem?.user_id?._id.toString());
          }
          if (query.select === "user_email" && returnItem?.user_id?.user_email) {
            dataToBrowser.push(returnItem.user_id.user_email.toString());
          }
          if (query.select === "user_login" && returnItem?.user_id?.user_login) {
            dataToBrowser.push(returnItem.user_id.user_login.toString());
          }
          if (query.select === "display_name" && returnItem?.user_id?.display_name) {
            dataToBrowser.push(returnItem.user_id.display_name.toString());
          }
        }
      }
      dataToBrowser = _.union(dataToBrowser, []);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .send(dataToBrowser.join(","));
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async checkProcessData(stringReplace: string) {
    if (
      (stringReplace?.indexOf("/2022/10/") !== -1 && stringReplace?.indexOf("media.whiteg.app") === -1) ||
      stringReplace?.indexOf("/2022/09/18") !== -1 ||
      stringReplace?.indexOf("/2022/09/19") !== -1 ||
      stringReplace?.indexOf("/2022/09/20") !== -1 ||
      stringReplace?.indexOf("/2022/09/21") !== -1 ||
      stringReplace?.indexOf("/2022/09/22") !== -1 ||
      stringReplace?.indexOf("/2022/09/23") !== -1 ||
      stringReplace?.indexOf("/2022/09/24") !== -1 ||
      stringReplace?.indexOf("/2022/09/25") !== -1 ||
      stringReplace?.indexOf("/2022/09/26") !== -1 ||
      stringReplace?.indexOf("/2022/09/27") !== -1 ||
      stringReplace?.indexOf("/2022/09/28") !== -1 ||
      stringReplace?.indexOf("/2022/09/29") !== -1 ||
      stringReplace?.indexOf("/2022/09/30") !== -1 ||
      stringReplace?.indexOf("/2022/09/31") !== -1
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   *
   * @param query
   * @param req
   * @param res
   * @returns
   */
  async getListAdminSearch(query: SearchAdminFilterDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      if (Number(query.limit) > 10000) {
        query.limit = 10000;
      }

      const limit = query.limit ? query.limit : 100;
      const page = query.page ? query.page : 1;
      let orderByObject = {};
      if (query.order_by) {
        orderByObject = { ...orderByObject, ...{ createdAt: query.order_by } };
      }

      let dataReturn: any = [];
      let dataCount = 0;
      dataReturn = await this.appUserService.filterAdmin(query, orderByObject, page, limit);
      dataCount = await this.appUserService.count(query);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .send(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param query
   * @param req
   * @param res
   * @returns
   */
  async getUserMoodList(query: SearchUserMoodDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      if (Number(query.limit) > 10000) {
        query.limit = 10000;
      }

      const limit = query.limit ? query.limit : 100;
      const page = query.page ? query.page : 1;
      let orderByObject = {};
      if (query.order_by) {
        orderByObject = { ...orderByObject, ...{ createdAt: query.order_by } };
      }
      const dataReturn = await this.userMoodService.filter(
        { user_id: userObject._id.toString() },
        orderByObject,
        page,
        limit
      );
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .send(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param query
   * @param req
   * @param res
   * @returns
   */
  async getUserQuestionList(query: SearchUserMoodDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      if (Number(query.limit) > 10000) {
        query.limit = 10000;
      }

      const limit = query.limit ? query.limit : 100;
      const page = query.page ? query.page : 1;
      let orderByObject = {};
      if (query.order_by) {
        orderByObject = { ...orderByObject, ...{ createdAt: query.order_by } };
      }
      const dataReturn = await this.userQuestionService.filter({}, orderByObject, page, limit);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .send(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param req
   * @param res
   * @returns
   */
  async getFollowCount(dataQuery: SearchFollowCountDto, req: ExpressRequestDto, res: Response) {
    try {
      const dataToFilter = {
        user_id: dataQuery?.user_id,
      };
      const dataCountFollowing = await this.userFollowService.count(dataToFilter);
      const dataToFilterFollower = {
        partner_id: dataQuery?.user_id,
      };
      const dataCountFollower = await this.userFollowService.count(dataToFilterFollower);

      // const dataContributeCount = await this.requestService.count({ user_id: dataQuery?.user_id });

      const dataToFilterView = {
        partner_id: dataQuery?.user_id,
        updatedAt: true,
      };
      const dataCountView = await this.userViewService.count(dataToFilterView);

      const dataToFilterFriend = {
        partner_id: dataQuery?.user_id,
        match_status: 1,
      };
      const dataCountFriend = await this.userFollowService.count(dataToFilterFriend);

      const dataReturn = {
        following: Number(dataCountFollowing),
        followers: Number(dataCountFollower),
        view_number: Number(dataCountView),
        friends: Number(dataCountFriend),
        // contribute: dataContributeCount,
      };
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
   * @param req
   * @param res
   * @returns
   */
  async handleGetUserDetail(id: string, req: ExpressRequestDto, res: Response) {
    try {
      const projection = {
        user_email: false,
      };

      const dataUser: any = await this.appUserService.findById(id, projection);

      if (!Number(dataUser?.user_status)) {
        throw new NotFoundException("User is invalid");
      }

      const courses = await this.courseService.findAll({ user_id: id, public_status: CoursePublicStatus.ACTIVE });
      const courseIds = courses.map((course) => course._id.toString());
      const members = await this.courseUserService.findAll({ course_id: { $in: courseIds } });

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json({
          ...dataUser._doc,
          course_count: courses.length,
          student_count: members.length,
        });
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getOwnUser(req: ExpressRequestDto, res: Response) {
    try {
      const dataSession = await this.handleSession(req);

      if (!dataSession) {
        throw new NotFoundException("Token is invalid");
      }

      const userId = dataSession._id.toString();

      const projection = {};
      const dataUser = await this.appUserService.findById(userId, projection);
      const isReferral = await this.referralService.findOne({
        user_id: userId,
        type: ReferralType.SIGN_UP,
      });
      if (!Number(dataUser?.user_status)) {
        throw new NotFoundException("User is invalid");
      }

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json({
          ...dataUser.toObject(),
          is_referral: isReferral ? true : false,
        });
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param req
   * @returns
   */
  async handleSession(req: ExpressRequestDto) {
    try {
      const authCodeHeader = req?.headers;
      let authCodeString: string = "";
      if (authCodeHeader && authCodeHeader["x-authorization"]) {
        authCodeString = authCodeHeader["x-authorization"]?.toString();
      }
      if (authCodeHeader && authCodeHeader["authorization"]) {
        authCodeString = authCodeHeader["authorization"].replace("Bearer ", "");
      }

      if (authCodeHeader && authCodeHeader["authorization"]) {
        authCodeString = authCodeHeader["authorization"].replace("Bearer ", "");
      }

      const hashPassword = new ConfigServiceNest().get<string>("HASH_PASSWORD");
      const { data, exp } = (await new JwtService().verify(authCodeString, {
        secret: hashPassword,
      })) as DecodeUserToken;
      return data;
    } catch (error) {
      return null;
    }
  }

  /**
   * @author Tony Vu
   * @param id
   * @param req
   * @param res
   * @returns
   */
  async getUserQuestionDetail(id: string, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new NotFoundException("User is invalid");
      }
      const dataUser = await this.userQuestionService.findById(id, {});
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataUser);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param query
   * @param req
   * @param res
   */
  async searchBaseUser(query: SearchBaseUserDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      const sessionObject = req?.session_data;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      console.log(new Date().getTime(), "new Date()).getTime() 1301");

      console.log(query, "query");
      let limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }

      let dataToFilter = query;
      if (process.env.BRANCH_NAME !== "live_video") {
        delete dataToFilter.limit;
        delete dataToFilter.page;
      } else {
        if (Number(query?.ready_status) == 1) {
          dataToFilter = { ...dataToFilter, ...{ limit: 1 } };
          limit = 1;
        }
      }
      delete dataToFilter.order_by;

      if (dataToFilter?.city) {
        const dataToFilterAdd = {
          latitude: 0,
          longitude: 0,
        };
        dataToFilter = { ...dataToFilter, ...dataToFilterAdd };
      }

      //Process Data Unset
      let dataUnset = [];
      dataUnset = [...dataUnset, ...[userObject?._id]];

      if (userObject?.block_users) {
        dataUnset = [...dataUnset, ...userObject?.block_users];
      }

      const checkPage = page;

      //If not Map, Not filter by User Active,
      const dataUnsetNew = [];

      if (query?.id_unset) {
        const dataIdsUnset = query?.id_unset?.split(",");
        for (const idUnset of dataIdsUnset) {
          dataUnset.push(idUnset);
        }
      }

      if (dataUnset && dataUnset.length) {
        for (const unsetItem of dataUnset) {
          try {
            const objectId = new Types.ObjectId(unsetItem);
            if (!objectId) {
              continue;
            }
          } catch (error) {
            continue;
          }

          dataUnsetNew.push(unsetItem?.toString());
        }
        dataToFilter = { ...dataToFilter, ...{ unset: dataUnsetNew } };
      }

      const dataWithIn = [];
      if (checkPage == 1) {
        const dataToFilter = {
          partner_id: userObject?._id.toString(),
          match_status: 0,
        };
        const dataIdLike = await this.userFollowService.filterWithId(dataToFilter, page, 10);
        if (dataIdLike && dataIdLike.length) {
          for (const dataLikeItem of dataIdLike) {
            const dataIdToPush = dataLikeItem.user_id.toString();
            if (dataUnsetNew && dataUnsetNew.length && dataUnsetNew.indexOf(dataIdToPush) === -1) {
              dataWithIn.push(dataIdToPush);
            }
            if (!dataUnsetNew || dataUnsetNew.length === 0) {
              dataWithIn.push(dataIdToPush);
            }
          }
        }
      }

      if (Number(dataToFilter?.is_map) == 1) {
        const dataUserOption: any = await this.appUserService.findOneLogin({ _id: userObject._id.toString() });
        const dataLoc = dataUserOption?.loc?.coordinates;
        dataToFilter = {
          ...dataToFilter,
          ...{
            latitude_original: parseFloat(dataLoc[1]?.toString()),
            longitude_original: parseFloat(dataLoc[0]?.toString()),
          },
        };
      }

      const dataFinalReturn = [];
      const dataUpdateSession = [];

      if (dataToFilter?.limit == 1) {
        console.log(dataFinalReturn, "dataFinalReturn");
      }

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": 0 })
        .status(HttpStatus.OK)
        .json(dataFinalReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  //   /**
  //    *
  //    * @param userId
  //    * @param cityName
  //    * @param countryName
  //    */
  //   async sendNotificationNew(
  //     partnerObject: User,
  //     req: ExpressRequestDto,
  //     res: Response,
  //     cityName: string,
  //     countryName: string
  //   ) {
  //     setTimeout(async () => {
  //       const supportAccount = await this.appUserService.findOne({ _id: process.env.INFO_USER });
  //       //Create new
  //       const dataCreateReturnRoom: any = await this.chatRoomHelper.handleCreateRoom(
  //         supportAccount,
  //         partnerObject._id.toString(),
  //         "personal",
  //         "",
  //         true
  //       );

  //       if (!dataCreateReturnRoom) {
  //         console.log("Not found");
  //       } else {
  //         const updatedAt = new Date(dataCreateReturnRoom?.updatedAt).getTime();
  //         const currentTime = new Date().getTime();

  //         //console.log(currentTime - updatedAt);
  //         const leftTime = currentTime - updatedAt;
  //         if (leftTime < 2592000000 && Number(dataCreateReturnRoom?.chat_history_count) > 0) {
  //           console.log("Not return");
  //           return null;
  //         }

  //         let chatContent = "";
  //         const tokenReturn = this.jwtHelper.generateJwt(
  //           process.env.INFO_USER,
  //           supportAccount?.user_email?.toString(),
  //           process.env.INFO_SESSION,
  //           true
  //         );
  //         let branchName = "WhiteG";
  //         if (process.env.BRANCH_NAME === "honee") {
  //           branchName = "Honee";
  //         }
  //         if (countryName === "Vietnam") {
  //           const localText = cityName ? ` tại ${cityName}, ${countryName}` : ``;
  //           chatContent = `Chào mừng bạn đã đến với ${branchName}${localText} - nơi kết nối & hẹn hò
  // 👉 Bạn cần tuân thủ các chính sách của chúng tôi và cùng chúng tôi xây dựng một cộng đồng ${branchName} văn minh, tốt đẹp hơn.
  // 👉 Hãy thay đổi ảnh đại điện và đăng tải một đoạn ghi âm để đối phương hiểu bạn hơn nhé.
  // ✅ Lưu ý: bạn chỉ có thể nhắn tin với đối phương khi cả 2 bạn cùng thích nhau. Vì thế hãy quẹt phải cho đối phương biết trước nhé.
  // 🔔 Nếu gặp bất kì vấn đề nào, hãy liên hệ trực tiếp với chúng tôi bằng tính năng Hỗ trợ.
  // 🔔 Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Hy vọng bạn có những trải nghiệm thú vị cùng ${branchName}.`;
  //         } else {
  //           const localText = cityName ? ` at ${cityName}, ${countryName}` : ``;
  //           chatContent = `Welcome to ${branchName}${localText}. Thanks for your believe
  // 👉 You have to agree with our privacy policies and join us in creating a civilized ${branchName} community.
  // 👉 Please change your personal avatar and upload a sound signature to understand thoroughly.
  // ✅ Note: you only chat with others when you both like each other. So please swipe right to let him know first.
  // 🔔 If you have any problems, contact us directly using the Support feature.
  // 🔔 Thank you for using our service. Hope you have stimulating experiences on ${branchName}.`;
  //         }
  //         const createChatHistoryDto = {
  //           chat_room_id: dataCreateReturnRoom?.chat_room_id?._id?.toString(),
  //           chat_content: chatContent,
  //         };

  //         req.user_id = supportAccount?._id.toString();
  //         req.user_object = supportAccount;
  //         req.session_id = process.env.INFO_SESSION;
  //         req.auth_code = tokenReturn.toString();

  //         const dataReturnHistory: any = await this.chatHistoryHelper.createNewHistory(
  //           req,
  //           res,
  //           createChatHistoryDto,
  //           false,
  //           true
  //         );
  //       }
  //     }, 2000);

  //     return true;
  //   }

  async getRankingBoard(query: GetRankingBoardParams, req: ExpressRequestDto, res: Response) {
    try {
      // const userObject = req?.user_object;
      // if (!userObject) {
      //   throw new ForbiddenException("User is invalid");
      // }
      if (Number(query.limit) > 100) {
        query.limit = 100;
      }

      const limit = query.limit ? query.limit : 100;
      const page = query.page ? query.page : 1;

      //Get Ranking orderby point
      let dataRanking = await this.appUserService.filter({}, { point: "DESC" }, page, limit);


      //Get Me

      let me: User[] = [];
      let myRanking = 0;

      if (req?.user_object) {
        const userObject = req?.user_object;

        let myPoint = userObject?.point;
        let dataFilter = {
          less_point: myPoint
        }
        let dataCount = await this.appUserService.count(dataFilter);
        //My Ranking
        myRanking = dataCount;
        me = [userObject];
      }

      const dataReturn = {
        user_id: me,
        my_ranking: myRanking,
        other_users: dataRanking,
      };
      let dataCount = await this.appUserService.count({});

      return res
        .set({
          "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count",
          "X-Total-Count": dataCount,
        })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private getUsersRanking(users: User[]) {
    const sortedUsers = users.slice().sort((a, b) => b.point - a.point);
    let rank = 1;
    let prevPoint = sortedUsers[0].point;
    const rankedData = sortedUsers.map((item) => {
      if (item.point !== prevPoint) {
        rank++;
        prevPoint = item.point;
      }
      return { ...item, rank };
    });

    return rankedData;
  }
}
