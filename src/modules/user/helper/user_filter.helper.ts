import { ForbiddenException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService as ConfigServiceNest } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";
import * as _ from "lodash";
import { Types } from "mongoose";
import { DecodeUserToken } from "../../../dto/decode-user-token.dto";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { JwtHelperService } from "../../../modules/core/services/jwt_helper.service";
import { OrderService } from "../../../modules/order/services/order.service";
import { UserPermissionService } from "../../user_permission/services/user_permission.service";
import { SearchAdminFilterDto } from "../dto/search-admin_filter.dto";
import { SearchBaseUserDto } from "../dto/search-base_user.dto";
import { SearchBlockListDto } from "../dto/search-block_list.dto";
import { SearchFollowCountDto } from "../dto/search-follow_count.dto";
import { SearchUserDto } from "../dto/search-user.dto";
import { SearchUserFollowDto } from "../dto/search-user_follow.dto";
import { SearchUserLocationDto } from "../dto/search-user_location.dto";
import { SearchUserMoodDto } from "../dto/search-user_mood.dto";
import { UserService } from "../services/user.service";
import { UserBlockService } from "../services/user_block.service";
import { UserDisagreeService } from "../services/user_disagree.service";
import { UserFollowService } from "../services/user_follow.service";
import { UserLocationService } from "../services/user_location.service";
import { UserMoodService } from "../services/user_mood.service";
import { UserOptionService } from "../services/user_option.service";
import { UserQuestionService } from "../services/user_question.service";
import { UserSessionService } from "../services/user_session.service";
import { UserViewService } from "../services/user_view.service";
/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class UserFilterHelper {
  constructor(
    private appUserService: UserService,
    private userPermissionService: UserPermissionService,
    private userOptionService: UserOptionService,
    private userFollowService: UserFollowService,
    private userViewService: UserViewService,
    private orderService: OrderService,
    private userDisagreeService: UserDisagreeService,
    private userBlockService: UserBlockService,
    private jwtHelper: JwtHelperService,
    private userSessionService: UserSessionService,
    private userMoodService: UserMoodService,
    private userQuestionService: UserQuestionService,
    private userLocationService: UserLocationService,
  ) {}

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
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ updatedAt: query.order_by } };
      }

      const userId = userObject._id.toString();
      // if (await this.userPermissionService.isHavePermission(userId, "user/list")) {
      //Check Permission
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
      // } else {
      //   throw new BadRequestException("You haven't permission for this Action!");
      // }
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
      const authId = query?.auth_id;

      //Check Permission
      const dataToFilter = {
        user_id: userId,
      };
      const dataReturn: any = await this.userFollowService.filterUser(dataToFilter, orderByOBject, page, limit);

      let dataChannelPermission = [];
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
          user_id: query?.auth_id,
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
      // let userObject = req?.user_object;
      // if (!userObject) {
      //   throw new ForbiddenException("User is invalid");
      // }
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
      const authId = query?.auth_id;

      //Check Permission
      const dataToFilter = {
        partner_id: userId,
      };
      const dataReturn: any = await this.userFollowService.filterUser(dataToFilter, orderByOBject, page, limit);

      let dataChannelPermission = [];
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
          user_id: query?.auth_id,
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
        dataReturn = await this.userOptionService.filterAdmin(query, orderByObject, page, limit);
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

  // async handleProcessUser(query: SearchAdminFilterDto, req: ExpressRequestDto, res: Response) {
  //   try {
  //     const dataFilterMediaOld = {
  //       base_role: "men",
  //     };
  //     const dataObjectOld = await this.userOptionService.filter(dataFilterMediaOld, {}, 1, 50000);
  //     //console.log(dataObject);
  //     if (dataObjectOld) {
  //       let dataCount = 0;
  //       for (const dataMedia of dataObjectOld) {
  //         try {
  //           const dataUpdate = {
  //             user_id: dataMedia?.user_id?.toString(),
  //             base_role: "man",
  //           };
  //           await this.userOptionService.update(dataUpdate);
  //           dataCount++;
  //           console.log(dataCount, "dataCount");
  //         } catch (error) {
  //           console.log(error);
  //         }
  //       }
  //     }
  //     return res
  //       .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
  //       .status(HttpStatus.OK)
  //       .send({ status: "Done" });

  //     const dataFilterMedia = {
  //       from: "2022-05-01T04:02:39.976+00:00",
  //       to: "2022-11-01T04:02:39.976+00:00",
  //     };
  //     const dataObject = await this.chatMediaService.filter(dataFilterMedia, {}, 1, 50000);
  //     //console.log(dataObject);
  //     if (dataObject) {
  //       let dataCount = 0;
  //       for (const dataMedia of dataObject) {
  //         try {
  //           let dataUrl = dataMedia.media_url;
  //           let dataThumb = dataMedia.media_thumbnail;
  //           dataUrl = dataUrl.replace(
  //             "https://lgbtapp.s3.ap-southeast-1.amazonaws.com/2022/",
  //             "https://lgbtapp.s3.ap-southeast-1.amazonaws.com.whiteg.app/"
  //           );
  //           dataThumb = dataThumb.replace(
  //             "https://lgbtapp.s3.ap-southeast-1.amazonaws.com/2022/",
  //             "https://lgbtapp.s3.ap-southeast-1.amazonaws.com.whiteg.app/"
  //           );
  //           //console.log(dataMedia);
  //           const dataToUpdate = {
  //             media_url: dataUrl,
  //             media_thumbnail: dataThumb,
  //             _id: dataMedia._id.toString(),
  //           };
  //           await this.chatMediaService.update(dataToUpdate);
  //           dataCount++;
  //         } catch (error) {
  //           console.log(error);
  //         }
  //       }
  //     }
  //     return res
  //       .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
  //       .status(HttpStatus.OK)
  //       .send({ status: "Done" });

  //     const dataObject2 = await this.chatMediaService.filter(dataFilterMedia, {}, 1, 50000);
  //     //console.log(dataObject);
  //     if (dataObject) {
  //       for (const dataMedia of dataObject) {
  //         try {
  //           const dataUrl = dataMedia.media_url;

  //           const base64SingleFaceObject = await axios
  //             .get(dataUrl, {
  //               responseType: "arraybuffer",
  //             })
  //             .then((response) => {
  //               return response;
  //             })
  //             .catch((error) => {
  //               return null;
  //             });
  //           if (!base64SingleFaceObject) {
  //             continue;
  //           }
  //           const base64SingleFace1 = Buffer.from(base64SingleFaceObject.data).toString("base64");

  //           const apiUrl = process.env.GENDER_URL;
  //           const subscriptionKey = process.env.FACE_COMPARE_KEY; //change subscription key

  //           const FormData = require("form-data");
  //           const data = new FormData();
  //           data.append("secret_compare", subscriptionKey);
  //           data.append("key_compare", "ABC");
  //           data.append("image", base64SingleFace1);

  //           const config = {
  //             method: "post",
  //             url: apiUrl,
  //             headers: {
  //               ...data.getHeaders(),
  //             },
  //             data: data,
  //           };
  //           //console.log(config)

  //           const dataResponse = await axios(config)
  //             .then((response) => {
  //               return response.data;
  //             })
  //             .catch((error) => {
  //               return error;
  //             });

  //           let gender = "unknown";
  //           if (dataResponse?.is_female) {
  //             gender = "female";
  //           }
  //           if (dataResponse?.is_male) {
  //             gender = "male";
  //           }
  //           const dataAi = JSON.stringify(dataResponse);

  //           const dataToUpdate = {
  //             gender: gender,
  //             _id: dataMedia._id.toString(),
  //             data_ai: dataAi,
  //           };
  //           await this.chatMediaService.update(dataToUpdate);
  //           console.log(dataMedia._id.toString());
  //         } catch (error) {
  //           console.log(error);
  //           const dataToUpdate = {
  //             gender: "unknown",
  //             _id: dataMedia._id.toString(),
  //             data_ai: "",
  //           };
  //           await this.chatMediaService.update(dataToUpdate);
  //         }
  //       }
  //     }
  //     return res
  //       .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
  //       .status(HttpStatus.OK)
  //       .send({ status: "Done" });

  //     const dataFilter = {
  //       from: "2022-07-20T04:02:39.976+00:00",
  //       to: "2022-10-21T04:02:39.976+00:00",
  //       is_avatar: "1",
  //     };
  //     const dataUser = await this.userOptionService.filterFree(dataFilter, {}, 1, 20000);
  //     let countUpdate = 0;
  //     for (const dataItem of dataUser) {
  //       const isUpdate = false;
  //       //console.log(dataItem);
  //       const dataUpdate = {
  //         _id: dataItem._id.toString(),
  //       };
  //       let dataUserOptionUpdate = {
  //         user_id: dataItem._id.toString(),
  //       };
  //       if (dataItem?.user_avatar?.toString() === "https://wallpaper.whiteg.app/avatar_default.png") {
  //         dataUserOptionUpdate = {
  //           ...dataUserOptionUpdate,
  //           ...{
  //             is_avatar: 0,
  //           },
  //         };

  //         countUpdate++;
  //         //await this.appUserService.update(dataUpdate);
  //         await this.userOptionService.update(dataUserOptionUpdate);
  //         console.log("DONE", countUpdate);
  //       }
  //       // if (await this.checkProcessData(dataItem?.user_avatar?.toString())) {
  //       //   dataUpdate = {
  //       //     ...dataUpdate,
  //       //     ...{
  //       //       user_avatar: "https://wallpaper.whiteg.app/avatar_default.png",
  //       //       user_avatar_thumbnail: "https://wallpaper.whiteg.app/avatar_default.png",
  //       //     },
  //       //   };
  //       //   dataUserOptionUpdate = {
  //       //     ...dataUserOptionUpdate,
  //       //     ...{
  //       //       is_avatar: 1,
  //       //     },
  //       //   };
  //       //   isUpdate = true;
  //       // }
  //       // if (await this.checkProcessData(dataItem?.public_sound?.toString())) {
  //       //   dataUpdate = {
  //       //     ...dataUpdate,
  //       //     ...{
  //       //       public_sound: "",
  //       //     },
  //       //   };
  //       //   isUpdate = true;
  //       // }
  //       // if (dataItem?.public_album) {
  //       //   let dataToUpdate = [];
  //       //   for (let dataItemAlbum of dataItem?.public_album) {
  //       //     //if (await this.checkProcessData(dataItemAlbum.))
  //       //     //console.log(dataItemAlbum._id);
  //       //     //console.log(this.checkProcessData(dataItemAlbum.media_url))
  //       //     if (await this.checkProcessData(dataItemAlbum.media_url)) {

  //       //     } else {
  //       //       dataToUpdate.push(dataItemAlbum._id?.toString())
  //       //     }
  //       //   }
  //       //   dataUserOptionUpdate = {
  //       //     ...dataUserOptionUpdate,
  //       //     ...{
  //       //       public_album: dataToUpdate
  //       //     }
  //       //   }
  //       //   isUpdate = true;
  //       // }

  //       // if (isUpdate) {
  //       //   countUpdate++;
  //       //   await this.appUserService.update(dataUpdate);
  //       //   await this.userOptionService.update(dataUserOptionUpdate);
  //       //   console.log("DONE", countUpdate);
  //       // }
  //     }
  //     return res
  //       .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
  //       .status(HttpStatus.OK)
  //       .send({ status: "Done" });
  //   } catch (error) {
  //     return res
  //       .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
  //       .status(HttpStatus.OK)
  //       .send({});
  //   }
  // }

  // async handleProcessFace(query: SearchAdminFilterDto, req: ExpressRequestDto, res: Response) {
  //   try {
  //     let dataObject = null;
  //     if (Number(query.page) === 1) {
  //       //Update Like Point
  //       const dataFilterMedia = {
  //         not_circle_point: true,
  //       };
  //       dataObject = await this.userOptionService.filter(dataFilterMedia, {}, 1, 30000);
  //       for (const dataItem of dataObject) {
  //         let dataToUpdate = {
  //           user_id: dataItem.user_id.toString(),
  //         };
  //         if (parseFloat(dataItem.circle_point) < -20) {
  //           dataToUpdate = {
  //             ...dataToUpdate,
  //             ...{
  //               circle_point: -20,
  //               like_point: -20,
  //             },
  //           };
  //         } else {
  //           dataToUpdate = {
  //             ...dataToUpdate,
  //             ...{
  //               circle_point: dataItem.circle_point,
  //               like_point: dataItem.circle_point,
  //             },
  //           };
  //         }
  //         await this.userOptionService.update(dataToUpdate);
  //       }
  //     }
  //     if (Number(query.page) === 2) {
  //       //Update Avatar point
  //       //Update Like Point
  //       const dataFilterAvatar = {
  //         is_avatar: "1",
  //       };
  //       dataObject = await this.userOptionService.filterFree(dataFilterAvatar, {}, 1, 30000);
  //       for (const dataItem of dataObject) {
  //         const avatarUrl = dataItem?.user_avatar;
  //         const image1Object = await this.chatMediaService.findOne({ media_url: avatarUrl });

  //         let genderPoint = 0;
  //         if (image1Object && image1Object?.gender) {
  //           if (image1Object?.gender === "male") {
  //             genderPoint = -10;
  //           } else {
  //             if (image1Object?.gender === "female") {
  //               genderPoint = 0;
  //             } else {
  //               genderPoint = 10;
  //             }
  //           }
  //         } else {
  //           genderPoint = 10;
  //         }

  //         const userOptionData = await this.userOptionService.findOne({ user_id: dataItem._id?.toString() });
  //         const oldPoint = userOptionData?.avatar_point;
  //         const pointToPlus =
  //           parseFloat(userOptionData?.circle_point?.toString()) -
  //           parseFloat(oldPoint?.toString()) +
  //           parseFloat(genderPoint?.toString());

  //         //Update Gender Point
  //         const dataUpdateAfter = {
  //           user_id: dataItem._id?.toString(),
  //           avatar_point: genderPoint,
  //           avatar_gender: image1Object?.gender,
  //           circle_point: pointToPlus,
  //         };
  //         await this.userOptionService.update(dataUpdateAfter);
  //       }
  //     }

  //     if (Number(query.page) === 3) {
  //       //Update Day point
  //       //Update Like Point
  //       const dataFilterAvatar = {};
  //       dataObject = await this.userOptionService.filterFree(dataFilterAvatar, {}, 1, 80000);
  //       for (const dataItem of dataObject) {
  //         const lastActive = dataItem.last_active;

  //         const dateLastActive = new Date(lastActive);
  //         const currentTime = Date.now() - dateLastActive.getTime();

  //         const leftTime = Math.floor(currentTime / (1000 * 60 * 60 * 24));

  //         const userOptionData = await this.userOptionService.findOne({ user_id: dataItem._id?.toString() });
  //         const oldPoint = userOptionData?.time_point;
  //         const pointToPlus =
  //           parseFloat(userOptionData?.circle_point?.toString()) -
  //           parseFloat(oldPoint?.toString()) +
  //           parseFloat(leftTime?.toString());

  //         //Update Gender Point
  //         const dataUpdateAfter = {
  //           user_id: dataItem._id?.toString(),
  //           circle_point: pointToPlus,
  //           time_point: leftTime,
  //         };
  //         await this.userOptionService.update(dataUpdateAfter);
  //       }
  //     }

  //     if (Number(query.page) === 4) {
  //       //Update Like Point
  //       const dataFilterMedia = {
  //         from: "2022-09-30T04:02:39.976+00:00",
  //         to: "2022-11-01T04:02:39.976+00:00",
  //       };
  //       dataObject = await this.appUserService.filter(dataFilterMedia, {}, 1, 50000);
  //       let dataCount = 0;
  //       for (const dataItem of dataObject) {
  //         let userAvatar = dataItem.user_avatar;
  //         let userThumb = dataItem.user_avatar_thumbnail;
  //         let publicSound = dataItem.public_sound;

  //         if (
  //           userAvatar.indexOf("https://media.whiteg.app/lgbtapp.s3.ap-southeast-1.amazonaws.com.whiteg.app/2022") ===
  //           -1
  //         ) {
  //           console.log("change");
  //           userAvatar = userAvatar.replace(
  //             "https://media.whiteg.app/lgbtapp.s3.ap-southeast-1.amazonaws.com.whiteg.app",
  //             "https://media.whiteg.app/lgbtapp.s3.ap-southeast-1.amazonaws.com/2022"
  //           );
  //         }

  //         if (
  //           userThumb.indexOf("https://media.whiteg.app/lgbtapp.s3.ap-southeast-1.amazonaws.com.whiteg.app/2022") === -1
  //         ) {
  //           console.log("change");
  //           userThumb = userThumb.replace(
  //             "https://media.whiteg.app/lgbtapp.s3.ap-southeast-1.amazonaws.com.whiteg.app",
  //             "https://media.whiteg.app/lgbtapp.s3.ap-southeast-1.amazonaws.com/2022"
  //           );
  //         }
  //         if (
  //           publicSound.indexOf("https://media.whiteg.app/lgbtapp.s3.ap-southeast-1.amazonaws.com.whiteg.app/2022") ===
  //           -1
  //         ) {
  //           console.log("change");
  //           publicSound = publicSound.replace(
  //             "https://media.whiteg.app/lgbtapp.s3.ap-southeast-1.amazonaws.com.whiteg.app",
  //             "https://media.whiteg.app/lgbtapp.s3.ap-southeast-1.amazonaws.com/2022"
  //           );
  //         }

  //         userAvatar = userAvatar.replace(
  //           "https://lgbtapp.s3.ap-southeast-1.amazonaws.com/2022/",
  //           "https://lgbtapp.s3.ap-southeast-1.amazonaws.com.whiteg.app/"
  //         );
  //         userThumb = userThumb.replace(
  //           "https://lgbtapp.s3.ap-southeast-1.amazonaws.com/2022/",
  //           "https://lgbtapp.s3.ap-southeast-1.amazonaws.com.whiteg.app/"
  //         );
  //         publicSound = publicSound.replace(
  //           "https://lgbtapp.s3.ap-southeast-1.amazonaws.com/2022/",
  //           "https://lgbtapp.s3.ap-southeast-1.amazonaws.com.whiteg.app/"
  //         );

  //         userAvatar = userAvatar.replace(
  //           "https://media.whiteg.app/lgbtapp.s3.ap-southeast-1.amazonaws.com.whiteg.app",
  //           "https://media.whiteg.app/lgbtapp.s3.ap-southeast-1.amazonaws.com"
  //         );
  //         userThumb = userThumb.replace(
  //           "https://media.whiteg.app/lgbtapp.s3.ap-southeast-1.amazonaws.com.whiteg.app",
  //           "https://media.whiteg.app/lgbtapp.s3.ap-southeast-1.amazonaws.com"
  //         );
  //         publicSound = publicSound.replace(
  //           "https://media.whiteg.app/lgbtapp.s3.ap-southeast-1.amazonaws.com.whiteg.app",
  //           "https://media.whiteg.app/lgbtapp.s3.ap-southeast-1.amazonaws.com"
  //         );

  //         let dataToUpdate = {
  //           _id: dataItem._id.toString(),
  //         };

  //         dataToUpdate = {
  //           ...dataToUpdate,
  //           ...{
  //             user_avatar: userAvatar,
  //             user_avatar_thumbnail: userThumb,
  //             public_sound: publicSound,
  //           },
  //         };
  //         dataCount++;
  //         await this.appUserService.update(dataToUpdate);
  //       }
  //     }

  //     return res
  //       .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
  //       .status(HttpStatus.OK)
  //       .send({ status: "Done" });
  //   } catch (error) {
  //     return res
  //       .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
  //       .status(HttpStatus.OK)
  //       .send({});
  //   }
  // }

  async handleCronJob() {
    //Update Day point
    //Update Like Point
    const dataFilterAvatar = {
      is_circle_point: "true",
    };
    const dataObject = await this.userOptionService.filterFree(dataFilterAvatar, {}, 1, 20000);
    for (const dataItem of dataObject) {
      try {
        const lastActive = dataItem.last_active;

        const dateLastActive = new Date(lastActive);
        //console.log(dateLastActive);
        //Total time from Last active to now
        const currentTime = Date.now() - dateLastActive.getTime();

        //Total Time in day!
        const leftTime = Math.floor(currentTime / (1000 * 60 * 60 * 24));

        const userOptionData = await this.userOptionService.findOne({ user_id: dataItem._id?.toString() });
        const oldPoint = userOptionData?.time_point;

        console.log(userOptionData, "userOptionData");

        console.log(parseFloat(leftTime?.toString()), "  parseFloat(leftTime?.toString())");
        console.log(oldPoint?.toString(), "oldPoint?.toString()");
        console.log(userOptionData?.circle_point?.toString(), "userOptionData?.circle_point?.toString()");
        //console.log(parseFloat(oldPoint?.toString()) - parseFloat(genderPoint?.toString()), "point Plus");
        const pointToPlus =
          parseFloat(userOptionData?.circle_point?.toString()) -
          parseFloat(oldPoint?.toString()) +
          parseFloat(leftTime?.toString());

        //Update Gender Point
        const dataUpdateAfter = {
          user_id: dataItem._id?.toString(),
          circle_point: pointToPlus,
          time_point: leftTime,
        };
        console.log(dataUpdateAfter, "dataUpdateAfter");
        //console.log(dataUpdateAfter);
        await this.userOptionService.update(dataUpdateAfter);
      } catch (error) {
        console.log(error, "Error 917");
      }
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
      if (query?.type === "order") {
        dataReturn = await this.orderService.filterAdmin(query, orderByObject, page, limit);
        dataCount = await this.orderService.countAdmin(query);
      } else {
        if (query?.type === "sound") {
          query = { ...query, ...{ have_sound: "1" } };
          dataReturn = await this.appUserService.filterAdmin(query, orderByObject, page, limit);
          dataCount = await this.appUserService.count(query);
        } else {
          if (query?.type === "avatar") {
            query = { ...query, ...{ is_avatar: "1" } };
            dataReturn = await this.userOptionService.filterAdmin(query, orderByObject, page, limit);
            dataCount = await this.userOptionService.count(query);
          } else {
            dataReturn = await this.userOptionService.filterAdmin(query, orderByObject, page, limit);
            if (process.env.BRANCH_NAME === "revu") {
              for (const index in dataReturn) {
                if (dataReturn[index]?.user_interest?.length) {
                  const dataUserFilter = { ids: dataReturn[index]?.user_interest };
                  const dataUserArray = await this.appUserService.filter(dataUserFilter, {}, 1, 1000);
                  dataReturn[index].user_interest = dataUserArray;
                }
              }
            }
            dataCount = await this.userOptionService.count(query);
          }
        }
      }

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
      const dataReturn = {
        following: Number(dataCountFollowing),
        followers: Number(dataCountFollower),
        view_number: Number(dataCountView),
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
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new NotFoundException("User is invalid");
      }
      const projection = {
        user_email: false,
      };
      const userId = userObject._id.toString();

      let dataUser = await this.userOptionService.findById(id, projection);
      if (!Number(dataUser?.user_status)) {
        throw new NotFoundException("User is invalid");
      }
      //delete dataUser.loc;
      dataUser = { ...dataUser, ...{ is_block: false } };
      dataUser = { ...dataUser, ...{ is_follow: false, follow_id: null } };
      if (userObject?.block_users && userObject?.block_users?.length) {
        const dataBlock = [];
        for (const blockItem of userObject?.block_users) {
          dataBlock.push(blockItem.toString());
        }
        if (dataBlock.indexOf(id) !== -1) {
          dataUser = { ...dataUser, ...{ is_block: true } };
        }
      }

      const publicInstagram = [];
      if (dataUser?.public_instagram?.length) {
        for (const instagramItem of dataUser?.public_instagram) {
          if (instagramItem && instagramItem?.avatar) {
            publicInstagram.push(instagramItem);
          }
        }
      }
      dataUser = { ...dataUser, ...{ public_instagram: publicInstagram } };

      const dataToFilter = {
        user_id: userId,
        partner_id: id,
      };
      const dataMatch = await this.userFollowService.findOne(dataToFilter, false);
      if (dataMatch) {
        dataUser = { ...dataUser, ...{ match_status: dataMatch?.match_status, is_follow: true } };
      } else {
        dataUser = { ...dataUser, ...{ match_status: false } };
      }

      const dataVideoReturn: any = [];
      // if (Number(dataUser?.video_number) > 0) {
      //   const dataVideoObject: any = await this.shortService.filter(
      //     { user_id: dataUser?._id.toString() },
      //     { createdAt: "DESC" },
      //     1,
      //     3
      //   );
      //   if (dataVideoObject && dataVideoObject.length) {
      //     for (const dataVideoItem of dataVideoObject) {
      //       dataVideoReturn.push(dataVideoItem?.toObject());
      //     }
      //   }
      // }
      dataUser = { ...dataUser, ...{ user_video: dataVideoReturn } };

      delete dataUser?.follow_users;
      delete dataUser?.user_id;

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataUser);
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
      let dataUser = await this.userOptionService.findById(userId, projection);
      if (!Number(dataUser?.user_status)) {
        throw new NotFoundException("User is invalid");
      }
      //delete dataUser.loc;
      dataUser = { ...dataUser, ...{ is_block: false } };
      dataUser = { ...dataUser, ...{ is_follow: false, follow_id: null } };

      const publicInstagram = [];
      if (dataUser?.public_instagram?.length) {
        for (const instagramItem of dataUser?.public_instagram) {
          if (instagramItem && instagramItem?.avatar) {
            publicInstagram.push(instagramItem);
          }
        }
      }
      dataUser = { ...dataUser, ...{ public_instagram: publicInstagram } };

      delete dataUser?.follow_users;
      delete dataUser?.user_id;

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
      let page = query.page ? query.page : 1;
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

      //Process Lat Long
      if (
        parseFloat(query?.latitude?.toString()) &&
        parseFloat(query?.longitude?.toString()) &&
        parseFloat(query?.latitude?.toString()) != -1 &&
        parseFloat(query?.longitude?.toString()) != -1
      ) {
        if (!dataToFilter.city && !dataToFilter?.is_map) {
          const dataToUpdate = {
            user_id: userObject?._id?.toString(),
            loc: {
              type: "Point",
              coordinates: [parseFloat(query.longitude.toString()), parseFloat(query.latitude.toString())],
            },
          };
          await this.userOptionService.update(dataToUpdate);
        }
      }

      if (
        (parseFloat(query?.latitude?.toString()) == 0 && parseFloat(query?.longitude?.toString()) == 0) ||
        (!query.latitude && !query.longitude) ||
        (parseFloat(query?.latitude?.toString()) == -1 && parseFloat(query?.longitude?.toString()) == -1)
      ) {
        //Check
        const dataOption = await this.userOptionService.findOne({ user_id: userObject._id.toString() });
        if (
          dataOption &&
          dataOption?.loc?.coordinates &&
          dataOption?.loc?.coordinates[0] &&
          dataOption?.loc?.coordinates[1]
        ) {
          dataToFilter = {
            ...dataToFilter,
            ...{
              longitude: parseFloat(dataOption?.loc?.coordinates[0]?.toString()),
              latitude: parseFloat(dataOption?.loc?.coordinates[1]?.toString()),
            },
          };
        }
      }

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
      if (
        !dataToFilter?.is_map &&
        userObject?.follow_users &&
        (!Number(dataToFilter?.user_active) || !dataToFilter?.user_active) &&
        process.env.BRANCH_NAME != "live_video" &&
        process.env.BRANCH_NAME !== "ishare"
      ) {
        dataUnset = [...dataUnset, ...userObject?.follow_users];
      }
      if (
        !dataToFilter?.is_map &&
        userObject?.disagree_users &&
        (!Number(dataToFilter?.user_active) || !dataToFilter?.user_active) &&
        process.env.BRANCH_NAME != "live_video" &&
        process.env.BRANCH_NAME !== "ishare"
      ) {
        dataUnset = [...dataUnset, ...userObject?.disagree_users];
      }

      if (userObject?.block_users) {
        dataUnset = [...dataUnset, ...userObject?.block_users];
      }

      const checkPage = page;

      //If not Map, Not filter by User Active,
      if (
        !dataToFilter?.is_map &&
        dataToFilter.is_match &&
        Number(page) > 1 &&
        (!Number(dataToFilter?.user_active) || !dataToFilter?.user_active) &&
        sessionObject?.unset_ids &&
        process.env.BRANCH_NAME != "live_video" &&
        process.env.BRANCH_NAME !== "ishare"
      ) {
        dataUnset = [...dataUnset, ...sessionObject.unset_ids];
        page = 1;
      }

      if (process.env.BRANCH_NAME == "masked_chat") {
        dataUnset = [...dataUnset, ...sessionObject.unset_ids];
        page = 1;
      }

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

      if (userObject?.country && !dataToFilter?.distance) {
        const countryArrayString: any = process?.env?.OPEN_COUNTRY;
        const countryArray = countryArrayString?.split(",");
        if (countryArray.indexOf(userObject?.country.toString()) !== -1) {
          dataToFilter = { ...dataToFilter, ...{ distance: Number(process?.env?.DISTANCE_COUNTRY) } };
        }
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

      let dataReturn = await this.userOptionService.filterFree(dataToFilter, orderByOBject, page, limit);
      let resultCount = 0;
      if (Number(query?.is_match) == 1) {
        resultCount = await this.userOptionService.count(dataToFilter);
      }

      if (!dataToFilter?.distance && (!dataReturn || (dataReturn.length === 0 && Number(dataToFilter?.limit) != 1))) {
        dataToFilter = { ...dataToFilter, ...{ distance: 1000 } };
        dataReturn = await this.userOptionService.filterFree(dataToFilter, orderByOBject, page, limit);
        if (!dataReturn || dataReturn.length === 0) {
          dataToFilter = { ...dataToFilter, ...{ distance: 3000 } };
          dataReturn = await this.userOptionService.filterFree(dataToFilter, orderByOBject, page, limit);
          if (!dataReturn || dataReturn.length === 0) {
            dataToFilter = { ...dataToFilter, ...{ distance: 5000 } };
            dataReturn = await this.userOptionService.filterFree(dataToFilter, orderByOBject, page, limit);
          }
        }
      }

      //If not have Travel City & Have Data like user, add data into Current data
      if (
        dataWithIn &&
        dataWithIn.length &&
        process.env.BRANCH_NAME !== "live_video" &&
        process.env.BRANCH_NAME !== "ishare" &&
        // !userObject?.travel_city &&
        !dataToFilter?.is_map
      ) {
        const newDataFilter = {
          user_ids: dataWithIn,
        };
        const dataReturnToAdd = await this.userOptionService.filterFree(newDataFilter, orderByOBject, 1, 10);
        if (dataReturnToAdd && dataReturnToAdd.length) {
          dataReturn = [...dataReturn, ...dataReturnToAdd];
          dataReturn = _.sampleSize(dataReturn, dataReturn?.length);
        }
      }

      let dataFinalReturn = [];
      const dataUpdateSession = [];

      //Update Data Result
      if (dataReturn && dataReturn.length) {
        for (const dataPrepareItem of dataReturn) {
          dataUpdateSession.push(dataPrepareItem._id.toString());
          let isFollow = false;
          const followUserObject = [];
          if (userObject?.follow_users && userObject?.follow_users?.length) {
            for (const followItem of userObject?.follow_users) {
              followUserObject.push(followItem.toString());
            }
          }
          if (followUserObject.indexOf(dataPrepareItem._id.toString()) !== -1) {
            isFollow = true;
          }
          const publicInstagram = [];
          if (dataPrepareItem?.public_instagram?.length) {
            for (const instagramItem of dataPrepareItem?.public_instagram) {
              if (instagramItem && instagramItem?.avatar) {
                publicInstagram.push(instagramItem);
              }
            }
          }
          const dataVideoReturn: any = [];
          // if (Number(dataPrepareItem?.video_number) > 0) {
          //   const dataVideoObject: any = await this.shortService.filter(
          //     { user_id: dataPrepareItem?._id.toString() },
          //     { createdAt: "DESC" },
          //     1,
          //     3
          //   );
          //   if (dataVideoObject && dataVideoObject.length) {
          //     for (const dataVideoItem of dataVideoObject) {
          //       dataVideoReturn.push(dataVideoItem?.toObject());
          //     }
          //   }
          // }
          dataFinalReturn.push({
            ...dataPrepareItem,
            ...{ is_follow: isFollow, public_instagram: publicInstagram, user_video: dataVideoReturn },
          });
        }
      }

      if (process.env.BRANCH_NAME === "ishare") {
        const dataToFilter = {
          partner_id: userObject?._id?.toString(),
          user_ids: dataUpdateSession,
          match_status: 1,
        };
        const orderByOBject = {};
        const dataUserFollow = await this.userFollowService.filterUser(dataToFilter, orderByOBject, 1, limit, false);
        const dataPartnerFollow = [];
        for (const dataUserFollowItem of dataUserFollow) {
          // console.log(dataUserFollowItem, 'dataUserFollowItem')
          dataPartnerFollow.push(dataUserFollowItem?.user_id?._id?.toString());
        }
        for (const dataItemIndex in dataFinalReturn) {
          const partnerId = dataFinalReturn[dataItemIndex]?._id?.toString();
          if (dataPartnerFollow.indexOf(partnerId) !== -1) {
            dataFinalReturn[dataItemIndex] = { ...dataFinalReturn[dataItemIndex], ...{ is_match: "1" } };
          } else {
            dataFinalReturn[dataItemIndex] = { ...dataFinalReturn[dataItemIndex], ...{ is_match: "0" } };
          }
        }
      }

      //Update Session
      if (
        dataUpdateSession &&
        dataUpdateSession.length &&
        process.env.BRANCH_NAME !== "masked_chat" &&
        process.env.BRANCH_NAME !== "live_video" &&
        process.env.BRANCH_NAME !== "ishare"
      ) {
        let dataToUpdate = [];
        if (checkPage > 1) {
          const oldData = [];
          if (sessionObject?.unset_ids) {
            for (const dataSessionOld of sessionObject.unset_ids) {
              oldData.push(dataSessionOld.toString());
            }
          }
          dataToUpdate = [...oldData, ...dataUpdateSession];
        } else {
          dataToUpdate = dataUpdateSession;
        }
        const afterData: any[] = _.union(dataToUpdate, []);
        const dataSessionToUpdate = {
          _id: sessionObject?._id.toString(),
          unset_ids: afterData,
        };
        await this.userSessionService.update(dataSessionToUpdate);
      }

      // //Update City
      // if (
      //   (!userObject?.city || !userObject?.country || !dataToFilter?.distance) &&
      //   parseFloat(query?.latitude?.toString()) &&
      //   parseFloat(query?.longitude?.toString()) &&
      //   parseFloat(query?.latitude?.toString()) != -1 &&
      //   parseFloat(query?.longitude?.toString()) != -1
      // ) {
      //   const randomTimeout = Math.floor(Math.random() * 20);
      //   setTimeout(async () => {
      //     //Update User Option
      //     let cityObject = await this.cityService.findOneWithFilter({
      //       point: [parseFloat(query.longitude.toString()), parseFloat(query.latitude.toString())],
      //     });

      //     if (!cityObject) {
      //       //Find nearby
      //       const filterCity = await this.cityService.filter(
      //         { is_nearby: "1", latitude: query.latitude, longitude: query.longitude },
      //         {},
      //         1,
      //         1
      //       );
      //       if (filterCity && filterCity[0]) {
      //         cityObject = filterCity[0];
      //       }
      //     }

      //     let cityName = "";
      //     let countryName = "";

      //     if (cityObject) {
      //       const oldCity = userObject?.city?.toString();
      //       if (userObject?.city?.toString() !== cityObject?._id?.toString()) {
      //         //Update New City
      //         let dataUpdate = {
      //           _id: userObject?._id?.toString(),
      //           old_city: oldCity,
      //           city: cityObject?._id?.toString(),
      //           country: cityObject?.country_iso2?.toString(),
      //         };
      //         await this.appUserService.update(dataUpdate);
      //         delete dataUpdate._id;
      //         dataUpdate = { ...dataUpdate, ...{ user_id: userObject?._id.toString() } };
      //         await this.userOptionService.update(dataUpdate);
      //         //Update Old City
      //         await this.cityService.handleUpdateUserInc(cityObject?._id.toString(), true);
      //         await this.cityService.handleUpdateUserInc(oldCity, false);
      //       }
      //       cityName = cityObject?.city_name?.toString();
      //       countryName = cityObject?.country?.toString();
      //       this.sendNotificationNew(userObject, req, res, cityName, countryName);
      //     } else {
      //       let dataUpdate = {
      //         _id: userObject?._id?.toString(),
      //         country: "GLOBAL",
      //       };
      //       await this.appUserService.update(dataUpdate);
      //       delete dataUpdate._id;
      //       dataUpdate = { ...dataUpdate, ...{ user_id: userObject?._id?.toString() } };
      //       await this.userOptionService.update(dataUpdate);
      //       this.sendNotificationNew(userObject, req, res, cityName, countryName);
      //     }
      //   }, randomTimeout * 1000);
      // }

      //Filter user Not have Avatar
      if (
        dataFinalReturn &&
        dataFinalReturn.length &&
        checkPage == 1 &&
        process.env.BRANCH_NAME !== "live_video" &&
        process.env.BRANCH_NAME !== "ishare"
      ) {
        dataFinalReturn = dataFinalReturn.filter((dataFilter: any, index: number) => {
          return Number(dataFilter.is_avatar) === 1;
        });
      }

      if (dataToFilter?.limit == 1) {
        console.log(dataFinalReturn, "dataFinalReturn");
      }

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": resultCount })
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
}
