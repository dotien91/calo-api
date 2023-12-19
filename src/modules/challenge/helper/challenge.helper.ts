import { Response, Request } from "express";
import {
  ForbiddenException,
  HttpStatus,
  NotFoundException,
  Injectable,
  BadRequestException,
  Res,
  Req,
  Param,
} from "@nestjs/common";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateChallengeDto } from "../dto/create-challenge.dto";
import { ChallengeService } from "../services/challenge.service";
import { ListChallengeDto } from "../dto/list-challenge.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UpdateChallengeDto } from "../dto/update-challenge.dto";
import { Types } from "mongoose";
import { ChatMediaService } from "../../../modules/chat_media/services/chat_media.service";
import { User } from "../../../modules/user/schemas/user.schema";
import { CreateChallengePermissionDto } from "../dto/create-challenge_permission.dto";
import { ChallengePermissionService } from "../services/challenge_permission.service";
import { ChallengeViewService } from "../services/challenge_view.service";
import { CreateChallengeViewDto } from "../dto/create-challenge_view.dto";
import { UserOptionService } from "../../../modules/user/services/user_option.service";
import * as _ from "lodash";
import { UserSessionService } from "../../../modules/user/services/user_session.service";
import { ListChallengePermissionDto } from "../dto/list-challenge_permission.dto";
import { ChallengeGameService } from "../services/challenge_game.service";
import { CreateChallengeGameDto } from "../dto/create-challenge_game.dto";
import { UpdateChallengeGameDto } from "../dto/update-challenge_game.dto";
import { ChallengeView } from "../schemas/challenge_view.schema";
import { ChannelPermissionService } from "../../../modules/channel/services/channel_permission.service";
import { CreateChallengeJoinPermissionDto } from "../dto/create-challenge_join_permission.dto";
import { ListChallengeGameDto } from "../dto/list-challenge_game.dto";
import { CreateChallengeNotificationDto } from "../dto/create-challenge_notification.dto";
import { ChallengeNotificationService } from "../services/challenge_notification.service";
import { ListChallengeNotificationDto } from "../dto/list-challenge_notification.dto";
import { CreateChallengeActivityDto } from "../dto/create-challenge_activity.dto";
import { ChallengeActivityService } from "../services/challenge_activity.service";
import { UpdateChallengeActivityDto } from "../dto/update-challenge_activity.dto";
import { UpdateChallengePermissionDto } from "../dto/update-challenge_permission.dto";
import { UserService } from "../../../modules/user/services/user.service";
import { NotificationHelper } from "../../../modules/notification/helper/notification.helper";
import { Challenge } from "../schemas/challenge.schema";
import { RequestService } from "../../../modules/request/services/request.service";
import { ChannelPermission } from "../../../modules/channel/schemas/channel_permission.schema";
import { ChallengePermission } from "../schemas/challenge_permission.schema";
import { EventHookNotificationService } from "../../../modules/hook/services/hook_notification.service";
import { ChannelService } from "../../../modules/channel/services/channel.service";
import { QueueService } from "../../../modules/queue/queue.service";
import { async } from "rxjs";
const { getFirestore } = require("firebase-admin/firestore");
const cron = require("node-cron");

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class ChallengeHelper {
  constructor(
    private challengeService: ChallengeService,
    private challengeGameService: ChallengeGameService,
    private userPermissionService: UserPermissionService,
    private chatMediaService: ChatMediaService,
    private challengePermissionService: ChallengePermissionService,
    private challengeViewService: ChallengeViewService,
    private userOptionService: UserOptionService,
    private userSessionService: UserSessionService,
    private channelPermissionService: ChannelPermissionService,
    private challengeNotificationService: ChallengeNotificationService,
    private challengeActivityService: ChallengeActivityService,
    private userService: UserService,
    private notificationHelper: NotificationHelper,
    private requestService: RequestService,
    private readonly channelService: ChannelService,
    private readonly eventHookNotificationService: EventHookNotificationService,
    private readonly queueService: QueueService
  ) {
    setTimeout(async () => {
      //await this.handleProcessModuleCount()
    }, 1000);
  }

  async handleProcessModuleCount() {
    const dataChallenge = await this.challengeService.filter({}, {}, 1, 1000);
    for (const dataaChallengeItem of dataChallenge) {
      const countChild = await this.challengeGameService.count({
        challenge_id: dataaChallengeItem?._id?.toString(),
        is_child: "1",
      });
      const count = await this.challengeGameService.count({ challenge_id: dataaChallengeItem?._id?.toString() });
      const dataUpdate = {
        _id: dataaChallengeItem?._id?.toString(),
        module_child_count: countChild,
        module_count: count,
      };
      await this.challengeService.update(dataUpdate);
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
  async createNewChallenge(createChallengeData: CreateChallengeDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      const authCode = req?.auth_code;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();

      const headerObject = req?.headers;
      let channelId: string = createChallengeData?.channel_id;
      if (headerObject && headerObject["x-channel"]) {
        channelId = headerObject["x-channel"]?.toString();
      }

      const userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("challenge/delete") !== -1)
      ) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "challenge/delete")) {
        havePermission = true;
      }

      if (!havePermission) {
        throw new ForbiddenException("You not have permission for this activity!");
      }

      if (createChallengeData?.gift_data) {
        const dataGiftId = [];
        const giftObject = JSON.parse(createChallengeData?.gift_data);
        for (const itemGift of giftObject) {
          try {
            const objectId = new Types.ObjectId(itemGift);
            if (!objectId) {
              throw new NotFoundException("Partner is invalid (Not is an ObjectID)");
            } else {
              dataGiftId.push(itemGift);
            }
          } catch (error) {
            delete createChallengeData?.gift_data;
          }
        }

        if (dataGiftId && dataGiftId?.length) {
          createChallengeData = {
            ...createChallengeData,
            ...{ gift_data: dataGiftId },
          };
        }
      } else {
        createChallengeData = { ...createChallengeData, ...{ gift_data: [] } };
      }

      if (createChallengeData?.challenge_stage) {
        createChallengeData = {
          ...createChallengeData,
          ...{ challenge_stage: JSON.parse(createChallengeData?.challenge_stage) },
        };

        //Update New Stage
      } else {
        createChallengeData = { ...createChallengeData, ...{ challenge_stage: [] } };
      }

      createChallengeData = { ...createChallengeData, ...{ user_id: userId } };
      if (channelId) {
        createChallengeData = { ...createChallengeData, ...{ channel_id: channelId } };
      }
      const dataCreate: any = await this.challengeService.create(createChallengeData);
      const dataReturn = await this.challengeService.findById(dataCreate?._id?.toString());
      //Send to All User
      setTimeout(async () => {
        await this.handleSendNotificationToAll(userObject, dataReturn, authCode, userPermission?.channel_id, req);
      }, 1000);

      // let channel = await this.channelService.findById(channelId);

      if (createChallengeData.add_all_user === true && channelId) {
        const listPermissions = await this.channelPermissionService.filter(
          {
            channel_id: channelId,
          },
          {},
          1,
          9999999
        );
        const challengeGame = await this.challengeGameService.findOne({ _id: createChallengeData.game_id.toString() });
        console.log(listPermissions, "listPermissions");
        console.log(challengeGame, "challengeGame");
        const listUserIds = listPermissions.map((x) => {
          return x.user_id?._id.toString();
        });
        console.log(listUserIds, "listUserIds");
        this.queueService.addTaskChallengeAddAllUser({
          list_user_id: listUserIds,
          challenge_id: dataCreate._id,
          channel_id: channelId,
          game_id: createChallengeData.game_id,
          game_type: challengeGame.game_type,
          official_status: 1,
        });
      }
      setTimeout(async () => {
        // if (dataReturn?.start_time) {
        // let minute: number, hour: number, day: number, month: number, year: number;
        // minute = new Date(dataReturn.start_time?.toString()).getMinutes();
        // hour = new Date(dataReturn.start_time?.toString()).getHours();
        // day = new Date(dataReturn.start_time?.toString()).getDate();
        // month = new Date(dataReturn.start_time?.toString()).getMonth() + 1; // Months are 0-based in JavaScript
        // year = new Date(dataReturn.start_time?.toString()).getFullYear();
        // cron.schedule(`0 ${minute} ${hour} ${day} ${month} * ${year}`, async () => {
        //     //Update dataPost
        const dataTitle = "Thử thách " + dataReturn?.title + " đang diễn ra!";
        const dataSlug = this.toSlug(dataTitle);

        const dataCreatePost = {
          post_language: "vi",
          post_content: "",
          post_slug: dataSlug,
          post_title: dataTitle,
          channel_id: dataReturn?.channel_id?.toString(),
          post_expert: dataTitle,
          post_status: "publish",
          user_id: userObject?._id?.toString(),
          country: "VN",
          data_json_type: "challenge",
          ref_id: dataCreate?._id,
          data_json: JSON.stringify(dataReturn),
          //@ts-ignore
          post_avatar: dataReturn?.avatar?._id?.toString(),
        };
        await this.requestService.create(dataCreatePost);
        // })

        // }

        if (dataReturn?.end_time) {
          let minuteEnd: number, hourEnd: number, dayEnd: number, monthEnd: number, yearEnd: number;
          minuteEnd = new Date(dataReturn.end_time?.toString()).getMinutes();
          hourEnd = new Date(dataReturn.end_time?.toString()).getHours();
          dayEnd = new Date(dataReturn.end_time?.toString()).getDate();
          monthEnd = new Date(dataReturn.end_time?.toString()).getMonth() + 1; // Months are 0-based in JavaScript
          yearEnd = new Date(dataReturn.end_time?.toString()).getFullYear();
          cron.schedule(`* ${minuteEnd} ${hourEnd} ${dayEnd} ${monthEnd} * ${yearEnd}`, async () => {
            await this.requestService.removeOne({ ref_id: dataCreate?._id?.toString() });
          });
        }
      }, 200);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

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
    str = str.replace(/-+$/g, "") + new Date().getTime();
    return str;
  }

  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewChallengeGame(createChallengeData: CreateChallengeGameDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();

      const headerObject = req?.headers;
      let channelId: string = createChallengeData?.channel_id;
      if (headerObject && headerObject["x-channel"]) {
        channelId = headerObject["x-channel"]?.toString();
      }

      const userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("challenge/delete") !== -1)
      ) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "challenge/delete")) {
        havePermission = true;
      }

      if (!havePermission) {
        throw new ForbiddenException("You not have permission for this activity!");
      }

      createChallengeData = { ...createChallengeData, ...{ user_id: userId } };

      if (createChallengeData?.game_activity) {
        createChallengeData = {
          ...createChallengeData,
          ...{ game_activity: JSON.parse(createChallengeData?.game_activity) },
        };
      } else {
        createChallengeData = { ...createChallengeData, ...{ game_activity: [] } };
      }

      if (createChallengeData?.custom_field) {
        createChallengeData = {
          ...createChallengeData,
          ...{ custom_field: JSON.parse(createChallengeData?.custom_field) },
        };
      } else {
        createChallengeData = { ...createChallengeData, ...{ custom_field: [] } };
      }

      let dataCreate: any = await this.challengeGameService.create(createChallengeData);
      dataCreate = dataCreate.toObject();
      dataCreate = {
        ...dataCreate,
        ...{
          user_id: await this.handleGetUserBase(userObject),
        },
      };

      const dataReturn = await this.challengeGameService.findOne({ _id: dataCreate?._id?.toString() });
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
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewChallengeActivity(
    createChallengeData: CreateChallengeActivityDto,
    res: Response,
    req: ExpressRequestDto
  ) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();

      //Check Permission Challenge
      const dataChallenge = await this.challengePermissionService.findOneWithPopulate({
        user_id: userId,
        challenge_id: createChallengeData.challenge_id,
      });

      if (!dataChallenge) {
        throw new ForbiddenException("You not have permission for this activity!");
      }

      const headerObject = req?.headers;
      let channelId: string = dataChallenge?.challenge_id?.channel_id?.toString();
      if (headerObject && headerObject["x-channel"]) {
        channelId = headerObject["x-channel"]?.toString();
      }

      //Update New
      createChallengeData = { ...createChallengeData, ...{ user_id: userId, channel_id: channelId } };

      if (createChallengeData?.data_activity) {
        createChallengeData = {
          ...createChallengeData,
          ...{ data_activity: JSON.parse(createChallengeData?.data_activity) },
        };
      } else {
        createChallengeData = { ...createChallengeData, ...{ data_activity: [] } };
      }

      let dataCreate: any = await this.challengeActivityService.create(createChallengeData);
      dataCreate = dataCreate.toObject();
      dataCreate = {
        ...dataCreate,
        ...{
          user_id: await this.handleGetUserBase(userObject),
        },
      };
      const challenge = await this.challengeService.findById(createChallengeData?.challenge_id.toString());
      const channel = await this.channelService.findById(channelId);
      this.eventHookNotificationService.sendNotiNMailUpActivityChallenge({
        send_user_id: req?.user_id.toString(),
        user_id: channel.admin_user,
        channel_id: channelId,
        path: `/r/challenge/detail/${createChallengeData?.challenge_id.toString()}?tab=activity_pending`,
        mail_template: "up_activity_challenge",
        content: (params: any) => {
          return `Người dùng ${
            params?.display_name
          } điểm danh hoạt động trong thử thách ${challenge.title.toString()} của kênh ${params?.channel_name}`;
        },
        title: `ĐIỂM DANH THỬ THÁCH ${challenge.title.toString().toLocaleUpperCase}`,
      });

      const dataReturn = await this.challengeActivityService.findOne({ _id: dataCreate?._id?.toString() });
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
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createChallengeNotification(
    createChallengeData: CreateChallengeNotificationDto,
    res: Response,
    req: ExpressRequestDto
  ) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();

      const headerObject = req?.headers;
      let channelId: string = createChallengeData?.channel_id;
      if (headerObject && headerObject["x-channel"]) {
        channelId = headerObject["x-channel"]?.toString();
      }

      const userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("challenge/delete") !== -1)
      ) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "challenge/delete")) {
        havePermission = true;
      }

      if (!havePermission) {
        throw new ForbiddenException("You not have permission for this activity!");
      }

      createChallengeData = { ...createChallengeData, ...{ user_id: userId } };

      if (createChallengeData?.public_album) {
        createChallengeData = {
          ...createChallengeData,
          ...{ public_album: JSON.parse(createChallengeData?.public_album) },
        };
      } else {
        createChallengeData = { ...createChallengeData, ...{ public_album: [] } };
      }

      let dataCreate: any = await this.challengeNotificationService.create(createChallengeData);
      dataCreate = dataCreate.toObject();
      dataCreate = {
        ...dataCreate,
        ...{
          user_id: await this.handleGetUserBase(userObject),
        },
      };

      const dataReturn = await this.challengeNotificationService.findOne({ _id: dataCreate?._id?.toString() });
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
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async updateChallenge(dataUpdate: UpdateChallengeDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const userId = userObject?._id?.toString();

      const dataChallengeUpdate = await this.challengeService.findById(dataUpdate?._id);
      const channelId: string = dataChallengeUpdate?.channel_id?.toString();

      const userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("challenge/delete") !== -1)
      ) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "challenge/delete")) {
        havePermission = true;
      }

      if (!havePermission) {
        throw new ForbiddenException("You not have permission for this activity!");
      }

      if (dataUpdate?.challenge_stage) {
        dataUpdate = {
          ...dataUpdate,
          ...{ challenge_stage: JSON.parse(dataUpdate?.challenge_stage) },
        };
      }

      if (dataUpdate?.gift_data) {
        dataUpdate = {
          ...dataUpdate,
          ...{ gift_data: JSON.parse(dataUpdate?.gift_data) },
        };
      }

      //Get Media Data
      const dataCreate: any = await this.challengeService.update(dataUpdate);
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
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async updateChallengeGame(dataUpdate: UpdateChallengeGameDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const userId = userObject?._id?.toString();

      const dataChallengeGame = await this.challengeGameService.findById(dataUpdate?._id, {});
      const channelId: string = dataChallengeGame?.channel_id?.toString();

      const userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("challenge/delete") !== -1)
      ) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "challenge/delete")) {
        havePermission = true;
      }

      if (!havePermission) {
        throw new ForbiddenException("You not have permission for this activity!");
      }

      if (dataUpdate?.game_activity) {
        dataUpdate = { ...dataUpdate, ...{ game_activity: JSON.parse(dataUpdate?.game_activity) } };
      }

      if (dataUpdate?.custom_field) {
        dataUpdate = { ...dataUpdate, ...{ custom_field: JSON.parse(dataUpdate?.custom_field) } };
      }
      //Get Media Data
      const dataCreate: any = await this.challengeGameService.update(dataUpdate);
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
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async updateChallengeActivity(dataUpdate: UpdateChallengeActivityDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const userId = userObject?._id?.toString();

      const dataActivity = await this.challengeActivityService.findById(dataUpdate?._id, {});

      // let dataChallengeGame = await this.challengeService.findById(dataUpdate?.challenge_id);
      const channelId: string = dataActivity?.channel_id?.toString();

      const userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("challenge/delete") !== -1)
      ) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "challenge/delete")) {
        havePermission = true;
      }

      if (!havePermission) {
        throw new ForbiddenException("You not have permission for this activity!");
      }

      if (dataUpdate?.data_activity) {
        dataUpdate = { ...dataUpdate, ...{ data_activity: JSON.parse(dataUpdate?.data_activity) } };
      }

      if (Number(dataUpdate?.official_status) == 1) {
        const dataPoint = dataUpdate?.point_value;
        //Update Challenge Permission
        const dataUpdateTotalPoint = {
          total_point: dataPoint,
        };

        await this.challengePermissionService.updateCount(
          {
            user_id: dataActivity?.user_id?._id?.toString(),
            challenge_id: dataActivity?.challenge_id?._id?.toString(),
          },
          dataUpdateTotalPoint
        );
      }

      //Get Media Data
      const dataCreate: any = await this.challengeActivityService.update(dataUpdate);

      const challenge = await this.challengeService.findById(dataActivity?.challenge_id?._id?.toString());
      this.eventHookNotificationService.sendNotiApplyActivityChallenge({
        send_user_id: req?.user_id?.toString(),
        user_id: dataCreate?.user_id.toString(),
        channel_id: channelId,
        path: `/r/challenge/detail/${channelId}?tab=activity_pending`,
        mail_template: "up_activity_challenge",
        content: (params: any) => {
          return `Điểm danh hoạt động trong thử thách ${challenge.title.toString()} kênh ${
            params?.channel_name
          } của bạn đã được phê duyệt`;
        },
        title: `ĐIỂM DANH THỬ THÁCH ${challenge.title.toString().toLocaleUpperCase} ĐÃ ĐƯỢC PHÊ DUYỆT`,
      });

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
  async getChallengeListByAdmin(query: ListChallengeDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "challenge/list")) {
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
        const dataReturn = await this.challengeService.filter(dataToFilter, orderByOBject, page, limit);
        const dataCount = await this.challengeService.count(dataToFilter);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new BadRequestException("You haven't permission for this Activity!");
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
  async handleGetListLike(query: ListChallengePermissionDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      } else {
        orderByOBject = { ...orderByOBject, ...{ total_point: "DESC" } };
      }
      let dataToFilter = { ...query };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const channelId = req?.channel_id || query?.channel_id;
      if (query?.search && channelId) {
        //Search User First
        const dataSearch = {
          search: query?.search,
          channel_permission: req?.channel_id,
        };
        const dataUserArray = await this.userService.filter(dataSearch, {}, page, limit);
        const ids = dataUserArray.map((itemValue, index) => {
          return itemValue?._id?.toString();
        });
        if (ids && ids.length) {
          dataToFilter = { ...dataToFilter, ...{ user_ids: ids } };
        } else {
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json([]);
        }
      }

      const dataReturn: any = await this.challengePermissionService.filterChallenge(
        dataToFilter,
        orderByOBject,
        page,
        limit,
        {}
      );

      let dataChannelPermission = null;

      //Get Data level
      if (channelId) {
        const dataUserIds = dataReturn?.map((value) => {
          return value?.user_id?._id?.toString();
        });
        //get permission
        const dataFilterMember = {
          channel_id: channelId,
          user_ids: dataUserIds,
        };
        dataChannelPermission = await this.channelPermissionService.filterWithoutChannel(
          dataFilterMember,
          {},
          1,
          limit
        );
      }
      for (const dataReturnItem in dataReturn) {
        //Check user
        const dataToMerge = dataChannelPermission?.reduce(function (filtered: any, value: any) {
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

      const dataCount = await this.challengePermissionService.count(dataToFilter);
      //Check User Level
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
   * @param res
   * @param req
   * @returns
   */
  async handleGetMyPermission(query: ListChallengePermissionDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      } else {
        orderByOBject = { ...orderByOBject, ...{ total_point: "DESC" } };
      }

      const myChallengePermission = await this.challengePermissionService.findOne({
        user_id: req?.user_id,
        challenge_id: query?.challenge_id,
      });
      const dataToFilter = { ...query, ...{ max_point: myChallengePermission?.total_point?.toString() } };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      const dataCount = await this.challengePermissionService.count(dataToFilter);
      //Check User Level
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .json(myChallengePermission);
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
  async handleGetListView(query: ListChallengeDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let sessionObject = null;
      if (req) {
        sessionObject = req?.session_data;
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
      const dataToFilter = { ...query, ...{ user_id: userId } };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      const dataReturn: any = await this.challengeViewService.filterChallenge(dataToFilter, {}, 1, query.limit, {
        video_id: true,
      });

      const dataReturnFinal = [];
      if (dataReturn && dataReturn.length) {
        for (const challengeItem of dataReturn) {
          dataReturnFinal.push({ ...challengeItem, ...{ is_like: true, is_view: false } });
        }
      }
      //let dataCount = await this.challengeService.count(dataToFilter);
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
  async getChallengeList(query: ListChallengeDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      if (req?.channel_id) {
        query = { ...query, ...{ channel_id: req?.channel_id } };
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      } else {
        orderByOBject = { ...orderByOBject, ...{ createdAt: "DESC" } };
      }

      const dataToFilter = { ...query };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      //Check Video View
      const dataReturn: any = await this.challengeService.filter(dataToFilter, orderByOBject, page, limit);
      for (const dataChallengeIndex in dataReturn) {
        dataReturn[dataChallengeIndex] = dataReturn[dataChallengeIndex]?.toObject();
      }
      const userId = req?.user_id || query?.auth_id;
      //List in
      if (userId) {
        const dataChallengeIds = dataReturn?.map((value: Challenge) => {
          return value?._id?.toString();
        });
        //Process total View
        const dataFilterPermission = {
          challenge_ids: dataChallengeIds,
          user_id: userId,
        };
        const dataJoinPermisson: ChallengePermission[] = await this.challengePermissionService.filter(
          dataFilterPermission,
          {},
          1,
          1000
        );

        for (const dataIndexChallenge in dataReturn) {
          const dataObjectJoinCourse = dataJoinPermisson?.filter((value) => {
            if (value?.challenge_id?.toString() == dataReturn[dataIndexChallenge]?._id?.toString()) {
              return value?.challenge_id?.toString();
            }
          });

          if (dataObjectJoinCourse?.length) {
            dataReturn[dataIndexChallenge] = {
              ...dataReturn[dataIndexChallenge],
              ...{ is_join: true },
            };
          } else {
            dataReturn[dataIndexChallenge] = {
              ...dataReturn[dataIndexChallenge],
              ...{ is_join: false },
            };
          }
        }
      }

      const countChallenge = await this.challengeService.count(dataToFilter);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": countChallenge })
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
  async getChallengeGameList(query: ListChallengeGameDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};
      let queryObject = {};
      if (query.game_type && query.game_type === "system") {
        queryObject = { ...orderByOBject, ...{ game_type: { $nin: ["custom", ""] } } };
        delete query.game_type;
      }
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }
      const dataToFilter = { ...queryObject, ...query };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      //Check Video View
      const dataReturn: any = await this.challengeGameService.filter(dataToFilter, orderByOBject, page, limit);

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
  async getChallengeActivityList(query: ListChallengeGameDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      } else {
        orderByOBject = { ...orderByOBject, ...{ createdAt: "DESC" } };
      }
      const dataToFilter = { ...query };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      //Check Video View
      const dataReturn: any = await this.challengeActivityService.filter(dataToFilter, orderByOBject, page, limit);

      const dataCount = await this.challengeActivityService.count(dataToFilter);
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
  async getListNotification(query: ListChallengeNotificationDto, res: Response, req: ExpressRequestDto) {
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

      //Check Video View
      const dataReturn: any = await this.challengeNotificationService.filter(dataToFilter, orderByOBject, page, limit);

      const dataCount = await this.challengeNotificationService.count(dataToFilter);
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
  async handleGetDetailChallenge(query: ListChallengeDto, id: string, res: Response, req: ExpressRequestDto) {
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
        let dataReturn: any = await this.challengeService.findOne(dataToFilter);
        dataReturn = dataReturn?.toObject();

        if (query?.auth_id) {
          //Process total View
          const dataFilterView = {
            challenge_id: dataReturn?._id?.toString(),
            user_id: query?.auth_id,
          };
          const dataView: ChallengeView[] = await this.challengeViewService.filter(dataFilterView, {}, 1, 1000);

          if (dataView && dataView[0]) {
            const dataObjectByChallenge = dataView?.map((value) => {
              return value?.challenge_id?.toString();
            });
            dataReturn = {
              ...dataReturn,
              ...{ total_view: dataObjectByChallenge?.length, module_view: dataObjectByChallenge },
            };
          }
        }
        dataReturn = { ...dataReturn, ...{ is_join: false } };
        if (req?.user_id) {
          //Let dataFilter
          const dataFilterPermission: any = await this.challengePermissionService.findOne({
            user_id: req?.user_id,
            challenge_id: id,
          });
          // let dataFilterPermission: any = await this.challengePermissionService.findOne({user_id: '64d5de2faa2fed17584510d2', challenge_id: id});

          if (dataFilterPermission) {
            dataReturn = {
              ...dataReturn,
              ...{ is_join: true, challenge_permission: dataFilterPermission?.toObject() },
            };
          }
        }

        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new NotFoundException("Challenge is not found!");
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
  async handleGetDetailChallengeGame(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

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
        const dataReturn = await this.challengeGameService.findOne(dataToFilter);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new NotFoundException("Challenge is not found!");
      }
    } catch (error) {
      console.log(error);
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
  async handleUpdateChallengeByAdmin(dataUpdate: UpdateChallengeDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = req?.user_id;
      const userPermission = await this.channelPermissionService.findOne({
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

      const dataChallenge = await this.challengeService.findById(dataUpdate._id.toString());
      if (
        dataChallenge?.user_id?._id.toString() === userObject._id.toString() ||
        (await this.userPermissionService.isHavePermission(userId, "challenge/update"))
      ) {
        const dataReturn = await this.challengeService.update(dataUpdate);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new BadRequestException("You haven't permission for this Activity!");
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
  async handleDeleteChallenge(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }

      const userId = userObject._id.toString();

      const challengeObject = await this.challengeService.findById(id);

      const channelId = challengeObject?.channel_id?._id;
      const userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("challenge/delete") !== -1)
      ) {
        havePermission = true;
      }
      if (challengeObject?.user_id?.toString() == userId) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "challenge/delete")) {
        havePermission = true;
      }
      if (havePermission) {
        const dataReturn = await this.challengeService.remove(id);
        setTimeout(async () => {
          await this.requestService.removeOne({ ref_id: id });
        });
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new BadRequestException("You haven't permission for this Activity!");
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
  async handleDeleteChallengeGame(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();

      const requestObject = await this.challengeGameService.findByIdPopulate(id, {});
      const channelId = requestObject?.channel_id;
      const userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("challenge/delete") !== -1)
      ) {
        havePermission = true;
      }
      if (requestObject?.user_id?.toString() == userId) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "challenge/delete")) {
        havePermission = true;
      }

      if (havePermission) {
        const dataReturn = await this.challengeGameService.remove(id);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async updateChallengePermission(dataUpdate: UpdateChallengePermissionDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();

      const requestObject = await this.challengeService.findById(dataUpdate?.challenge_id);
      const channelId = requestObject?.channel_id;
      const userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      if (userPermission?.official_status === 0 && dataUpdate.official_status === 1) {
        //send noti to hook "noti.challenge.required-join-challenge"
        this.eventHookNotificationService.sendNotiApllyJoinChallenge({
          send_user_id: req?.user_id?.toString(),
          user_id: dataUpdate?.user_id?.toString(),
          channel_id: channelId,
          path: `/r/challenge/detail/${dataUpdate?.challenge_id}?tab=member`,
          mail_template: "apply_join_challenge",
          content: (params: any) => {
            return `Yêu cầu muốn gia nhập thử thách ${requestObject.title.toString()} của kênh ${
              params?.channel_name
            } đã được quản trị viên phê duyệt`;
          },
          title: `YÊU CẦU THAM GIA THỬ THÁCH ${
            requestObject.title.toString().toLocaleUpperCase
          } CỦA BẠN ĐÃ ĐƯỢC PHÊ DUYỆT`,
        });
      }
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("challenge/delete") !== -1)
      ) {
        havePermission = true;
      }
      if (requestObject?.user_id?.toString() == userId) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "challenge/delete")) {
        havePermission = true;
      }

      if (havePermission) {
        const dataReturn = await this.challengePermissionService.update(dataUpdate);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new BadRequestException("You haven't permission for this Activity!");
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
  async processCreatePermission(dataFollow: CreateChallengePermissionDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      const authCode = req?.auth_code;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const challengeObject = await this.challengeService.findById(dataFollow.challenge_id);

      if (!challengeObject) {
        throw new NotFoundException("Challenge not found");
      }

      const userId = userObject._id.toString();

      const channelId = challengeObject?.channel_id;
      const userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("challenge/delete") !== -1)
      ) {
        havePermission = true;
      }
      if (challengeObject?.user_id?.toString() == userId) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "challenge/delete")) {
        havePermission = true;
      }
      if (havePermission) {
        const arrayReturn = [];
        const dataUserArray = dataFollow?.user_id?.split(",");
        for (const dataUserId of dataUserArray) {
          let dataToCreateNew = { ...dataFollow, ...{ user_id: dataUserId } };
          dataToCreateNew = {
            ...dataToCreateNew,
            ...{
              game_type: challengeObject?.game_id?.game_type,
              game_id: challengeObject?.game_id?._id,
              channel_id: challengeObject?.channel_id?._id,
            },
          };
          //Check permission
          const dataReturn = await this.challengePermissionService.update(dataToCreateNew);
          arrayReturn.push(dataReturn);
          //Update count Video
          const dataUpdateFilter = {
            _id: channelId,
          };
          await this.challengeService.updateCount(dataUpdateFilter, { join_number: 1 });
          setTimeout(async () => {
            const toUserObject = await this.userService.findOne({ _id: dataUserId });
            await this.handleSendNotification(
              userObject,
              toUserObject,
              challengeObject,
              authCode,
              userPermission?.channel_id,
              req
            );
          }, 500);
        }

        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(arrayReturn);
      } else {
        throw new ForbiddenException("You not have permission for this activity!");
      }
    } catch (error) {
      console.log(error, "error");
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
  async processCreateJoinPermission(
    dataFollow: CreateChallengeJoinPermissionDto,
    req: ExpressRequestDto,
    res: Response
  ) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const challengeObject = await this.challengeService.findById(dataFollow.challenge_id);
      if (req?.channel_id.toString() === challengeObject?.channel_id?._id.toString()) {
        const userChannelPermission = await this.channelPermissionService.findOne({
          user_id: userObject?._id.toString(),
          channel_id: req?.channel_id.toString(),
        });
        if (!userChannelPermission) {
          throw new BadRequestException("You are not in channel of challenge!");
        }
      } else {
        throw new BadRequestException("You are in another channel!");
      }
      if (!challengeObject) {
        throw new NotFoundException("Challenge not found");
      }

      const userId = userObject._id.toString();
      dataFollow = { ...dataFollow, ...{ official_status: 1, user_id: userObject?._id?.toString() } };
      //Check permission
      //Check Challenge
      if (challengeObject?.public_status == "private") {
        dataFollow = { ...dataFollow, ...{ official_status: 0 } };
      }
      dataFollow = {
        ...dataFollow,
        ...{
          game_type: challengeObject?.game_id?.game_type,
          game_id: challengeObject?.game_id?._id,
          channel_id: challengeObject?.channel_id?._id,
        },
      };
      const dataReturn = await this.challengePermissionService.update(dataFollow);

      //Update count Video
      const dataUpdateFilter = {
        _id: new Types.ObjectId(challengeObject?._id?.toString()),
      };
      await this.challengeService.updateCount(dataUpdateFilter, { join_number: 1 });
      const channel = await this.channelService.findById(challengeObject?.channel_id?.toString());

      //send noti to hook "noti.challenge.required-join-challenge"
      this.eventHookNotificationService.sendNotiNMailRequiredJoinChallenge({
        send_user_id: userObject?._id.toString(),
        user_id: challengeObject?.user_id?.toString(),
        channel_id: challengeObject?.channel_id?.toString(),
        path: `/r/challenge/detail/${challengeObject?._id.toString()}?tab=member_pending`,
        mail_template: "required_join_challenge",
        content: (params: any) => {
          return `Người dùng ${
            params?.display_name
          } muốn gia nhập thử thách ${challengeObject?.title.toString()} của kênh ${params?.channel_name}`;
        },
        title: "YÊU CẦU THAM GIA THỬ THÁCH",
      });

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
   * @param dataFollow
   * @param req
   * @param res
   * @returns
   */
  async processViewChallenge(dataFollow: CreateChallengeViewDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const authCode = req?.auth_code;

      const moduleObject = await this.challengeGameService.findById(dataFollow.module_id, {});

      const dataFilterPermission = {
        channel_id: moduleObject?.channel_id?.toString(),
        user_id: userObject?._id?.toString(),
      };
      const dataPermission = await this.channelPermissionService.findOne(dataFilterPermission);
      if (!dataPermission) {
        throw new ForbiddenException("You not have permission to this activity!");
      }

      if (!moduleObject) {
        throw new NotFoundException("Video not found");
      }

      const dataUpdate = {
        user_id: userObject._id.toString(),
        challenge_id: moduleObject?._id?.toString(),
        module_id: dataFollow?.module_id?.toString(),
      };

      const dataReturn = await this.challengeViewService.update(dataUpdate);

      //Update
      const dataChannelPoint = dataPermission?.channel_id?.point_data;
      //Check point
      let dataPoint = 1;
      if (dataChannelPoint && dataChannelPoint?.length) {
        for (const dataChannelPointItem of dataChannelPoint) {
          if (dataChannelPointItem?.key == "like_post") {
            dataPoint = parseInt(dataChannelPointItem?.value);
          }
        }
      }
      //Update user level
      //Update Count
      await this.channelPermissionService.updateCount(
        { _id: dataPermission?._id?.toString() },
        { point: dataPoint, point_month: dataPoint, point_week: dataPoint },
        authCode,
        {
          entity_id: dataFollow?.module_id?.toString(),
          entity_type: "module",
          content: moduleObject?.title,
          point_number: dataPoint,
          user_id: userObject?._id?.toString(),
        },
        "like_post"
      );

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
  async processRemoveChallengePermission(
    dataFollow: CreateChallengePermissionDto,
    req: ExpressRequestDto,
    res: Response
  ) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const challengeObject = await this.challengeService.findById(dataFollow.challenge_id);

      if (!challengeObject) {
        throw new NotFoundException("Challenge not found");
      }

      let userId = userObject._id.toString();
      if (dataFollow?.user_id) {
        userId = dataFollow?.user_id;
      }

      const channelId = challengeObject?.channel_id;
      const userPermission = await this.channelPermissionService.findOne({
        user_id: userObject?._id?.toString(),
        channel_id: channelId,
      });

      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && (userPermission?.permission?.indexOf)("challenge/delete") !== -1)
      ) {
        havePermission = true;
      }
      if (challengeObject?.user_id?.toString() == userId) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "challenge/delete")) {
        havePermission = true;
      }

      if (havePermission) {
        const dataUpdate = {
          user_id: userId,
          challenge_id: dataFollow.challenge_id.toString(),
        };

        const dataReturn = await this.challengePermissionService.removeOne(dataUpdate);

        //Update count Video
        const dataUpdateFilter = {
          _id: new Types.ObjectId(challengeObject._id.toString()),
        };
        await this.challengeService.updateCount(dataUpdateFilter, { join_number: -1 });
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new ForbiddenException("You not have permission for this activity!");
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   *
   * @param fromUser
   * @param dataRequest
   * @returns
   */
  async handleSendNotificationToAll(
    fromUser: User,
    dataChallenge: Challenge,
    authCode: string = "",
    channelObject: any = {},
    req: ExpressRequestDto
  ) {
    try {
      const fromUserName = fromUser.display_name ? fromUser.display_name : fromUser.user_login;
      //Title
      const titleNotification = "CHINH PHỤC THỬ THÁCH MỚI";
      let descriptionNotification = `Xin chào! Bạn đã sẵn sàng với ${dataChallenge.title} chưa? `;
      if (descriptionNotification && descriptionNotification.length >= 255) {
        descriptionNotification = descriptionNotification.substring(0, 250) + "...";
      }

      const userIdArray = [];
      const channelId = dataChallenge?.channel_id?.toString();
      const emailArray = [];
      if (channelId) {
        for (let itemPage: number = 1; itemPage <= 10; itemPage++) {
          const allUser = await this.channelPermissionService.filter({ channel_id: channelId }, {}, itemPage, 1000);
          for (const itemUser of allUser) {
            if (itemUser?.user_id?._id) {
              userIdArray.push(itemUser?.user_id?._id?.toString());
              const userEmail = itemUser?.user_id?.user_email;
              if (userEmail) {
                emailArray.push(itemUser?.user_id);
              }
            }
          }
          if (!allUser?.length) {
            break;
          }
        }
      }

      //Update Email
      const dataFirestore = getFirestore();

      for (const emailItem of emailArray) {
        //Let dataToUpdate
        const dataToUpdate = {
          brand_name: "Gamifa",
          channel: channelObject?.name?.toString(),
          post_name: dataChallenge.title,
          //@ts-ignore
          post_image: dataChallenge?.avatar?.media_url || "",
          email: emailItem?.user_email,
          fullname: emailItem?.display_name,
          user_id: fromUser?._id?.toString(),
          post_url: (channelObject?.domain || "https://gamifa.vn") + "/r/challenge/detail/" + dataChallenge?._id,
          event_name: "create_new_challenge",
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
        const dataToSendNotification = {
          request_id: dataChallenge?._id?.toString(),
          path: "/r/challenge/detail/",
          data_id: dataChallenge?._id?.toString(),
        };
        const dataNotification = {
          createdBy: fromUser._id.toString(),
          user_id: userIdArray,
          channel_id: req?.channel_id,
          title: titleNotification,
          content: descriptionNotification,
          param: JSON.stringify(dataToSendNotification),
          request_id: dataChallenge?._id?.toString(),
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
   *
   * @param fromUser
   * @param dataRequest
   * @returns
   */
  async handleSendNotification(
    fromUser: User,
    toUser: User,
    dataChallenge: Challenge,
    authCode: string = "",
    channelObject: any = {},
    req: ExpressRequestDto
  ) {
    try {
      //Title
      const titleNotification = "LÀM 1 BƯỚC TRÚNG NHIỀU QUÀ";
      let descriptionNotification = `${fromUser?.display_name} vừa thêm bạn vào ${dataChallenge?.title}`;
      if (descriptionNotification && descriptionNotification.length >= 255) {
        descriptionNotification = descriptionNotification.substring(0, 250) + "...";
      }

      const userIdArray = [toUser?._id?.toString()];
      const emailArray = [toUser];

      //Update Email
      const dataFirestore = getFirestore();

      for (const emailItem of emailArray) {
        //Let dataToUpdate
        const dataToUpdate = {
          brand_name: "Gamifa",
          channel: channelObject?.name?.toString(),
          post_name: dataChallenge.title,
          //@ts-ignore
          post_image: dataChallenge?.avatar?.media_url || "",
          email: emailItem?.user_email,
          fullname: emailItem.display_name,
          user_id: fromUser?._id?.toString(),
          post_url: (channelObject?.domain || "https://gamifa.vn") + "/r/challenge/detail/" + dataChallenge?._id,
          event_name: "add_to_challenge",
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
        const dataToSendNotification = {
          request_id: dataChallenge?._id?.toString(),
          path: "/r/challenge/detail/",
          data_id: dataChallenge?._id?.toString(),
        };
        const dataNotification = {
          createdBy: fromUser._id.toString(),
          user_id: userIdArray,
          channel_id: req?.channel_id,
          title: titleNotification,
          content: descriptionNotification,
          param: JSON.stringify(dataToSendNotification),
          request_id: dataChallenge?._id?.toString(),
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
}
