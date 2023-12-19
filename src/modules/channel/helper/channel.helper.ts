import { Response, Request } from "express";
import axios from "axios";
import {
  ForbiddenException,
  HttpStatus,
  NotFoundException,
  Injectable,
  BadRequestException,
  Logger,
  Res,
  Req,
  Param,
} from "@nestjs/common";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateChannelDto } from "../dto/create-channel.dto";
import { ChannelService } from "../services/channel.service";
import { ListChannelDto } from "../dto/list-channel.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UpdateChannelDto } from "../dto/update-channel.dto";
import { Types } from "mongoose";
import { parse } from "tldjs";
import { ChatMediaService } from "../../../modules/chat_media/services/chat_media.service";
import { User } from "../../../modules/user/schemas/user.schema";
import { CreateChannelLikeDto } from "../dto/create-channel_like.dto";
import { ChannelLikeService } from "../services/channel_like.service";
import { ChannelPermissionService } from "../services/channel_permission.service";
import { CreateChannelPermissionDto } from "../dto/create-channel_permission.dto";
import { UserOptionService } from "../../../modules/user/services/user_option.service";
import * as _ from "lodash";
import { UserSessionService } from "../../../modules/user/services/user_session.service";
import { ListChannelLevelDto } from "../dto/list-channel_level.dto";
import { ChannelLevelService } from "../services/channel_level.service";
import { CreateChannelLevelDto } from "../dto/create-channel_level.dto";
import { UpdateChannelLevelDto } from "../dto/update-channel_level.dto";
import { UserService } from "../../../modules/user/services/user.service";
import { ListChannelPermissionDto } from "../dto/list-channel_permission.dto";
import { CreateInviteEmail } from "../dto/create-invite_email.dto";
import { UpdateChannelPermissionDto } from "../dto/update-channel_permission.dto";
import { UserFollowService } from "../../../modules/user/services/user_follow.service";
import { ChannelPermission } from "../schemas/channel_permission.schema";
import { createHash } from "crypto";
import { LoginUserDto } from "../../../modules/user/dto/login-user.dto";
import { RegisterUserDto } from "../../../modules/user/dto/register-user.dto";
import { NotificationHelper } from "../../../modules/notification/helper/notification.helper";
import { Channel } from "../schemas/channel.schema";
import { UpdateChannelMentorDto } from "../dto/update-channel_mentor.dto";
import { CreateChannelBannerDto } from "../dto/create-channel_banner.dto";
import { ChannelBannerService } from "../services/channel_banner.service";
import { ListChannelBannerDto } from "../dto/list-channel_banner.dto";
import { CreateChannelDomainDto } from "../dto/create-channel-domain.dto";
import { Type } from "class-transformer";
import { CheckChannelDomainDto } from "../dto/check-channel-domain.dto";
import { PlusPointChannelDto } from "../../../modules/challenge/dto/plus-point-channel.dto";
import { SubscribeService } from "../../../modules/subscribe/services/subscribe.service";
import { EventHookNotificationService } from "../../../modules/hook/services/hook_notification.service";
import { ChallengeService } from "../../../modules/challenge/services/challenge.service";
import { QueueService } from "../../../modules/queue/queue.service";
import { RequestCategoryService } from "../../../modules/request/services/request_category.service";
import { EventHookWorkerService } from "../../../modules/hook/services/hook_do.service";
const admin = require("firebase-admin");
import HookExpress from "../../hook/hook_epress";
import { CourseLikeService } from "../../../modules/course/services/course_like.service";
import { CourseLike } from "../../../modules/course/schemas/course_like.schema";
const { getFirestore } = require("firebase-admin/firestore");
let initHook = false;
/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class ChannelHelper {
  constructor(
    private channelService: ChannelService,
    private channelBannerService: ChannelBannerService,
    private channelLevelService: ChannelLevelService,
    private userPermissionService: UserPermissionService,
    private chatMediaService: ChatMediaService,
    private channelLikeService: ChannelLikeService,
    private channelPermissionService: ChannelPermissionService,
    private userOptionService: UserOptionService,
    private userSessionService: UserSessionService,
    private userService: UserService,
    private userFollowService: UserFollowService,
    private notificationHelper: NotificationHelper,
    private subscribeService: SubscribeService,
    private eventHookNotificationService: EventHookNotificationService,
    private readonly eventHookWorkerService: EventHookWorkerService,
    private readonly challengeService: ChallengeService,
    private readonly queueService: QueueService,
    private readonly courseLikeService: CourseLikeService,
    // private requestCategoryService: RequestCategoryService
    private readonly hookWorker: EventHookWorkerService
  ) {
    if (!initHook) {
      this.initHook();
      initHook = true;
    }
  }
  private readonly logger = new Logger("channel");

  initHook() {
    HookExpress.add_action("request.add-level", async (data: any) => {
      await this.processLevelWhenCreateChannel(data);
    });
  }

  /**
   *
   * @param data
   */
  async processLevelWhenCreateChannel(channelId: any) {
    try {
      //getChannelOfGamifa
      const levelGamifa: any = await this.channelLevelService.filter(
        { channel_id: process.env.DEFAULT_CHANNEL },
        {},
        1,
        1000
      );
      for (const levelData of levelGamifa) {
        if (Number(levelData?.level_number) > 1) {
          //Process Level
          const levelToAdd = {
            ...levelData?.toObject(),
            ...{
              channel_id: channelId,
              course_id: levelData?.course_id?.toString(),
              parent_id: levelData?.parent_id?.toString(),
              media_id: levelData?.media_id?.toString(),
            },
          };
          delete levelToAdd?._id;
          delete levelToAdd?.__v;
          await this.channelLevelService.create(levelToAdd);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * @author SonLH
   * @param domain
   */
  async checkDNSRecordChannel(createChannelDomainDto: CreateChannelDomainDto) {
    try {
      let result: any;
      const isDNSRecordExist = await this.channelService.findById(createChannelDomainDto.channel_id);
      if (
        !isDNSRecordExist?.domain ||
        !isDNSRecordExist?.domain.endsWith("gamifa.vn") ||
        isDNSRecordExist?.domain === ""
      ) {
        const urlCloudflare = process.env.CLOUDFLARE_API;
        const idZoneCloudflare = process.env.CLOUDFLARE_ZONE_ID;
        const ip = process.env.CLOUDFLARE_ZONE_IP;
        const token = process.env.CLOUDFLARE_CREATE_DNS_RECORD_TOKEN;
        const dataToCreateDNSRecord = {
          content: ip,
          name: new URL(createChannelDomainDto.domain).hostname.split(".")[0],
          type: "A",
          proxied: true,
        };
        const params = { ...dataToCreateDNSRecord };
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        };
        result = await axios
          .post(urlCloudflare + "/zones/" + idZoneCloudflare + "/dns_records", params, config)
          .then((response) => {
            if (response?.data) {
              this.logger.log("Send Call Api Create DNS Record Successfully" + JSON.stringify(response.data));
              return response?.data;
            } else {
              return false;
            }
          })
          .catch((error) => {
            this.logger.log("Send Message Error: " + JSON.stringify(error.response.data));
            return false;
          });
        return result;
      } else if (isDNSRecordExist?.domain.endsWith("gamifa.vn")) {
        const urlCloudflare = process.env.CLOUDFLARE_API;
        const idZoneCloudflare = process.env.CLOUDFLARE_ZONE_ID;
        const ip = process.env.CLOUDFLARE_ZONE_IP;
        const token = process.env.CLOUDFLARE_CREATE_DNS_RECORD_TOKEN;
        const dataToCreateDNSRecord = {
          content: ip,
          name: new URL(createChannelDomainDto.domain).hostname.split(".")[0],
          type: "A",
          proxied: true,
        };
        const params = { ...dataToCreateDNSRecord };
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        };
        result = await axios
          .patch(
            urlCloudflare +
              "/zones/" +
              idZoneCloudflare.toString() +
              "/dns_records/" +
              isDNSRecordExist.domain_id.toString(),
            params,
            config
          )
          .then((response) => {
            if (response?.data) {
              this.logger.log("Send Call Api Create DNS Record Successfully" + JSON.stringify(response.data));
              return response?.data;
            } else {
              return false;
            }
          })
          .catch((error) => {
            this.logger.log("Send Message Error: " + JSON.stringify(error.response.data));
            return false;
          });
        return result;
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author SonLH
   * @param domain
   */
  async createDomainChannel(createChannelDomainDto: CreateChannelDomainDto): Promise<any> {
    try {
      const isChannelExist = await this.channelService.findById(createChannelDomainDto.channel_id);
      if (!isChannelExist) {
        throw new ForbiddenException("Cannot Found Channel!");
      }
      if (
        !isChannelExist?.domain ||
        isChannelExist?.domain === "" ||
        isChannelExist?.domain !== createChannelDomainDto?.domain
      ) {
        const urlCloudflare = process.env.CLOUDFLARE_API;
        const idAccountCloudflare = process.env.CLOUDFLARE_ACOUNT_ID;
        const token = process.env.CLOUDFLARE_CREATE_ZONE;
        const dataToCreateDomain = {
          account: {
            id: idAccountCloudflare,
          },
          name: createChannelDomainDto.domain,
          type: "full",
        };
        const params = { ...dataToCreateDomain };
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        };
        const result = await axios
          .post(`${urlCloudflare}/zones`, params, config)
          .then(async (response) => {
            if (response?.data) {
              this.logger.log("Send Call Api Create Domain Successfully" + JSON.stringify(response.data));
              const channelUpdate = {
                _id: isChannelExist?._id.toString(),
                domain_id: response?.data?.result?.id.toString().split("//")[1],
                name_servers: response?.data?.result?.name_servers,
                domain: response?.data?.result?.name.toString(),
              };
              const dataCreate: any = await this.channelService.update(channelUpdate);
              return dataCreate;
            } else {
              return false;
            }
          })
          .catch((error) => {
            if (error?.response?.data?.errors[0]?.code === 1061) {
              return { message: `Domain ${createChannelDomainDto.domain} Already Exists!`, isDomain: false };
            }
            this.logger.log("Send Message Error: " + JSON.stringify(error.response.data));
            return false;
          });
        return result;
      }
    } catch (error) {
      this.logger.log(error.message);
      return false;
    }
  }

  /**
   * @author SonLH
   * @param CreateChannelDomainDto
   */
  async updateDomain(createChannelDomainDto: CreateChannelDomainDto, res: Response, req: ExpressRequestDto) {
    try {
      // let userObject = req?.user_object;
      // if(!userObject){
      //   throw new ForbiddenException("User is invalid");
      // }
      const checkDomain = new URL(createChannelDomainDto.domain);
      if (checkDomain?.protocol !== "https:" || checkDomain?.password !== "" || checkDomain?.username !== "") {
        if (String(checkDomain.hostname).split(".").length < 2) throw new BadRequestException("hostname_invalid");
        throw new BadRequestException("domain_invalid");
      }
      createChannelDomainDto.domain = checkDomain?.hostname.toString();
      const channelPermission = await this.channelPermissionService.findOne({
        user_id: req?.user_object?._id,
        channel_id: createChannelDomainDto.channel_id,
      });
      if (channelPermission?.channel_role === "mentor") {
        const typeService = await this.subscribeService.findOne({
          channel_id: createChannelDomainDto.channel_id,
          service_name: "domain",
        });
        if (typeService) {
          const isCreateDomain = await this.createDomainChannel(createChannelDomainDto);
          if (isCreateDomain !== false) {
            if (isCreateDomain?.isDomain === false) {
              res
                .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
                .status(HttpStatus.BAD_REQUEST)
                .json(isCreateDomain);
            } else {
              res
                .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
                .status(HttpStatus.CREATED)
                .json({
                  data: isCreateDomain,
                  message: "Create Domain success",
                  isDomain: true,
                });
            }
          } else {
            res
              .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
              .status(HttpStatus.BAD_REQUEST)
              .json({
                message: "Create Domain Fails",
                isDomain: false,
              });
          }
        } else {
          throw new ForbiddenException("Channel Cannot Create Domain!");
        }
      } else {
        throw new ForbiddenException("User Cannot Create Domain!");
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async checkDomainActive(
    checkCreateDomainDto: CheckChannelDomainDto,
    res: Response,
    Req: ExpressRequestDto
  ): Promise<any> {
    try {
      let result: any;
      const isChannelExist = await this.channelService.findById(checkCreateDomainDto.channel_id);
      if (isChannelExist) {
        if (isChannelExist.domain_id && isChannelExist.domain === checkCreateDomainDto.domain) {
          const urlCloudflare = process.env.CLOUDFLARE_API;
          const token = process.env.CLOUDFLARE_CREATE_ZONE;
          const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            timeout: 10000,
          };
          result = await axios
            .get(`${urlCloudflare}/zones/${isChannelExist?.domain_id}`, config)
            .then((response) => {
              if (response?.data) {
                this.logger.log("Send Call Api Get Domain Info Successfully" + JSON.stringify(response.data));
                return response?.data?.result;
              } else {
                throw new ForbiddenException("Cannot Found Domain!");
              }
            })
            .catch((error) => {
              this.logger.log("Send Message Error: " + JSON.stringify(error.response.data));
              throw new ForbiddenException("Cannot Found Domain!");
            });
          res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.BAD_REQUEST)
            .json(result);
        } else if (isChannelExist.domain_id && isChannelExist.domain !== checkCreateDomainDto.domain) {
          throw new ForbiddenException("Wrong Domain!");
        } else {
          throw new ForbiddenException("Channel Does Not Regis Domain!");
        }
      } else {
        throw new ForbiddenException("Not Found Channel!");
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
  async createNewChannel(createChannelData: CreateChannelDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      createChannelData = { ...createChannelData, ...{ user_id: userId } };

      if (createChannelData?.attach_files) {
        createChannelData = { ...createChannelData, ...{ attach_files: JSON.parse(createChannelData?.attach_files) } };
      } else {
        createChannelData = { ...createChannelData, ...{ attach_files: [] } };
      }

      if (createChannelData?.hashtag_id) {
        createChannelData = { ...createChannelData, ...{ hashtag_id: JSON.parse(createChannelData?.hashtag_id) } };
      } else {
        createChannelData = { ...createChannelData, ...{ hashtag_id: [] } };
      }

      createChannelData = {
        ...createChannelData,
        ...{ redirect_url: "/r/prepare-channel/" + process.env.CHANNEL_SERVICE_ID },
      };
      createChannelData = { ...createChannelData, ...{ member_number: 1 } };
      let dataCreate: any = await this.channelService.create(createChannelData);
      dataCreate = dataCreate.toObject();
      dataCreate = {
        ...dataCreate,
        ...{
          user_id: await this.handleGetUserBase(userObject),
          point_data: [
            { key: "comment", value: "2" },
            { key: "like_post", value: "1" },
            { key: "view_course", value: "2" },
            { key: "like_comment", value: "1" },
            { key: "post_new", value: "5" },
            { key: "invite_user", value: "5" },
          ],
        },
      };

      //Update for channel
      const dataUpdateChannel = {
        _id: dataCreate?._id?.toString(),
        admin_user: userObject?._id?.toString(),
      };
      await this.channelService.updateArray(dataUpdateChannel);

      const dataLevelOneData = {
        channel_id: dataCreate?._id?.toString(),
        title: "Khởi động",
        level_number: "1",
        total_member: "1",
      };
      const dataLevelOne = await this.channelLevelService.create(dataLevelOneData);

      let dataCreatePermission = {
        user_id: userObject?._id?.toString(),
        official_status: 1,
        permission: [
          "channel/create",
          "channel/delete",
          "channel/update",
          "request/create",
          "request/delete",
          "request/update",
          "category/create",
          "category/update",
          "category/delete",
          "module/create",
          "module/update",
          "module/delete",
          "course/create",
          "course/update",
          "course/delete",
          "comment/craete",
          "comment/update",
          "comment/delete",
          "event/create",
          "event/update",
          "event/delete",
        ],
        channel_role: "mentor",
        channel_id: dataCreate?._id?.toString(),
      };
      if (dataLevelOne) {
        dataCreatePermission = { ...dataCreatePermission, ...{ channel_level: dataLevelOne?._id?.toString() } };
        //Update For channel
      }
      const dataChannelPermission = await this.channelPermissionService.create(dataCreatePermission);
      //Update permission
      //For User
      const dataUpdateUser = {
        _id: userObject?._id?.toString(),
        channel_permission: dataChannelPermission?._id?.toString(),
      };
      await this.userService.updateArray(dataUpdateUser);

      //Setup Category & Level
      setTimeout(async () => {
        this.hookWorker.ProcessAddCategory(dataCreate?._id?.toString());
        this.hookWorker.ProcessAddLevel(dataCreate?._id?.toString());
      }, 300);

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
  async createNewChannelBanner(createChannelData: CreateChannelBannerDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      createChannelData = { ...createChannelData, ...{ user_id: userId } };
      const channelId = req?.channel_id || createChannelData?.channel_id;
      if (channelId) {
        createChannelData = { ...createChannelData, ...{ channel_id: channelId } };
      }
      const dataCreate: any = await this.channelBannerService.create(createChannelData);
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
  async createNewChannelLevel(createChannelData: CreateChannelLevelDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      //Check Permission

      const dataPermission = await this.channelPermissionService.findOne({
        user_id: userObject?._id?.toString(),
        channel_id: createChannelData?.channel_id,
      });
      if (!dataPermission) {
        throw new ForbiddenException("You not have permission for this action!");
      }
      if (
        dataPermission?.channel_role !== "mentor" &&
        dataPermission?.permission?.indexOf("channel/create_level") == -1
      ) {
        throw new ForbiddenException("You not have permission for this action!");
      }
      const userId = userObject._id.toString();
      createChannelData = { ...createChannelData, ...{ user_id: userId, official_status: 1 } };
      const dataCreate: any = await this.channelLevelService.create(createChannelData);
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
  async createJoinPermission(createChannelData: CreateChannelLevelDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const authCode = req?.auth_code;
      //Check permission
      const exsitUserFilter = {
        user_id: userObject?._id.toString(),
        channel_id: createChannelData?.channel_id,
      };

      if (createChannelData?.channel_id) {
        let isNotificationJoin = false;
        const channelObject = await this.channelService.findById(createChannelData?.channel_id);
        const dataExsitUser = await this.channelPermissionService.findOne(exsitUserFilter);
        if (!dataExsitUser) {
          //Check Permission
          const userId = userObject._id.toString();
          //Check Channel ID
          const levelOne = await this.channelLevelService.findOne({
            level_number: 1,
            channel_id: createChannelData?.channel_id,
          });

          let channelLevel = null;
          if (levelOne) {
            channelLevel = levelOne?._id?.toString();
          }
          createChannelData = {
            ...createChannelData,
            ...{ user_id: userId, official_status: 1, channel_role: "user", channel_level: channelLevel },
          };

          if (channelObject?.public_status == "private") {
            createChannelData = { ...createChannelData, ...{ official_status: 0 } };
            isNotificationJoin = true;
            this.eventHookNotificationService.sendNotiNMailRequireJoinChannel({
              user_id: channelObject.user_id,
              channel_id: channelObject?._id?.toString(),
              path: `/v/member`,
              mail_template: "required_join_channel",
              content: (params: any) => {
                return `Người dùng ${params?.display_name} muốn gia nhập kênh ${params?.channel_name}`;
              },
              title: `YÊU CẦU THAM GIA KÊNH ${channelObject?.name.toLocaleUpperCase()}`,
            });
          }

          const dataCreate: any = await this.channelPermissionService.create(createChannelData);
          if (isNotificationJoin) {
            //Send Noitfication
            this.handleSendNotification(userObject, channelObject?.user_id, dataCreate, channelObject, authCode, req);
          }

          const dataUpdateUser = {
            _id: userObject?._id?.toString(),
            channel_permission: createChannelData?.channel_id?.toString(),
          };
          await this.userService.updateArray(dataUpdateUser);

          const listChallenge = await this.challengeService.filter(
            {
              channel_id: channelObject._id.toString(),
              add_all_user: true,
            },
            {},
            1,
            1000
          );
          this.queueService.addTaskUserJoinChallenge({
            user_id: userObject._id.toString(),
            list_challenge_id: listChallenge.map((x) => {
              return {
                challenge_id: x?._id.toString(),
                game_id: x?.game_id?._id.toString(),
                game_type: x?.game_id?.game_type,
                title: x?.title,
              };
            }),
            channel_id: channelObject._id.toString(),
            official_status: 1,
            display_name: userObject?.display_name,
          });

          await this.channelService.updateCount(
            { _id: new Types.ObjectId(createChannelData?.channel_id) },
            {
              member_number: 1,
            }
          );

          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json(dataCreate);
        }
      } else {
        throw new ForbiddenException("Channel is invalid");
      }
    } catch (error) {
      throw new NotFoundException(error.message);
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
    toUser: User,
    dataPermission: ChannelPermission,
    channelObject: Channel,
    authCode: string,
    req: ExpressRequestDto
  ) {
    try {
      let notificationTitle = fromUser.display_name ? fromUser.display_name : fromUser.user_login;
      let chatContentToSend = `${notificationTitle} đã yêu cầu tham gia vào Channel: ${channelObject?.name}`;
      if (chatContentToSend && chatContentToSend.length >= 255) {
        chatContentToSend = chatContentToSend.substring(0, 250) + "...";
      }
      notificationTitle = `${notificationTitle} đã yêu cầu tham gia vào Channel`;

      if (notificationTitle && notificationTitle.length >= 70) {
        notificationTitle = notificationTitle.substring(0, 68) + "...";
      } else {
        notificationTitle = notificationTitle;
      }

      const userIdArray = [toUser?._id?.toString()];
      if (userIdArray && userIdArray?.length) {
        const dataToSendNotification = {
          request_id: dataPermission?._id?.toString(),
          path: "/v/member/waiting",
          data_id: "",
        };
        const notificationContent = chatContentToSend;
        const dataNotification = {
          createdBy: fromUser._id.toString(),
          user_id: userIdArray,
          channel_id: req?.channel_id,
          title: notificationTitle?.toString(),
          content: notificationContent,
          param: JSON.stringify(dataToSendNotification),
          request_id: dataPermission?._id?.toString(),
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
   * @param fromUser
   * @param dataRequest
   * @returns
   */
  async handleSendNotificationMentor(
    fromUser: User,
    toUser: User,
    authCode: string = "",
    channelObject: any = {},
    req: ExpressRequestDto
  ) {
    try {
      //Title
      const titleNotification = "Bạn vừa được thêm làm Mentor";
      let descriptionNotification = `${fromUser?.display_name} vừa thêm bạn làm Mentor kênh ${channelObject?.title}`;
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
          post_name: channelObject?.title,
          //@ts-ignore
          post_image: dataChallenge?.avatar?.media_url || "",
          email: emailItem?.user_email,
          fullname: emailItem.display_name,
          user_id: fromUser?._id?.toString(),
          post_url: (channelObject?.domain || "https://gamifa.vn") + "/r/setting-mentor/detail/" + toUser?._id,
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
          request_id: toUser?._id?.toString(),
          path: "/r/setting-mentor/detail/",
          data_id: toUser?._id?.toString(),
        };
        const dataNotification = {
          createdBy: fromUser._id.toString(),
          user_id: userIdArray,
          channel_id: req?.channel_id,
          title: titleNotification,
          content: descriptionNotification,
          param: JSON.stringify(dataToSendNotification),
          request_id: toUser?._id?.toString(),
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
   * @param inviteViaEmail
   * @param res
   * @param req
   */
  async inviteViaEmail(inviteViaEmail: CreateInviteEmail, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      //Check Permission
      const dataPermission = await this.channelPermissionService.findOne({
        channel_id: inviteViaEmail?.channel_id,
        user_id: userObject?._id?.toString(),
      });
      if (!dataPermission) {
        throw new ForbiddenException("You not have permission for this action!");
      }
      if (dataPermission?.channel_role !== "mentor" && dataPermission?.permission?.indexOf("user/update") == -1) {
        throw new ForbiddenException("You not have permission for this action!");
      }
      const channelObject = await this.channelService.findById(inviteViaEmail?.channel_id);
      //Check User by Email
      let userObjectCheck = await this.userService.findOne({ user_email: inviteViaEmail.email });
      let passwordRandom = "";
      if (!userObjectCheck) {
        passwordRandom = await this.makeRandomPassword(6);
        //Create new Account
        const dataLogin = {
          user_email: inviteViaEmail?.email,
          full_name: inviteViaEmail?.email,
          user_password: passwordRandom?.toString(),
        };
        userObjectCheck = await this.createUserByEmail(req, dataLogin);
      }

      const dataFirestore = getFirestore();

      //Let dataToUpdate
      let dataToUpdate = {
        brand_name: "Gamifa",
        country: userObjectCheck?.country,
        channel: channelObject?.name,
        channel_description: channelObject?.description,
        email: inviteViaEmail.email,
        fullname: inviteViaEmail.email,
        user_id: userObjectCheck?._id?.toString(),
        token_url: (channelObject?.domain || "https://gamifa.vn") + "/login",
        is_send_email: false,
      };

      if (passwordRandom) {
        dataToUpdate = { ...dataToUpdate, ...{ password: passwordRandom, event_name: "send_mail_invite_pass" } };
      } else {
        dataToUpdate = { ...dataToUpdate, ...{ event_name: "send_mail_invite" } };
      }

      //Add User To New Channel

      const levelUser = await this.channelLevelService.findOne({
        level_number: 1,
        channel_id: channelObject?._id?.toString(),
      });

      //Check permission
      const exsitUserFilter = {
        user_id: userObjectCheck?._id?.toString(),
        channel_id: channelObject?._id?.toString(),
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

      const dataExsitUser = await this.channelPermissionService.findOne(exsitUserFilter);
      if (!dataExsitUser) {
        //Create Channel Permission
        const dataToCreateChannel = {
          user_id: userObjectCheck?._id?.toString(),
          channel_id: channelObject?._id?.toString(),
          official_status: 1,
          channel_role: "user",
          level_number: 1,
          channel_level: levelUser?._id?.toString(),
          permission: ["request/create", "request/update"],
        };
        await this.channelPermissionService.create(dataToCreateChannel);
      }

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(inviteViaEmail);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async makeRandomPassword(length) {
    let result = "";
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  async createUserByEmail(req: ExpressRequestDto, dataLogin: RegisterUserDto) {
    //Process User Email
    const userLogin = dataLogin.user_email?.replace("@", "_");
    //Create New User
    const dataToCreate = {
      user_login: userLogin,
      user_email: dataLogin.user_email,
      user_password: await this.handleProcessPassword(dataLogin.user_password),
      display_name: dataLogin?.full_name ? dataLogin?.full_name : userLogin,
      user_status: 1,
    };
    let userObject = await this.userService.create(dataToCreate);
    if (userObject) {
      const dataUserOption: any = await this.handleUpdateUserOption(userObject._id.toString());
      //@ts-ignore
      userObject = { ...dataUserOption.toObject(), ...userObject?.toObject() };
    }
    if (userObject && userObject._id) {
      return userObject;
    } else {
      return null;
    }
  }

  async handleUpdateUserOption(userId: string) {
    const dataCreate = {
      user_id: userId,
    };
    const dataUserOption = await this.userOptionService.create(dataCreate);
    const levelUser = await this.channelLevelService.findOne({
      level_number: 1,
      channel_id: process.env.DEFAULT_CHANNEL,
    });

    //Create Channel Permission
    const dataToCreateChannel = {
      user_id: userId,
      channel_id: process.env.DEFAULT_CHANNEL,
      official_status: 1,
      channel_role: "user",
      level_number: 1,
      channel_level: levelUser?._id?.toString(),
      permission: ["request/create", "request/update"],
    };
    await this.channelPermissionService.create(dataToCreateChannel);
    //Update count user

    if (dataUserOption) {
      const dataUpdate = {
        _id: userId,
        user_option_id: dataUserOption._id.toString(),
      };
      await this.userService.update(dataUpdate);
      return dataUserOption;
    } else {
      return null;
    }
  }

  /**
   * @author Tony Vu
   * @param req
   * @param userObject
   * @param dataLogin
   * @returns
   */
  async handleUserSession(req: Request, userObject: User, dataLogin: LoginUserDto) {
    const userIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
    const userAgent = req.headers["user-agent"];

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();
    const expiredAt = new Date(year + 1, month, day);

    const dataSessionToAdd = {
      user_id: userObject._id,
      user_ip: userIp,
      device_uuid: dataLogin.device_uuid,
      device_signature: dataLogin.device_signature,
      device_type: dataLogin.device_type,
      user_agent: userAgent,
      language: dataLogin?.language,
      expired_at: expiredAt,
    };
    const dataCreate = await this.userSessionService.create(dataSessionToAdd);
    return dataCreate;
  }

  /**
   *
   * @param password
   */
  async handleProcessPassword(password: string) {
    try {
      password = password + "pxtPAtrn9Q2xADXp";
      const newPassword = createHash("sha256").update(password).digest("hex");
      return newPassword?.toString();
    } catch (error) {
      return null;
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
  async updateMentor(dataUpdate: UpdateChannelMentorDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const userId = userObject?._id?.toString();
      const userPermission = await this.channelPermissionService.findOne({
        user_id: userObject?._id?.toString(),
        channel_id: dataUpdate?.channel_id,
      });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("channel/update") !== -1)
      ) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "channel/update")) {
        havePermission = true;
      }

      if (havePermission) {
        const dataUserUpdateFilter = {
          user_id: dataUpdate?.mentor_id,
          channel_id: dataUpdate?.channel_id,
        };
        let mentorReturn = null;
        const dataPermissionChannel = await this.channelPermissionService.findOne(dataUserUpdateFilter);
        if (dataPermissionChannel) {
          mentorReturn = await this.channelPermissionService.update({
            _id: dataPermissionChannel._id?.toString(),
            mentor_role: "mentor",
          });
        }
        //Update from_mentor
        let dataUserArray = [];
        const dataUserToAdd = [];
        const dataUserReturn = [];
        if (dataUpdate?.user_ids?.indexOf(",") !== -1) {
          dataUserArray = dataUpdate?.user_ids?.split(",");
        } else {
          dataUserArray = [dataUpdate?.user_ids];
        }
        if (dataUserArray?.length) {
          for (const userItem of dataUserArray) {
            try {
              const objectId = new Types.ObjectId(userItem);
              if (!objectId) {
                throw new NotFoundException("Partner is invalid (Not is an ObjectID)");
              } else {
                dataUserToAdd.push(userItem);
              }
            } catch (error) {}
          }
        }

        for (const itemToAdd of dataUserToAdd) {
          //Update User from_mentor
          const dataUpdateFilter = {
            user_id: itemToAdd?.toString(),
            channel_id: dataUpdate?.channel_id,
          };
          const dataUpdateMentor = {
            from_mentor: dataUpdate?.mentor_id,
          };
          const dataMentorObject = await this.channelPermissionService.updateOne(dataUpdateFilter, dataUpdateMentor);
          dataUserReturn.push(dataMentorObject);
          //Update count
          const dataUpdateCount = {
            number_of_user: 1,
          };
          await this.channelPermissionService.updateCount(
            { _id: dataPermissionChannel._id?.toString() },
            dataUpdateCount
          );
        }

        const dataReturn = {
          mentor_id: mentorReturn,
          user_ids: dataUserReturn,
        };

        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new ForbiddenException("You not have permission for this action!");
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
  async updateChannel(dataUpdate: UpdateChannelDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      //Check Permission
      const dataPermission = await this.channelPermissionService.findOne({
        channel_id: dataUpdate?._id,
        user_id: userObject?._id?.toString(),
      });
      const userId = userObject._id.toString();
      let isSuperAdmin = false;

      const adminPermission = await this.userPermissionService.isHavePermission(userId, "channel/create");
      if (!dataPermission && !adminPermission) {
        throw new ForbiddenException("You not have permission for this action!");
      }
      if (adminPermission) {
        isSuperAdmin = true;
      } else {
        delete dataUpdate?.payment_method;
        delete dataUpdate?.service_id;

        if (dataPermission?.channel_role !== "mentor" && dataPermission?.permission?.indexOf("channel/update") == -1) {
          throw new ForbiddenException("You not have permission for this action!");
        }
      }

      if (dataUpdate?.payment_method) {
        try {
          dataUpdate = { ...dataUpdate, ...{ payment_method: JSON.parse(dataUpdate?.payment_method) } };
        } catch (error) {}
      }

      if (dataUpdate?.service_id) {
        try {
          dataUpdate = { ...dataUpdate, ...{ service_id: JSON.parse(dataUpdate?.service_id) } };
        } catch (error) {}
      }

      if (dataUpdate?.official_status) {
        if (adminPermission) {
        } else {
          throw new ForbiddenException("You not have permission for this action!");
        }
      }

      if (dataUpdate?.attach_files) {
        dataUpdate = { ...dataUpdate, ...{ attach_files: JSON.parse(dataUpdate?.attach_files) } };
      }

      if (dataUpdate?.hashtag_id) {
        dataUpdate = { ...dataUpdate, ...{ hashtag_id: JSON.parse(dataUpdate?.hashtag_id) } };
      }

      if (dataUpdate?.point_data) {
        dataUpdate = { ...dataUpdate, ...{ point_data: JSON.parse(dataUpdate?.point_data) } };
      }

      const oldChannel = await this.channelService.findById(dataUpdate?._id);

      if (dataUpdate?.domain && dataUpdate?.domain !== oldChannel?.domain) {
        const isDomainExist = await this.channelService.filter(
          {
            domain: dataUpdate?.domain,
          },
          {},
          1,
          99
        );
        if (isDomainExist.length > 0) {
          throw new BadRequestException("Domain already Exist!");
        }
        const createChannelDomainDto = { domain: dataUpdate?.domain, channel_id: dataUpdate?._id, user_id: userId };
        const infoDomain = await this.checkDNSRecordChannel(createChannelDomainDto);
        dataUpdate.domain_id = infoDomain?.result?.id;
      }

      console.log(dataUpdate, "dataUpdate");

      //Get Media Data
      const dataCreate: any = await this.channelService.update(dataUpdate);

      //Đã udpate trong Service rồi, không cần Update lại nữa.
      // await this.channelService.updateCount({ _id: dataUpdate?._id }, { channel_version: 1 });
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
  async updateChannelLevel(dataUpdate: UpdateChannelLevelDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const dataLevel = await this.channelLevelService.findOne({ _id: dataUpdate?._id });

      const dataPermission = await this.channelPermissionService.findOne({
        user_id: userObject?._id?.toString(),
        channel_id: dataLevel?.channel_id,
      });
      if (!dataPermission) {
        throw new ForbiddenException("You not have permission for this action!");
      }
      if (
        dataPermission?.channel_role !== "mentor" &&
        dataPermission?.permission?.indexOf("channel/create_level") == -1
      ) {
        throw new ForbiddenException("You not have permission for this action!");
      }

      //Get Media Data
      const dataCreate: any = await this.channelLevelService.update(dataUpdate);
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
  async updateChannelPermission(dataUpdate: UpdateChannelPermissionDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const dataPermission = await this.channelPermissionService.findOne({
        _id: dataUpdate?._id,
      });

      if (!dataPermission) {
        throw new ForbiddenException("The permission is not exist!");
      }

      const dataUserPermission = await this.channelPermissionService.findOne({
        user_id: userObject?._id?.toString(),
        channel_id: dataPermission?.channel_id?._id?.toString(),
      });
      const oldStatus = dataPermission.official_status;
      const oldFromMentor = dataPermission?.from_mentor;

      if (
        dataUserPermission?.channel_role !== "mentor" &&
        dataUserPermission?.permission?.indexOf("channel/create_level") == -1
      ) {
        throw new ForbiddenException("You not have permission for this action!");
      }

      if (dataUpdate?.permission) {
        dataUpdate = { ...dataUpdate, ...{ permission: JSON.parse(dataUpdate?.permission) } };
      }

      if (dataUpdate?.channel_role == "mentor") {
        //Edit Permission
        //Update lại number_of_user về 0
        dataUpdate = {
          ...dataUpdate,
          ...{
            permission: [
              "channel/create",
              "channel/delete",
              "channel/update",
              "request/create",
              "request/delete",
              "request/update",
              "category/create",
              "category/update",
              "category/delete",
              "module/create",
              "module/update",
              "module/delete",
              "course/create",
              "course/update",
              "course/delete",
              "comment/craete",
              "comment/update",
              "comment/delete",
              "event/create",
              "event/update",
              "event/delete",
            ],
            number_of_user: 0,
            mentor_role: "",
          },
        };

        //Xoá toàn bộ mọi người trong mentor đi
        await this.channelPermissionService.updateMany(
          { from_mentor: dataPermission?.user_id?.toString(), channel_id: dataPermission?.channel_id?._id?.toString() },
          { from_mentor: null }
        );

        if (dataPermission?.channel_role === "user") {
          await this.channelService.updateCount(
            {
              _id: new Types.ObjectId(dataPermission?.channel_id?._id.toString()),
            },
            {
              admin_number: 1,
              member_number: -1,
            }
          );
        }
      } else {
        dataUpdate = {
          ...dataUpdate,
          ...{
            permission: [],
          },
        };
      }

      if (dataUpdate?.channel_role === "user" && dataPermission?.channel_role === "mentor") {
        await this.channelService.updateCount(
          {
            _id: new Types.ObjectId(dataPermission?.channel_id?._id.toString()),
          },
          {
            admin_number: -1,
            member_number: 1,
          }
        );
      }

      if (dataUpdate.hasOwnProperty("mentor_role") && dataUpdate?.mentor_role == "") {
        //Update after
        setTimeout(async () => {
          //Remove all by Mentor
          //Xoá toàn bộ mọi người trong mentor đi
          await this.channelPermissionService.updateMany(
            {
              from_mentor: dataPermission?.user_id?.toString(),
              channel_id: dataPermission?.channel_id?._id?.toString(),
            },
            { from_mentor: null }
          );
        }, 500);
        dataUpdate = {
          ...dataUpdate,
          ...{
            number_of_user: 0,
          },
        };
      }

      if (dataUpdate.hasOwnProperty("from_mentor") && oldFromMentor && !dataUpdate?.from_mentor) {
        //Update remove number of user
        await this.channelPermissionService.updateCount(
          { user_id: oldFromMentor?.toString(), channel_id: dataPermission?.channel_id?._id?.toString() },
          { number_of_user: -1 }
        );
      }

      //Get Media Data
      const dataCreate: any = await this.channelPermissionService.update(dataUpdate);

      if (oldStatus === 0 && dataUpdate.official_status === "1") {
        const channel = await this.channelService.findById(dataUpdate.channel_id);
        this.eventHookNotificationService.sendNotiNMailApllyJoinChannel({
          user_id: dataUpdate?.from_user,
          channel_id: dataUpdate?.channel_id?.toString(),
          path: `/v`,
          mail_template: "required_join_channel",
          content: (params: any) => {
            return `Người dùng ${params?.display_name} muốn gia nhập kênh ${params?.channel_name}`;
          },
          title: `YÊU CẦU THAM GIA KÊNH ${channel?.name.toLocaleUpperCase()} CỦA BẠN ĐƯỢC PHÊ DUYỆT`,
        });
      }

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataCreate);
    } catch (error) {
      console.log(error);

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
  async getChannelListByAdmin(query: ListChannelDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "channel/list")) {
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
        const dataReturn = await this.channelService.filter(dataToFilter, orderByOBject, page, limit);
        const dataCount = await this.channelService.count(dataToFilter);
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
  async handleGetListLike(query: ListChannelDto, res: Response, req: ExpressRequestDto) {
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

      const dataReturn: any = await this.channelLikeService.filterChannel(dataToFilter, {}, 1, query.limit, {
        video_id: true,
      });

      const dataReturnFinal = [];
      if (dataReturn && dataReturn.length) {
        for (const channelItem of dataReturn) {
          dataReturnFinal.push({ ...channelItem, ...{ is_like: true, is_view: false } });
        }
      }
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
   * @param res
   * @param req
   * @returns
   */
  async handleGetListView(query: ListChannelPermissionDto, res: Response, req: ExpressRequestDto) {
    try {
      console.log(query, "query");
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      if (!req?.user_id) {
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": 0 })
          .status(HttpStatus.OK)
          .json([]);
      }

      let orderByOBject = {};

      if (query?.order_by && query?.order_type == "point_month") {
        orderByOBject = { ...orderByOBject, ...{ point_month: query.order_by } };
      }

      if (query?.order_by && query?.order_type == "point_week") {
        orderByOBject = { ...orderByOBject, ...{ point_week: query.order_by } };
      }

      if (query?.order_by && query?.order_type == "point") {
        orderByOBject = { ...orderByOBject, ...{ point: query.order_by } };
      }

      if (query?.order_by && query?.order_type == "level_number") {
        orderByOBject = { ...orderByOBject, ...{ level_number: query.order_by } };
      }

      if (query?.order_by && query?.order_type == "time") {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }

      if (query?.order_by && !query?.order_type) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;

      let dataToFilter = { ...query };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      if (query?.search) {
        //Search User First
        const dataSearch = {
          search: query?.search,
          channel_permission: query?.channel_id,
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

      if (query?.unset && query?.channel_id) {
        const userPermission = await this.channelPermissionService.findOne({
          user_id: query?.unset,
          channel_id: query?.channel_id,
        });
        if (userPermission) {
          dataToFilter = { ...dataToFilter, ...{ unset: [userPermission?._id?.toString()] } };
        }
      }

      if (query?.course_id) {
        //Process Course
        const dataCourseLike: CourseLike[] = await this.courseLikeService.filter(
          { course_id: query?.course_id },
          {},
          1,
          1000,
          {}
        );
        const dataIdsUserCourse = dataCourseLike?.map((dataItem: CourseLike, index: number) => {
          return dataItem?.user_id?.toString();
        });
        if (dataIdsUserCourse && dataIdsUserCourse?.length) {
          dataToFilter = { ...dataToFilter, ...{ user_unset: dataIdsUserCourse } };
        }
      }

      const dataReturn: ChannelPermission[] = await this.channelPermissionService.filter(
        dataToFilter,
        orderByOBject,
        page,
        query.limit
      );

      const dataCount = await this.channelPermissionService.count(dataToFilter);

      const dataIds = dataReturn?.map((value: ChannelPermission) => {
        return value.user_id?._id?.toString();
      });
      if (dataReturn?.length) {
        if (query?.auth_id) {
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
            const partnerId = dataReturn[dataItemIndex]?.user_id?._id?.toString();
            //@ts-ignore
            const dataToAdd = dataReturn[dataItemIndex]?.toObject();
            if (dataPartnerFollow.indexOf(partnerId) !== -1) {
              dataReturn[dataItemIndex] = { ...dataToAdd, ...{ is_follow: true } };
            } else {
              dataReturn[dataItemIndex] = { ...dataToAdd, ...{ is_follow: false } };
            }
            const dataToMerge = {
              ...dataReturn[dataItemIndex]?.user_id,
              ...{
                channel_role: dataReturn[dataItemIndex]?.channel_role,
                coin_number: dataReturn[dataItemIndex]?.coin_number,
                permission: dataReturn[dataItemIndex]?.permission,
                point: dataReturn[dataItemIndex]?.point,
                level_number: dataReturn[dataItemIndex]?.level_number,
              },
            };

            dataReturn[dataItemIndex] = {
              ...dataReturn[dataItemIndex],
              ...{
                user_id: dataToMerge,
              },
            };
          }
        }
      }

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
  async getChannelList(query: ListChannelDto, res: Response, req: ExpressRequestDto) {
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
      const dataReturn: any = await this.channelService.filter(dataToFilter, orderByOBject, page, limit);
      const dataReturnFinal = [];
      const dataCount = await this.channelService.count(dataToFilter);
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
   * @returns
   */
  async getListChannelBanner(query: ListChannelBannerDto, res: Response, req: ExpressRequestDto) {
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
      const dataReturn: any = await this.channelBannerService.filter(dataToFilter, orderByOBject, page, limit);
      const dataReturnFinal = [];
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
  async getChannelLevelList(query: ListChannelLevelDto, res: Response, req: ExpressRequestDto) {
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
      const dataReturn: any = await this.channelLevelService.filter(dataToFilter, orderByOBject, page, limit);
      const dataReturnFinal = [];
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
  async handleGetDetailChannel(id: string, res: Response, req: ExpressRequestDto) {
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
        const dataReturn = await this.channelService.findOne(dataToFilter);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new NotFoundException("Channel is not found!");
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
  async handleGetDetailChannelByDomain(domain: string, res: Response, req: ExpressRequestDto) {
    try {
      if (!domain) {
        throw new ForbiddenException("Id is not invalid");
      }
      //Check Permission
      let dataToFilter = {};
      if (domain) {
        dataToFilter = { ...dataToFilter, ...{ domain: domain } };
        const dataReturn = await this.channelService.findOne(dataToFilter);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new NotFoundException("Channel is not found!");
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
  async handleGetDetailChannelLevel(id: string, res: Response, req: ExpressRequestDto) {
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
        const dataReturn = await this.channelLevelService.findOne(dataToFilter);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new NotFoundException("Channel is not found!");
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
  async handleUpdateChannelByAdmin(dataUpdate: UpdateChannelDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      const dataChannel = await this.channelService.findById(dataUpdate._id.toString());
      if (
        dataChannel?.user_id?._id.toString() === userObject._id.toString() ||
        (await this.userPermissionService.isHavePermission(userId, "channel/update"))
      ) {
        const dataReturn = await this.channelService.update(dataUpdate);
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
  async handleDeleteChannel(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();

      const dataChannel = await this.channelService.findById(id.toString());
      if (
        dataChannel?.user_id?._id.toString() === userObject?._id.toString() ||
        (await this.userPermissionService.isHavePermission(userId, "channel/delete"))
      ) {
        const dataReturn = await this.channelService.remove(id);
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
  async handleDeleteChannelPermission(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();

      const dataChannel = await this.channelPermissionService.findById(id.toString(), {});
      const dataPermission = await this.channelPermissionService.findOne({
        user_id: userObject?._id?.toString(),
        channel_id: dataChannel?.channel_id?.toString(),
      });
      if (
        dataPermission.channel_role !== "mentor" &&
        dataPermission.permission?.indexOf("channel/create_level") == -1
      ) {
        throw new ForbiddenException("You not have permission for this action!");
      }

      // //Update logic if in Channel have only one Mentor
      // let dataPermissionArray = await this.channelPermissionService.filter(
      //   { channel_id: dataChannel?.channel_id?.toString(), channel_role: "mentor" },
      //   {},
      //   1,
      //   2
      // );

      // if (!dataPermissionArray || dataPermissionArray?.length == 1) {
      //   throw new ForbiddenException(
      //     "You need to have at least one Mentor in this Channel when you remove yourself from the Channel!"
      //   );
      // }
      await this.channelLevelService.updateCount(
        { channel_id: dataPermission?.channel_id?._id?.toString(), channel_level: 1 },
        { total_member: -1 }
      );
      //Update Channel Member
      if (dataPermission?.channel_role === "mentor") {
        await this.channelService.updateCount(
          {
            _id: new Types.ObjectId(dataChannel?.channel_id?.toString()),
          },
          {
            admin_number: -1,
          }
        );
      } else {
        await this.channelService.updateCount(
          {
            _id: new Types.ObjectId(dataChannel?.channel_id?.toString()),
          },
          {
            member_number: -1,
          }
        );
      }

      //Remove Channel
      const dataReturn = await this.channelPermissionService.remove(id);
      this.eventHookWorkerService.RequestDeleteMultipleDocumentByChannelPermission({
        channel_id: dataChannel?.channel_id?._id?.toString(),
        user_id: dataChannel?.user_id?._id?.toString(),
      });
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
  async handleDeleteChannelLevel(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();

      const dataChannel = await this.channelLevelService.findById(id.toString(), {});
      const dataPermission = await this.channelPermissionService.findOne({
        user_id: userObject?._id?.toString(),
        channel_id: dataChannel?.channel_id?.toString(),
      });
      if (
        dataPermission.channel_role !== "mentor" &&
        dataPermission.permission?.indexOf("channel/create_level") == -1
      ) {
        throw new ForbiddenException("You not have permission for this action!");
      }

      //Update logic if in Channel have only one Mentor
      const dataPermissionArray = await this.channelLevelService.filter(
        { channel_id: dataChannel?.channel_id?.toString(), channel_role: "mentor" },
        {},
        1,
        2
      );

      if (!dataPermissionArray || dataPermissionArray?.length == 1) {
        throw new ForbiddenException(
          "You need to have at least one Mentor in this Channel when you remove yourself from the Channel!"
        );
      }
      //Remove Channel
      const dataReturn = await this.channelLevelService.remove(id);
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
   * @param dataPermission
   * @param req
   * @param res
   * @returns
   */
  async processFollowUser(dataPermission: CreateChannelLikeDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const videoObject = await this.channelService.findById(dataPermission.video_id);

      if (!videoObject) {
        throw new NotFoundException("Video not found");
      }

      const dataUpdate = {
        user_id: userObject._id.toString(),
        video_id: dataPermission.video_id.toString(),
      };
      const dataReturn = await this.channelLikeService.update(dataUpdate);

      //Update count Video
      const dataUpdateFilter = {
        _id: videoObject._id,
      };
      await this.channelService.updateCount(dataUpdateFilter, { like_number: 1 });
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
   * @param dataPermission
   * @param req
   * @param res
   * @returns
   */
  async handleAddUserPermission(dataPermission: CreateChannelPermissionDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const channelObject = await this.channelService.findById(dataPermission.channel_id);
      if (!channelObject) {
        throw new NotFoundException("Channel is not found");
      }

      //Check user Permission
      const userPermissionToCreate = await this.channelPermissionService.findOne({
        user_id: userObject?._id?.toString(),
        channel_id: dataPermission?.channel_id,
      });

      if (!userPermissionToCreate) {
        throw new NotFoundException("You not have permission for this action!");
      }
      if (
        userPermissionToCreate &&
        userPermissionToCreate?.channel_role !== "mentor" &&
        userPermissionToCreate?.permission?.indexOf("channel/add_user") == -1
      ) {
        throw new NotFoundException("You not have permission for this action!");
      }

      //Check Permission
      const dataPermissionObject = await this.channelPermissionService.findOne({
        user_id: dataPermission.user_id,
        channel_id: dataPermission?.channel_id,
      });

      if (dataPermissionObject) {
        throw new NotFoundException("Exist permission for this user, please Update permission!");
      }
      const dataFilterView = {
        user_id: userObject._id.toString(),
        channel_id: dataPermission.channel_id.toString(),
      };

      if (dataPermission?.permission) {
        dataPermission = { ...dataPermission, ...{ permission: JSON.parse(dataPermission?.permission) } };
      } else {
        dataPermission = { ...dataPermission, ...{ permission: [] } };
      }

      const dataLevelOne = await this.channelLevelService.findOne({ level_number: 1 });
      if (dataLevelOne) {
        dataPermission = { ...dataPermission, ...{ channel_level: dataLevelOne?._id?.toString() } };
      }
      const dataReturn = await this.channelPermissionService.create(dataPermission);
      //Update count Video
      const dataUpdateFilter = {
        _id: dataReturn.channel_id,
      };
      await this.channelService.updateCount(dataUpdateFilter, { view_number: 1 });

      //Update for User
      const dataUpdateUser = {
        _id: dataPermission?.user_id,
        channel_permission: dataReturn?._id?.toString(),
      };
      await this.userService.updateArray(dataUpdateUser);

      if (dataPermission?.channel_role === "mentor") {
        //Update for Channel
        const dataUpdateChannel = {
          _id: dataPermission?.channel_id,
          admin_user: dataPermission?.user_id,
        };
        //Update
        await this.channelService.updateArray(dataUpdateChannel);
      }
      await this.channelService.updateCount({ _id: dataPermission?.channel_id }, { member_number: 1 });

      await this.channelLevelService.updateCount(
        { channel_id: dataPermission?.channel_id, channel_level: 1 },
        { total_member: 1 }
      );

      const listChallenge = await this.challengeService.filter(
        {
          channel_id: channelObject._id.toString(),
          add_all_user: true,
        },
        {},
        1,
        1000
      );
      this.queueService.addTaskUserJoinChallenge({
        user_id: userObject._id.toString(),
        list_challenge_id: listChallenge.map((x) => {
          return {
            challenge_id: x?._id.toString(),
            game_id: x?.game_id?._id.toString(),
            game_type: x?.game_id?.game_type,
            title: x?.title,
          };
        }),
        channel_id: channelObject._id.toString(),
        official_status: 1,
        display_name: userObject?.display_name,
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
   * @author Tony Vu
   * @param dataPermission
   * @param req
   * @param res
   * @returns
   */
  async processUnFollowUser(dataPermission: CreateChannelLikeDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const videoObject = await this.channelService.findById(dataPermission.video_id);

      if (!videoObject) {
        throw new NotFoundException("Video not found");
      }

      const dataUpdate = {
        user_id: userObject._id.toString(),
        video_id: dataPermission.video_id.toString(),
      };

      const dataReturn = await this.channelLikeService.removeOne(dataUpdate);

      //Update count Video
      const dataUpdateFilter = {
        _id: videoObject._id,
      };
      await this.channelService.updateCount(dataUpdateFilter, { like_number: -1 });
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
   * @param dataPermission
   * @param req
   * @param res
   * @returns
   */
  async plusPointHandleForUser(plusPointChannelDto: PlusPointChannelDto, res: Response, req: ExpressRequestDto) {
    try {
      if (plusPointChannelDto.point && Number(plusPointChannelDto.point) < 10) {
        const userObject = req?.user_object;
        const dataCountUserFilter = {
          channel_id: plusPointChannelDto.channel_id,
          user_id: plusPointChannelDto?.user_receive_id?.toString(),
        };

        const dataPermission = await this.channelPermissionService.findOne(dataCountUserFilter);

        //Update user level
        //Update Count
        const result = await this.channelPermissionService.updateCount(
          { _id: dataPermission?._id?.toString() },
          {
            point: plusPointChannelDto.point,
            point_month: plusPointChannelDto.point,
            point_week: plusPointChannelDto.point,
          },
          req?.auth_code,
          {
            entity_id: userObject?._id?.toString(),
            entity_type: new Date().toISOString(),
            point_number: plusPointChannelDto.point,
            user_id: plusPointChannelDto?.user_receive_id?.toString(),
          }
        );
        res.set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" }).status(HttpStatus.OK).json({
          data: result,
          message: "Plus Point For User Success",
        });
      } else {
        throw new BadRequestException("Cannot plus point large than or equal 10");
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
