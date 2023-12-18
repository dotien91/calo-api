import { Response, Request } from "express";
import {
  HttpStatus,
  NotFoundException,
  BadRequestException,
  Injectable,
  Res,
  Req,
  Param,
  Logger,
} from "@nestjs/common";
import { UserSessionService } from "../../../modules/user/services/user_session.service";
import { NotificationService } from "../services/notification.service";
import { Notification } from "../schemas/notification.schema";
import axios from "axios";
import { CreateNotificationDto } from "../dto/create-notifcation.dto";
import { ListNotificationDto } from "../dto/list-notification.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { ExpressRequestDto } from "../../../dto/express-request.dto";

import * as fs from "fs";
import * as tls from "tls";
import { Buffer } from "node:buffer";
import { Model, Types } from "mongoose";
import * as _ from "lodash";
import { UpdateNotificationDto } from "../dto/update-notification.dto";
import { Channel } from "../../../modules/channel/schemas/channel.schema";
import { User, UserDocument } from "../../../modules/user/schemas/user.schema";
import { Gift } from "../../../modules/gift/schemas/gift.schema";
import { UserService } from "../../../modules/user/services/user.service";
import { JwtHelperService } from "../../../modules/core/services/jwt_helper.service";
import { ChannelService } from "../../../modules/channel/services/channel.service";
import { GiftService } from "../../../modules/gift/services/gift.service";
import { InjectModel } from "@nestjs/mongoose";
const { getFirestore } = require("firebase-admin/firestore");
const apn = require("apn");

/**
 * @author Tony Vu
 * @class NotificationHelper
 */
@Injectable()
export class NotificationHelper {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private appUserService: UserService,
    private notificationService: NotificationService,
    private userSessionService: UserSessionService,
    private userPermissionService: UserPermissionService,
    private jwtHelper: JwtHelperService,
    private channelService: ChannelService,
    private giftService: GiftService,
  ) { }
  private readonly logger = new Logger("notification");

  /**
   * @author Tony Vu
   * @param dataCreate
   * @returns
   */
  async handleSendNotification(dataCreate: CreateNotificationDto, authCode: string = "") {
    //Check User
    try {
      let dataReturn = await this.notificationService.create(dataCreate);
      if (dataReturn) {
        //Send to socket
        await this.handleSendNotificationToSession(dataReturn);
        setTimeout(async () => {
          // console.log(authCode, 'authCode')
          await this.handleSendNoificationSocket(dataReturn, authCode);
        }, 500);
      }
      return true;
    } catch (error) {
      this.logger.log("handleSendNotification Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param dataJson
   * @param auth
   * @returns
   */
  async handleSendNoificationSocket(dataJson: any, auth: string) {
    try {
      if (dataJson?.user_id) {
        delete dataJson.user_id;
      }
      //Get Notification Object
      let dataNotificationObject = await this.notificationService.findById(dataJson?._id?.toString());
      let dataToUpdate = {
        notification: JSON.stringify(dataNotificationObject),
      };
      const params = new URLSearchParams(dataToUpdate);
      const config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Authorization": auth,
        },
      };
      this.logger.log(params, 'params');
      this.logger.log(config, 'config');

      const urlLogin = process.env.SOCKET_API;

      let dataNotification = await axios
        .post(urlLogin + "/notification", params, config)
        .then((response) => {
          if (response?.data) {
            this.logger.log("Send Notification Successfully" + JSON.stringify(response.data));
            return true;
          } else {
            return false;
          }
        })
        .catch((error) => {
          this.logger.log("Send Message Error: " + JSON.stringify(error.response.data));
          return false;
        });
      return dataNotification;
    } catch (error) {
      console.log(error, 'error');
    }

  }

  /**
   *
   * @param dataFilter
   * @returns
   */
  async getNotification(dataFilter: any) {
    try {
      let dataNotification = await this.notificationService.findOne(dataFilter);
      return dataNotification;
    } catch (error) {
      return null;
    }
  }
  /**
   *
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleGetDetailAdmin(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject || !id) {
        throw new BadRequestException("User is invalid");
      }
      let userId = userObject._id.toString();
      //Check Permission
      let dataReturn = await this.notificationService.findById(id.toString());
      if (
        (await this.userPermissionService.isHavePermission(userId, "notification/list")) ||
        dataReturn.createdBy.toString() === userId
      ) {
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new BadRequestException("You haven't permission for this Action!");
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  /**
   *
   * @param dataUpdate
   * @param res
   * @param req
   * @returns
   */
  async handleUpdateByAdmin(dataUpdate: UpdateNotificationDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }
      let userId = userObject._id.toString();
      //Check Permission
      if (await this.userPermissionService.isHavePermission(userId, "notification/update")) {
        dataUpdate = { ...dataUpdate, ...{ createdBy: userId } };
        if (dataUpdate.user_id && dataUpdate.user_id.indexOf(",") !== -1) {
          let dataUserId = [];
          let dataUserArray = dataUpdate?.user_id?.toString().split(",");
          for (let userItemObject of dataUserArray) {
            try {
              let objectId = new Types.ObjectId(userItemObject);
              if (!objectId) {
                continue;
              } else {
                dataUserId.push(userItemObject);
              }
            } catch (error) { }
          }
          dataUpdate = { ...dataUpdate, ...{ user_id: dataUserId } };
        }

        let dataReturn = await this.notificationService.update(dataUpdate);
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
   * @param dataUpdate
   * @param res
   * @param req
   * @returns
   */
  async updateNotification(dataUpdate: UpdateNotificationDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }
      //Get data To check
      let dataNotification = await this.notificationService.findOne({ _id: dataUpdate?._id });

      if (dataNotification?.user_id?.indexOf(userObject?._id) == -1) {
        throw new BadRequestException("You haven't permission for this Action!");
      }
      let dataReturn = await this.notificationService.update(dataUpdate);
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
   * @param dataCreate
   * @param res
   * @param req
   * @returns
   */
  async createNotificationAdmin(dataCreate: CreateNotificationDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }
      let userId = userObject._id.toString();

      if (await this.userPermissionService.isHavePermission(userId, "notification/create")) {
        dataCreate = { ...dataCreate, ...{ createdBy: userId } };
        if (dataCreate.user_id && dataCreate.user_id.indexOf(",") !== -1) {
          let dataUserId = [];
          let dataUserArray = dataCreate?.user_id?.toString().split(",");
          for (let userItemObject of dataUserArray) {
            try {
              let objectId = new Types.ObjectId(userItemObject);
              if (!objectId) {
                continue;
              } else {
                dataUserId.push(userItemObject);
              }
            } catch (error) { }
          }
          dataCreate = { ...dataCreate, ...{ user_id: dataUserId } };
        }
        let dataReturn = await this.notificationService.create(dataCreate);

        if (dataReturn && Number(dataReturn.manual_mode) === 2) {
          await this.handleSendNotificationToSession(dataReturn);
        }
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new BadRequestException("You haven't permission for this Action!");
      }
    } catch (error) {
      this.logger.log("handleSendNotification Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param dataNotification
   * @returns
   */
  async handleSendNotificationToSession(dataNotification: Notification) {
    // console.log(JSON.stringify(dataNotification), "dataNotification");
    try {
      if (dataNotification.channel !== "user") {
        //Send Notification to Channel
      } else {
        let userId = dataNotification.user_id.toString();
        if (dataNotification.user_id && dataNotification.user_id.length > 1) {
          userId = dataNotification.user_id.join(",");
        }
        this.logger.log("Send a Message to " + userId);
        //Find Session
        let sessionData = await this.userSessionService.filter({ user_id: userId }, { createdAt: "DESC" }, 1, 1000);

        // console.log(sessionData, '')

        if (sessionData && sessionData.length) {
          let deviceIds = [];
          let appleSignature = [];
          for (let sessionItem of sessionData) {
            if (dataNotification.type_action === "link") {
              if (process.env.USE_APN_MESSAGE === "false") {
                if (sessionItem.device_signature) {
                  deviceIds.push(sessionItem.device_signature);
                }
              } else {
                if (sessionItem.device_signature && !sessionItem.apple_notification) {
                  deviceIds.push(sessionItem.device_signature);
                }
                if (sessionItem.apple_notification) {
                  appleSignature.push(sessionItem.apple_notification);
                }
              }
            } else {
              //Is Call
              if (sessionItem.device_signature && !sessionItem.apple_signature) {
                deviceIds.push(sessionItem.device_signature);
              }
              if (sessionItem.apple_signature) {
                appleSignature.push(sessionItem.apple_signature);
              }
            }
          }
          let dataParam = {};
          try {
            dataParam = JSON.parse(dataNotification.param.toString());
          } catch (error) {
            dataParam = {};
          }
          deviceIds = _.uniq(deviceIds);

          // console.log(deviceIds, "deviceIds");
          appleSignature = _.uniq(appleSignature);

          //Send Notification
          let data = {
            notification: {
              title: dataNotification.title,
              body: dataNotification.content,
              click_action: dataNotification.click_action,
              icon: dataNotification.image,
              image: dataNotification.image,
              type_action: dataNotification.type_action,
              router: dataNotification.router,
            },
            android: {
              priority: "high",
            },
            collapse_key: "Notification ChatGPT",
            priority: "high",
            data: { ...dataParam, ...{ type_action: dataNotification.type_action, router: dataNotification.router } },
            icon: dataNotification.image,
          };

          if (appleSignature && appleSignature.length) {
            if (dataNotification.type_action === "link") {
              let newData = JSON.parse(JSON.stringify(data));
              newData = {
                ...newData,
                ...{
                  msgFrom: dataNotification.title,
                  messageFrom: dataNotification.title,
                  launchImage: dataNotification.image,
                },
              };
              await this.handleSendNotificationAppleMessage(
                appleSignature,
                dataNotification?.content?.toString(),
                data
              );
            } else {
              if (dataNotification.type_action.indexOf("end_") === -1) {
                await this.handleSendNotificationApple(appleSignature, dataNotification?.title?.toString(), data);
              }
            }
          }
          if (deviceIds && deviceIds.length) {
            data = {
              ...data,
              ...{
                registration_ids: deviceIds,
              },
            };
            const config = {
              headers: {
                Authorization: `Bearer ${process.env.FIREBASE_SEND_NOTIFICATION_KEY}`,
                "Content-Type": "application/json",
              },
            };
            const urlLogin = "https://fcm.googleapis.com/fcm/send";
            let dataReturn = await axios
              .post(urlLogin, JSON.stringify(data), config)
              .then((response) => {
                if (response?.data) {
                  this.logger.log("Send Notification Successfully: " + JSON.stringify(response.data));
                  return true;
                } else {
                  this.logger.log("Send Notification Error: NOT HAVE DATA " + JSON.stringify(response));
                  return false;
                }
              })
              .catch((error) => {
                this.logger.log("Send Notification Error: " + JSON.stringify(error));
                return false;
              });
            return dataReturn;
          }
        }
      }
      return null;
    } catch (error) {
      this.logger.log("handleSendNotificationFirebase Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  /**
   *
   * @param token
   * @param callString
   * @param payload
   * @returns
   */
  async handleSendNotificationApple(token: string[], callString: string, payload: any) {
    try {
      var options = {
        production: process.env.APN_PRODUCT === "true" ? true : false,
        batchFeedback: true,
        interval: 300,
        maxConnections: 5,
        key: process.env.KEY_PEM,
        cert: process.env.CERT_PEM,
      };

      var apnProvider = new apn.Provider(options);

      let deviceToken = token;
      var note = new apn.Notification({
        aps: {
          "content-available": true,
        },
      });

      note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
      note.badge = 10;
      note.sound = "default";
      note.alert = callString;
      note.msgFrom = payload?.msgFrom;
      note.pushType = "alert";
      note.payload = payload;
      note.priority = 10;
      note.contentAvailable = 1;
      note.topic = process.env.BUNDLE_NAME_VOIP;

      let dataReturn = await apnProvider.send(note, deviceToken).then((result) => {
        return result;
      });

      return dataReturn;
    } catch (error) {
      this.logger.error(error);
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param token
   * @param callString
   * @param payload
   * @returns
   */
  async handleSendNotificationAppleMessage(token: string[], dataTitle: string, payload: any) {
    try {
      var options = {
        production: process.env.APN_PRODUCT === "true" ? true : false,
        batchFeedback: true,
        interval: 300,
        maxConnections: 5,
        key: process.env.KEY_PEM_NOTIFICATION,
        cert: process.env.CERT_PEM_NOTIFICATION,
      };

      var apnProvider = new apn.Provider(options);

      let deviceToken = token;
      var note = new apn.Notification({
        aps: {
          "content-available": true,
        },
      });

      note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
      note.badge = 3;
      note.sound = "default";
      note.alert = dataTitle;
      note.pushType = "alert";
      note.payload = payload;
      note.priority = 10;
      note.contentAvailable = 1;
      note.topic = process.env.BUNDLE_NAME_NOTIFICATION;

      let dataReturn = await apnProvider.send(note, deviceToken).then((result) => {
        return result;
      });

      return dataReturn;
    } catch (error) {
      console.log(error);
      throw new NotFoundException(error.message);
    }
  }

  async handleCronJob() {
    try {
      let dataFilter = {
        manual_mode: 1,
      };
      let totalNotification = await this.notificationService.filter(dataFilter, {}, 1, 1000);
      for (let notificationItem of totalNotification) {
        await this.handleSendNotificationToSession(notificationItem);
        let dataUpdate = {
          _id: notificationItem._id.toString(),
          send_status: 4,
        };
        await this.notificationService.update(dataUpdate);
      }

      //console.log(totalNotification);
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
  async getNotificationByAdmin(query: ListNotificationDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }
      let userId = userObject._id.toString();

      if (await this.userPermissionService.isHavePermission(userId, "notification/list")) {
        if (Number(query.limit) > 1000 || !query.limit) {
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
        let dataReturn = await this.notificationService.filter(dataToFilter, orderByOBject, page, limit);
        let dataCount = await this.notificationService.count(dataToFilter);
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
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getUserList(query: ListNotificationDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }
      let userId = userObject._id.toString();

      if (Number(query.limit) > 1000 || !query.limit) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }
      let dataToFilter = { ...query, ...{ user_id: userObject?._id?.toString(), channel_id: req?.channel_id } };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      let dataReturn = await this.notificationService.filter(dataToFilter, orderByOBject, page, limit);
      let dataCount = await this.notificationService.count(dataToFilter);
      let readCount = await this.notificationService.count({ ...dataToFilter, ...{ read_status: "0" } });
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count, X-Total-Unread", "X-Total-Count": dataCount, "X-Total-Unread": readCount })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param hexstr
   * @returns
   */
  hextobin(hexstr) {
    let buf = new Buffer(hexstr.length / 2);
    for (var i = 0; i < hexstr.length / 2; i++) {
      buf[i] = (parseInt(hexstr[i * 2], 16) << 4) + parseInt(hexstr[i * 2 + 1], 16);
    }
    return buf;
  }


  /**
   * @author SonLH
   */
  async sendNotificationAndEmailReceiveGift(dataChannel: Channel, dataUser: User, dataGift: Gift) {
    //Send E-Mail Notication to user receive gift
    let dataFirestore = getFirestore();
    let dataToUpdate = {
      brand_name: "Gamifa",
      channel: dataChannel?.name?.toString(),
      gift: dataGift?.name,
      //@ts-ignore
      // post_image: dataRedeem?.attach_files[0]?.media_url || "",
      email: dataUser?.user_email,
      fullname: dataUser?.display_name,
      user_id: dataUser?._id?.toString(),
      post_url: dataChannel?.domain + "/r/gift/receivers",
      event_name: "suprise_gift_notication",
      is_send_email: false
    };

    const dataUserStore = dataFirestore.collection("Users");
    await dataUserStore
      .add(dataToUpdate)
      .then(() => {
        console.log("User added!");
      })
      .catch((error) => {
        console.log(error);
      });

    //Send notication to user received gift
    let supportAccount = await this.appUserService.findOne({ _id: process.env.INFO_USER });

    let tokenReturn = this.jwtHelper.generateJwt(
      process.env.INFO_USER,
      supportAccount?.user_email?.toString(),
      process.env.INFO_SESSION,
      true
    );
    let dataToSendNotification = {
      request_id: "",
      path: "/r/gift/receivers",
      data_id: "",
    };
    let notificationContent = `Chúc mừng ${dataUser?.display_name} vừa được nhận ${dataGift?.name}`;
    let dataNotification = {
      createdBy: process.env.INFO_USER,
      user_id: dataUser?._id.toString(),
      channel_id: dataChannel?._id?.toString(),
      title: 'QUÀ TẶNG ĐẶC BIỆT',
      content: notificationContent,
      request_id: dataGift._id.toString(),
      param: JSON.stringify(dataToSendNotification),
      type_action: "link",
      router: "NAVIGATION_LIST_NOTIFICATIONS_SCREEN",
      click_action: "",
      image: "",
      channel: "user",
    };
    await this.handleSendNotification(dataNotification, tokenReturn.toString());
  }

  /**
   * @author SonLH
   */
  async sendNotificationAndEmail(data: any) {
    try {
      //Send E-Mail Notication to user receive gift
      // let dataUser = await this.appUserService.findOne({ _id: data?.user_id });
      let dataUser = await this.userModel.findOne({ _id: new Types.ObjectId(data?.user_id) });
      let dataChannel = await this.channelService.findById(data?.channel_id);
      if (!dataUser) {
        this.logger.log(`Cannot found account with id ${data?.user_id}`)
      } else if (!dataChannel) {
        this.logger.log(`Cannot found channel with id ${data?.channel_id}`)
      } else {
        let dataFirestore = getFirestore();
        let dataToUpdate = {
          brand_name: "Gamifa",
          channel: data?.dataChannel?.name?.toString() || dataChannel?.name?.toString(),
          // gift: dataGift?.name,
          //@ts-ignore
          // post_image: dataRedeem?.attach_files[0]?.media_url || "",
          email: dataUser?.user_email,
          fullname: dataUser?.display_name,
          user_id: dataUser?._id?.toString(),
          post_url: dataChannel?.domain + data?.path,
          event_name: data?.mail_template,
          is_send_email: false
        };
        if (data?.event_name) {
          dataToUpdate = { ...dataToUpdate, ...{ event: data?.event_name } }
        }

        const dataUserStore = dataFirestore.collection("Users");
        await dataUserStore
          .add(dataToUpdate)
          .then(() => {
            console.log("User added!");
          })
          .catch((error) => {
            console.log(error);
          });

        //Send notication to user received gift
        let supportAccount = await this.appUserService.findOne({ _id: process.env.INFO_USER });

        let tokenReturn = this.jwtHelper.generateJwt(
          process.env.INFO_USER,
          supportAccount?.user_email?.toString(),
          process.env.INFO_SESSION,
          true
        );
        let dataToSendNotification = {
          request_id: "",
          path: dataChannel?.domain + data?.path,
          data_id: "",
          order_id: data?.order_id
        };
        let notificationContent = data?.content({
          display_name: dataUser?.display_name.toString(),
          channel_name: dataChannel?.name.toString()
        });
        let dataNotification = {
          createdBy: data?.send_user_id,
          user_id: dataUser?._id.toString(),
          channel_id: dataChannel?._id?.toString(),
          title: data?.title,
          content: notificationContent,
          request_id: data?.request_id,
          param: JSON.stringify(dataToSendNotification),
          type_action: "link",
          router: data?.router,
          click_action: "",
          image: "",
          channel: "user",
        };
        await this.handleSendNotification(dataNotification, tokenReturn.toString());
      }
    } catch (error) {
      this.logger.log(`Send mail and notification fails : ${error.message}`)
    }
  }


  /**
  * @author SonLH
  */
  async sendNotification(data: any) {
    //Send notication to user received gift
    let supportAccount = await this.appUserService.findOne({ _id: process.env.INFO_USER });
    let tokenReturn = this.jwtHelper.generateJwt(
      process.env.INFO_USER,
      supportAccount?.user_email?.toString(),
      process.env.INFO_SESSION,
      true
    );
    let dataToSendNotification = {
      request_id: "",
      path: data?.path,
      data_id: "",
    };
    let notificationContent = data?.content();
    let dataNotification = {
      createdBy: data?.send_user_id,
      channel_id: data?.channel_id || null,
      user_id: data?.user_id,
      title: data.title,
      content: notificationContent,
      request_id: data.request_id || null,
      param: JSON.stringify(dataToSendNotification),
      type_action: "link",
      router: "NAVIGATION_LIST_NOTIFICATIONS_SCREEN",
      click_action: "",
      image: "",
      channel: "user",
    };
    await this.handleSendNotification(dataNotification, tokenReturn.toString());
  }
}
