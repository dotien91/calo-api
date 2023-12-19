import { Response, Request, response } from "express";
import { ForbiddenException, HttpStatus, NotFoundException, Injectable, BadRequestException } from "@nestjs/common";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateRedeemDto } from "../dto/create-redeem.dto";
import { RedeemService } from "../services/redeem.service";
import { ListRedeemDto } from "../dto/list-redeem.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UpdateRedeemDto } from "../dto/update-redeem.dto";
import { Types } from "mongoose";
import { JwtService } from "@nestjs/jwt";
import { DecodeUserToken } from "../../../dto/decode-user-token.dto";
import { UserService } from "../../../modules/user/services/user.service";
import { UserAnonymousSessionService } from "../../../modules/user/services/user_anonymous_session.service";
import { UserAnonymousService } from "../../../modules/user/services/user_anonymous.service";
import { NotificationHelper } from "../../../modules/notification/helper/notification.helper";
import { User } from "../../../modules/user/schemas/user.schema";
import { Redeem as RedeemNew } from "../schemas/redeem.schema";
import axios from "axios";
import cheerio from "cheerio";
import { UserOptionService } from "../../../modules/user/services/user_option.service";
import { ChannelPermissionService } from "../../../modules/channel/services/channel_permission.service";
import { Channel } from "../../../modules/channel/schemas/channel.schema";
import { RedeemMission } from "../schemas/redeem_mission.schema";
import { CreateRedeemPermissionDto } from "../dto/create-redeem_permission.dto";
import { RedeemPermissionService } from "../services/redeem_permission.service";
import { ListRedeemPermissionDto } from "../dto/list-redeem_permission.dto";
import { RedeemPermission } from "../schemas/redeem_permission.schema";
const { getFirestore } = require("firebase-admin/firestore");
let dataCrawl = `Other`;
import * as _ from "lodash";
import * as moment from "moment-timezone";

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class RedeemHelper {
  constructor(
    private redeemService: RedeemService,
    private userPermissionService: UserPermissionService,
    private userAnonymousSession: UserAnonymousSessionService,
    private userAnonymousService: UserAnonymousService,
    private userService: UserService,
    private userOptionService: UserOptionService,
    private notificationHelper: NotificationHelper,
    private channelPermissionService: ChannelPermissionService,
    private redeemPermissionService: RedeemPermissionService
  ) {}

  async handleUpdateCount() {
    try {
      let dataRedeem = await this.redeemService.filter({}, {}, 1, 1000);
      for (let dataItem of dataRedeem) {
        console.log(dataItem?.user_id?.user_avatar);
        if (!dataItem?.user_id?.user_avatar) {
          console.log("NOT HAVE");
          let dataUpdate = {
            _id: dataItem?._id,
            vote_number: 0,
            trending_number: 0,
            popular_number: 0,
          };
          await this.redeemService.update(dataUpdate);
        }
      }
    } catch (error) {}
  }

  /**
   *
   * @param dataAuthor
   * @returns
   */
  async handleCreateUser(dataAuthor: string) {
    try {
      let author = dataAuthor;
      let email = "";
      if (author) {
        email = this.toSlug(author) + "@gmail.com";
      }

      // console.log(dataText, "dataText");
      let userObject = null;

      if (email) {
        //Create new User
        let dataCreateUser = {
          user_email: email,
          user_login: email,
          display_name: author,
          user_status: 1,
        };
        userObject = await this.userService.findOne({ user_login: email });
        if (!userObject) {
          userObject = await this.userService.create(dataCreateUser);
          await this.handleUpdateUserOption(userObject?._id?.toString());
        }

        console.log(userObject, "userObject");
        return userObject;
      }
    } catch (error) {
      return null;
    }
  }

  async handleUpdateUserOption(userId: string) {
    let dataCreate = {
      user_id: userId,
    };
    let dataUserOption = await this.userOptionService.create(dataCreate);
    if (dataUserOption) {
      let dataUpdate = {
        _id: userId,
        user_option_id: dataUserOption._id.toString(),
      };
      await this.userService.update(dataUpdate);
      return dataUserOption;
    } else {
      return null;
    }
  }

  async updateRedeem() {
    try {
      let dataRedeem = await this.redeemService.filter({}, {}, 1, 1000);
      for (let dataRedeemItem of dataRedeem) {
        // console.log(dataRedeemItem);
        let userObject = await this.userService.findById(dataRedeemItem?.user_id?._id?.toString(), {});
        console.log(userObject?.country, "country");
        let dataToUpdate = {
          _id: dataRedeemItem?._id?.toString(),
          country: userObject?.country,
        };
        await this.redeemService.update(dataToUpdate);
      }
    } catch (error) {}
  }

  /**
   * @author Tony Vu
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getListRedeem(query: ListRedeemDto, res: Response, req: ExpressRequestDto) {
    try {
      // console.log(req.headers, "req.headers");
      if (Number(query.limit) > 1000 || !query.limit) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;

      let orderByOBject = {};

      if (query.order_by && (query.order_type == "time" || !query?.order_type)) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }

      let dataToFilter = { ...query, ...{ channel_id: req?.channel_id || "" } };

      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      //Check for Mentor
      //
      let dataPermission = await this.channelPermissionService.findOne({
        user_id: req?.user_id,
        channel_id: req?.channel_id,
      });

      if (dataPermission?.channel_role !== "mentor") {
        dataToFilter = { ...dataToFilter, ...{ to_level: dataPermission?.level_number } };
      }
      let dataReturn = await this.redeemService.filter(dataToFilter, orderByOBject, page, limit);

      if (dataReturn) {
        let dataIds = [];
        for (let itemReturn of dataReturn) {
          dataIds.push(itemReturn?._id);
        }

        let dataChannelPermission = [];
        //Get Data level
        if (query?.channel_id) {
          let dataUserIds = dataReturn?.map((value) => {
            return value?.user_id?._id?.toString();
          });
          //get permission
          let dataFilterMember = {
            channel_id: query?.channel_id,
            user_ids: dataUserIds,
          };
          dataChannelPermission = await this.channelPermissionService.filterWithoutChannel(
            dataFilterMember,
            {},
            1,
            limit
          );
        }
        for (let dataReturnItem in dataReturn) {
          //Check user
          let dataToMerge = dataChannelPermission?.reduce(function (filtered, value) {
            if (value?.user_id?._id?.toString() == dataReturn[dataReturnItem]?.user_id?._id?.toString()) {
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
            dataReturn[dataReturnItem] = { ...dataReturn[dataReturnItem], ...{ user_id: dataToMerge[0] } };
          }
        }
      }

      let dataCount = await this.redeemService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      console.log(error, "error");
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
  async getListUserRedeemMission(query: ListRedeemPermissionDto, res: Response, req: ExpressRequestDto) {
    try {
      // console.log(req.headers, "req.headers");
      if (Number(query.limit) > 1000 || !query.limit) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;

      let orderByOBject = {};

      if (query.order_by && (query.order_type == "time" || !query?.order_type)) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }

      let dataToFilter = { ...query };

      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      let dataReturn = await this.redeemPermissionService.filter(dataToFilter, orderByOBject, page, limit);

      // Add point into Data
      // if (dataReturn) {
      //   let dataIds = [];
      //   for (let itemReturn of dataReturn) {
      //     dataIds.push(itemReturn?._id);
      //   }

      //   let dataChannelPermission = [];
      //   //Get Data level
      //   if (query?.channel_id) {
      //     let dataUserIds = dataReturn?.map((value) => {
      //       return value?.user_id?._id?.toString();
      //     });
      //     //get permission
      //     let dataFilterMember = {
      //       channel_id: query?.channel_id,
      //       user_ids: dataUserIds,
      //     };
      //     dataChannelPermission = await this.channelPermissionService.filterWithoutChannel(
      //       dataFilterMember,
      //       {},
      //       1,
      //       limit
      //     );
      //   }
      //   for (let dataReturnItem in dataReturn) {
      //     //Check user
      //     let dataToMerge = dataChannelPermission?.reduce(function (filtered, value) {
      //       if (value?.user_id?._id?.toString() == dataReturn[dataReturnItem]?.user_id?._id?.toString()) {
      //         filtered.push({
      //           ...value?.user_id?.toObject(),
      //           ...{
      //             channel_role: value?.channel_role,
      //             coin_number: value?.coin_number,
      //             permission: value?.permission,
      //             point: value?.point,
      //             level_number: value?.level_number,
      //           },
      //         });
      //       }
      //       return filtered;
      //     }, []);

      //     if (dataToMerge && dataToMerge[0]) {
      //       dataReturn[dataReturnItem] = { ...dataReturn[dataReturnItem], ...{ user_id: dataToMerge[0] } };
      //     }
      //   }
      // }

      let dataCount = await this.redeemService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      console.log(error, "error");
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param res
   */
  async handleSession(req: ExpressRequestDto) {
    try {
      let authCodeHeader = req?.headers;
      let authCodeString: string = "";
      if (authCodeHeader && authCodeHeader["x-authorization"]) {
        authCodeString = authCodeHeader["x-authorization"]?.toString();
      }
      if (authCodeHeader && authCodeHeader["authorization"]) {
        authCodeString = authCodeHeader["authorization"].replace("Bearer ", "");
      }

      try {
        let hashPassword = process.env.HASH_PASSWORD;
        const { data, exp } = (await new JwtService().decode(authCodeString)) as DecodeUserToken;
        if (!data || !exp) {
          return null;
        }
        let dataSession: any = null;
        if (data?.session) {
          //Data User session
          dataSession = await this.userService.findById(data?._id?.toString(), {});
        } else {
          let dataAnonymousSession = await this.userAnonymousSession.findById(data?._id, {});
          let deviceId = dataAnonymousSession?.device_id;
          dataSession = await this.userAnonymousService.findOne({ device_id: deviceId });
        }
        return dataSession;
      } catch (error) {
        // console.log(error);
        return null;
      }
    } catch (error) {}
  }

  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewRedeem(createRedeemData: CreateRedeemDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let userId = req?.user_id;
      let userPermission = await this.channelPermissionService.findOne({
        user_id: userId,
        channel_id: req?.channel_id,
      });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("mentor/list") !== -1)
      ) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "mentor/list")) {
        havePermission = true;
      }

      if (!havePermission) {
        throw new ForbiddenException("You not have permission for this action!");
      }

      let channelId = req?.channel_id || null;
      createRedeemData = {
        ...createRedeemData,
        ...{ user_id: userObject._id.toString(), channel_id: channelId },
      };
      //Check Permission

      if (this.validateJson(createRedeemData?.attach_files?.toString())) {
        createRedeemData = {
          ...createRedeemData,
          ...{
            attach_files: JSON.parse(createRedeemData?.attach_files?.toString()),
          },
        };
      } else {
        createRedeemData = {
          ...createRedeemData,
          ...{
            attach_files: [],
          },
        };
      }

      if (this.validateJson(createRedeemData?.gift_data?.toString())) {
        createRedeemData = {
          ...createRedeemData,
          ...{
            gift_data: JSON.parse(createRedeemData?.gift_data?.toString()),
          },
        };
      } else {
        createRedeemData = {
          ...createRedeemData,
          ...{
            gift_data: [],
          },
        };
      }
      let dataMissionId = [];
      if (this.validateJson(createRedeemData?.mission_data?.toString())) {
        let dataMission = JSON.parse(createRedeemData?.mission_data?.toString());
        //Process Data

        for (let dataIndex in dataMission) {
          let dataMissionAction = dataMission[dataIndex]?.mission_action;
          if (dataMissionAction) {
            let dataFilter = dataMissionAction?.filter((item: any, index: any) => {
              if (item?.action_name) {
                return true;
              } else {
                return false;
              }
            });

            let dataText = dataFilter?.map((item: any, index: any) => {
              if (item?.action_name) {
                return item?.action_name;
              }
            });
            dataMission[dataIndex].action_name = dataText;
          }
        }

        let dataMissionObjectArray: any[] = await this.redeemService.createMisionData(dataMission);

        dataMissionId = dataMissionObjectArray?.map((item: RedeemMission, index: number) => {
          return item?._id;
        });

        createRedeemData = {
          ...createRedeemData,
          ...{
            mission_data: dataMissionId,
          },
        };
      } else {
        createRedeemData = {
          ...createRedeemData,
          ...{
            mission_data: [],
          },
        };
      }

      let dataCreate: any = await this.redeemService.create(createRedeemData);
      let dataReturn = await this.redeemService.findById(dataCreate?._id?.toString());

      let dataUpdateFilter = {
        ids: dataMissionId,
      };
      let dataUpdateMission = {
        user_id: userObject?._id?.toString(),
        channel_id: channelId,
        redeem_id: dataReturn?._id?.toString(),
      };
      await this.redeemService.updateMissionArray(dataUpdateFilter, dataUpdateMission);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      console.log(error, "error");
      throw new NotFoundException(error.message);
    }
  }

  async createNewRedeemPermission(dataCreate: CreateRedeemPermissionDto, req: ExpressRequestDto, res: Response) {
    try {
      //Check User Id
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let dataRedeemArray = _.uniq(dataCreate?.redeem_id?.split(","));

      let dataRedeemArrayCheckDuplicate = dataRedeemArray.filter(
        (item, index) => dataRedeemArray.indexOf(item) === index
      );
      //Check Redeem

      let dataToFilter = {
        redeem_ids: dataRedeemArrayCheckDuplicate,
        user_id: req?.user_id,
        channel_id: req?.channel_id,
      };
      let dataCreateRedeemMission = await this.redeemPermissionService.filter(dataToFilter, {}, 1, 100);
      //check data
      let dataRedeemIds = dataCreateRedeemMission.map((itemReturn: RedeemPermission, index: number) => {
        return itemReturn?.redeem_id?._id?.toString();
      });

      for (let redeemItem of dataRedeemArrayCheckDuplicate) {
        if (dataRedeemIds?.indexOf(redeemItem) === -1) {
          //Check Redeem ID
          let redeemObject = await this.redeemService.findOne({ _id: redeemItem });
          if (!redeemObject) {
            throw new ForbiddenException("Redeem is invalid");
          }
          let userPermission = await this.channelPermissionService.findOne({
            user_id: userObject?._id.toString(),
            channel_id: req?.channel_id.toString(),
          });
          if (userPermission?.level_number < redeemObject?.redeem_level && userPermission?.channel_role !== "mentor") {
            console.log("level is not enough!!!");
            continue;
          }

          //Get Redeem Mission
          let dataRedeemMission = await this.redeemService.filterRedeemMission({ redeem_id: redeemItem }, {}, 1, 1000);

          //Get all Redeem Data
          //Check if have Data Redeem Mission
          if (dataRedeemMission?.length) {
            for (let dataRedeemItem of dataRedeemMission) {
              //Create permision
              let point_data = dataRedeemItem?.mission_action.map((x) => {
                return Object.assign({ point_number: 0, status: "process" }, x);
              });

              const nowUTC7 = moment().tz("Asia/Ho_Chi_Minh");
              const startOfDay = nowUTC7.clone().startOf("day").toDate();

              let start_time = nowUTC7
                .clone()
                .startOf("day")
                .add(Number(dataRedeemItem?.number_of_day) - 1, "days")
                .toDate();
              let end_time = nowUTC7
                .clone()
                .endOf("day")
                .add(Number(dataRedeemItem?.number_of_day) - 1, "days")
                .toDate();

              let dataInsert = {
                user_id: req?.user_id,
                redeem_id: redeemItem,
                channel_id: redeemObject?.channel_id?.toString(),
                redeem_mission_id: dataRedeemItem?._id?.toString(),
                point_data: point_data,
                start_time: start_time,
                end_time: end_time,
                status: "process",
              };
              console.log(dataInsert, "dataInsert");
              let dataReturnInsert = await this.redeemPermissionService.upsert(dataInsert);
              if (dataReturnInsert) {
                dataCreateRedeemMission.push(dataReturnInsert);
              }
            }
          }
        }
      }
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.CREATED)
        .json(dataCreateRedeemMission);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   *
   * @param fromUser
   * @param dataRedeem
   * @returns
   */
  async handleSendNotificationToAll(
    fromUser: User,
    dataRedeem: RedeemNew,
    authCode: string = "",
    channelObject: any = {},
    req: ExpressRequestDto
  ) {
    try {
      let notificationTitle = fromUser.display_name ? fromUser.display_name : fromUser.user_login;
      let chatContentToSend = `${notificationTitle} đã đăng:`;
      if (chatContentToSend && chatContentToSend.length >= 255) {
        chatContentToSend = chatContentToSend.substring(0, 250) + "...";
      }
      notificationTitle = notificationTitle + ` đăng bài mới!`;

      if (notificationTitle && notificationTitle.length >= 70) {
        notificationTitle = notificationTitle.substring(0, 68) + "...";
      }
      let userIdArray = [];
      let channelId = dataRedeem?.channel_id?.toString();
      let emailArray = [];
      for (let itemPage: number = 1; itemPage <= 10; itemPage++) {
        let allUser = await this.channelPermissionService.filter({ channel_id: channelId }, {}, itemPage, 1000);
        for (let itemUser of allUser) {
          if (itemUser?.user_id?._id) {
            userIdArray.push(itemUser?.user_id?._id?.toString());
            let userEmail = itemUser?.user_id?.user_email;
            if (userEmail) {
              emailArray.push(userEmail);
            }
          }
        }
        if (!allUser?.length) {
          break;
        }
      }

      //Update Email
      let dataFirestore = getFirestore();

      for (let emailItem of emailArray) {
        //Let dataToUpdate
        let dataToUpdate = {
          brand_name: "Gamifa",
          channel: channelObject?.name?.toString(),
          post_name: "",
          //@ts-ignore
          post_image: dataRedeem?.attach_files[0]?.media_url || "",
          email: emailItem,
          fullname: fromUser.display_name,
          user_id: fromUser?._id?.toString(),
          post_url: (channelObject?.domain || "https://gamifa.vn") + "/v/post/" + "",
          event_name: "send_mail_notification",
          is_send_email: false,
        };

        //Update
        const dataUserStore = dataFirestore.collection("Users");
        await dataUserStore
          .add(dataToUpdate)
          .then(() => {
            console.log("User added!");
          })
          .catch((error) => {
            console.log(error);
          });
      }

      if (userIdArray && userIdArray?.length) {
        let dataToSendNotification = {
          redeem_id: dataRedeem?._id?.toString(),
          path: "/v/post/",
          data_id: "",
        };
        let notificationContent = chatContentToSend;
        let dataNotification = {
          createdBy: fromUser._id.toString(),
          user_id: userIdArray,
          channel_id: req?.channel_id,
          title: notificationTitle?.toString(),
          content: notificationContent,
          param: JSON.stringify(dataToSendNotification),
          redeem_id: dataRedeem?._id?.toString(),
          type_action: "link",
          router: "NAVIGATION_LIST_NOTIFICATIONS_SCREEN",
          click_action: "",
          image: "",
          channel: "user",
        };
        await this.notificationHelper.handleSendNotification(dataNotification, authCode);
      }

      return true;
    } catch (error) {
      console.log(error, "error");
      return false;
    }
  }

  /**
   * @author Tony Vu
   * @param fromUser
   * @param toUser
   * @param chatContent
   * @param orderPnr
   * @returns
   */
  async handleSendNotification(
    fromUser: User,
    dataRedeem: RedeemNew,
    dataComment: any,
    authCode: string,
    channelObject: Channel,
    req: ExpressRequestDto
  ) {
    try {
      let notificationTitle = fromUser.display_name ? fromUser.display_name : fromUser.user_login;
      let chatContentToSend,
        chatContentRaw = `${notificationTitle} đã bình luận trong bài viết: ${dataComment.content}`;
      if (chatContentToSend && chatContentToSend.length >= 255) {
        chatContentToSend = chatContentToSend.substring(0, 250) + "...";
      }
      notificationTitle = notificationTitle + ` đã bình luận trong `;

      if (notificationTitle && notificationTitle.length >= 70) {
        notificationTitle = notificationTitle.substring(0, 68) + '..."';
      } else {
        notificationTitle = notificationTitle + '"';
      }

      let userIdArray = [];
      let emailArray = [];

      // let dataUser = await this.userService.filter({ notification_redeem: dataRedeem?._id?.toString() }, {}, 1, 1000);
      // for (let userItem of dataUser) {
      //   if (userItem?._id?.toString() !== fromUser?._id?.toString()) {
      //     userIdArray.push(userItem._id.toString());
      //     emailArray.push(userItem?.user_email?.toString())
      //   }
      // }

      //Update Email
      let dataFirestore = getFirestore();

      for (let emailItem of emailArray) {
        //Let dataToUpdate
        let dataToUpdate = {
          brand_name: "Gamifa",
          channel: channelObject?.name?.toString(),
          content: chatContentRaw,
          post_name: "",
          //@ts-ignore
          post_image: dataRedeem?.attach_files[0]?.media_url || "",
          email: emailItem,
          fullname: fromUser.display_name,
          user_id: fromUser?._id?.toString(),
          post_url: (channelObject?.domain || "https://gamifa.vn") + "/v/post/" + "",
          event_name: "reply_notification",
          is_send_email: false,
        };

        //Update
        const dataUserStore = dataFirestore.collection("Users");
        await dataUserStore
          .add(dataToUpdate)
          .then(() => {
            console.log("User added!");
          })
          .catch((error) => {
            console.log(error);
          });
      }

      if (userIdArray && userIdArray?.length) {
        let dataToSendNotification = {
          redeem_id: dataRedeem?._id?.toString(),
          path: "/v/post/",
          data_id: "",
        };
        let notificationContent = chatContentToSend;
        let dataNotification = {
          createdBy: fromUser._id.toString(),
          user_id: userIdArray,
          title: notificationTitle?.toString(),
          content: notificationContent,
          channel_id: req?.channel_id,
          param: JSON.stringify(dataToSendNotification),
          redeem_id: dataRedeem?._id?.toString(),
          type_action: "link",
          router: "NAVIGATION_LIST_NOTIFICATIONS_SCREEN",
          click_action: "",
          image: "",
          channel: "user",
        };
        await this.notificationHelper.handleSendNotification(dataNotification, authCode);
      }

      return true;
    } catch (error) {
      return false;
    }
  }
  /**
   *
   * @param str
   * @returns
   */
  validateJson(str: string) {
    try {
      let dataJson = JSON.parse(str);
      if (dataJson?.length === 0) {
        return false;
      } else {
        return true;
      }
    } catch (e) {
      return false;
    }
  }

  /**
   * @author Tony Vu
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleGetDetailRedeem(id: string, query: ListRedeemDto, res: Response, req: ExpressRequestDto) {
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
      } else {
        dataToFilter = { ...dataToFilter, ...{ post_slug: id.toString() } };
      }

      let dataReturn: any = await this.redeemService.findOne(dataToFilter);
      dataReturn = { ...dataReturn?.toObject() };

      let dataNotification = [];

      if (req?.user_id) {
        let dataAuth = await this.userService.findById(req?.user_id, {});
        //@ts-ignore
        if (dataAuth && dataAuth?.notification_redeem) {
          //@ts-ignore
          for (let dataItemNotification of dataAuth?.notification_redeem) {
            dataNotification.push(dataItemNotification?.toString());
          }
        }
      }

      if (dataNotification?.indexOf(dataReturn?._id?.toString()) !== -1) {
        dataReturn = { ...dataReturn, ...{ is_notification: true } };
      } else {
        dataReturn = { ...dataReturn, ...{ is_notification: false } };
      }

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
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleUpdateRedeemByAdmin(dataUpdate: UpdateRedeemDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject?._id?.toString();
      let channelId = req?.channel_id || null;
      let redeemObject = await this.redeemService.findById(dataUpdate?._id?.toString());

      let userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("redeem/update") !== -1)
      ) {
        havePermission = true;
      }
      if (redeemObject?.user_id?._id?.toString() == userId) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "redeem/update")) {
        havePermission = true;
      }

      if (!havePermission) {
        throw new ForbiddenException("You not have permission for this action!");
      }
      // if (dataUpdate.mission_data) {
      //   dataUpdate = { ...dataUpdate, ...{ mission_data: JSON.parse(dataUpdate.mission_data?.toString()) } };
      // }

      let dataMissionId = [];
      if (this.validateJson(dataUpdate?.mission_data?.toString())) {
        //Let data
        //Remove All history data
        await this.redeemPermissionService.removeMany({ redeem_id: dataUpdate?._id?.toString() });
        await this.redeemService.removeMisionMany({ redeem_id: dataUpdate?._id?.toString() });
        let dataMission = JSON.parse(dataUpdate?.mission_data?.toString());
        let dataMissionObjectArray: any[] = await this.redeemService.createMisionData(dataMission);

        dataMissionId = dataMissionObjectArray?.map((item: RedeemMission, index: number) => {
          return item?._id;
        });

        dataUpdate = {
          ...dataUpdate,
          ...{
            mission_data: dataMissionId,
          },
        };
      }

      if (dataUpdate.attach_files) {
        dataUpdate = { ...dataUpdate, ...{ attach_files: JSON.parse(dataUpdate.attach_files?.toString()) } };
      }
      if (dataUpdate.gift_data) {
        dataUpdate = { ...dataUpdate, ...{ gift_data: JSON.parse(dataUpdate.gift_data?.toString()) } };
      }

      let dataReturn = await this.redeemService.update(dataUpdate);

      let dataUpdateFilter = {
        ids: dataMissionId,
      };
      let dataUpdateMission = {
        user_id: userObject?._id?.toString(),
        channel_id: channelId,
        redeem_id: dataReturn?._id?.toString(),
      };
      await this.redeemService.updateMissionArray(dataUpdateFilter, dataUpdateMission);

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
  async handleDeleteRedeem(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }

      let userId = userObject._id.toString();
      let redeemObject = await this.redeemService.findById(id);
      let channelId = redeemObject.channel_id;
      let userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("comment/delete") !== -1)
      ) {
        havePermission = true;
      }
      if (redeemObject?.user_id?._id?.toString() == userId) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "redeem/delete")) {
        havePermission = true;
      }

      if (havePermission) {
        //Check Permission
        let dataReturn = await this.redeemService.remove(id);
        //Remove all Mission Data
        //Remove All Permission Data
        await this.redeemPermissionService.removeMany({ redeem_id: id });
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
   * @param str
   * @returns
   */
  toSlug(str: string) {
    str = str.toLowerCase();
    str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, "a");
    str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, "e");
    str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, "i");
    str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, "o");
    str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, "u");
    str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, "y");
    str = str.replace(/(đ)/g, "d");
    str = str.replace(/([^0-9a-z-\s])/g, "");
    str = str.replace(/(\s+)/g, "-");
    str = str.replace(/^-+/g, "");
    str = str.replace(/-+$/g, "");
    return str;
  }
}
