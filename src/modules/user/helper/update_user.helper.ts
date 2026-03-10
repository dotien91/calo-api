import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { createHash } from "crypto";
import { Response } from "express";

import * as _ from "lodash";
import mongoose from "mongoose";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { ConfigService } from "../../../modules/config/services/config.service";
import { NotificationHelper } from "../../../modules/notification/helper/notification.helper";
import { NotificationService } from "../../../modules/notification/services/notification.service";
import {
  RedeemMissionActionTarget,
  RedeemMissionActionType,
} from "../../../modules/redeem/interfaces/redeem.interface.i";
import { RedeemUserService } from "../../../modules/redeem/services/redeem_user.service";
import { SocketService } from "../../../modules/socket/services/socket.service";
import { SocketPath } from "../../../modules/socket/services/socket.service.i";
import { ChatRoomUserOptionService } from "../../chat_room/services/chat_room_user_option.service";
import { NotificationRouter } from "../../notification/interfaces/notification.interface";
import { InvitationCodeBody } from "../dto/create-invitation-code.dto";
import { CreateUserAnonymousDto } from "../dto/create-user_anonymous.dto";
import { CreateUserBlockDto, IgnoreFollowerDTO } from "../dto/create-user_block.dto";
import { CreateUserFollowDto } from "../dto/create-user_follow.dto";
import { CreateUserInterestDto } from "../dto/create-user_interest.dto";
import { CreateUserLocationDto } from "../dto/create-user_location.dto";
import { CreateUserQuestionDto } from "../dto/create-user_question.dto";
import { CreateUserViewDto } from "../dto/create-user_view.dto";
import { RequestDataDto } from "../dto/request-data.dto";
import { SearchUserInterestDto } from "../dto/search-user_interest.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { UpdateUserActiveDto } from "../dto/update-user_active.dto";
import { UpdateUserInterestDto } from "../dto/update-user_interest.dto";
import { UpdateUserQuestionDto } from "../dto/update-user_question.dto";
import { User } from "../schemas/user.schema";
import { UserLocationHistory } from "../schemas/user_location_history.schema";
import { UserService } from "../services/user.service";
import { UserAnonymousService } from "../services/user_anonymous.service";
import { UserBlockService } from "../services/user_block.service";
import { UserDisagreeService } from "../services/user_disagree.service";
import { UserFollowService } from "../services/user_follow.service";
import { UserInterestService } from "../services/user_interest.service";
import { UserLocationService } from "../services/user_location.service";
import { UserQuestionService } from "../services/user_question.service";
import { UserSessionService } from "../services/user_session.service";
import { UserViewService } from "../services/user_view.service";
/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class UpdateUserHelper {
  constructor(
    private appUserService: UserService,
    private userFollowService: UserFollowService,
    private userViewService: UserViewService,
    private userDisagreeService: UserDisagreeService,
    private userBlockService: UserBlockService,
    private userSessionService: UserSessionService,
    private notificationHelper: NotificationHelper,
    private userInterestService: UserInterestService,
    private notificationService: NotificationService,
    private userQuestionService: UserQuestionService,
    private configService: ConfigService,
    private userLocationService: UserLocationService,
    private userAnonymousService: UserAnonymousService,
    private chatRoomUserOptionService: ChatRoomUserOptionService,
    private socketService: SocketService,
    private redeemUserService: RedeemUserService
  ) {}

  private readonly logger = new Logger("call");
  /**
   * @author Tony Vu
   * @function processUserUpdate
   */
  async processUserUpdate(updateData: UpdateUserDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (userObject._id.toString() !== updateData._id) {
        throw new ForbiddenException("You can not update other profile");
      }

      if (
        updateData &&
        Object.keys(updateData).length === 0 &&
        Object.getPrototypeOf(updateData) === Object.prototype
      ) {
        throw new NotFoundException("Empty update Data!");
      }

      const dataUpdate = {
        ...{ _id: updateData._id },
        ...updateData,
      };
      // if (updateData?.travel_city) {
      //   const dataCity = await this.cityService.findById(updateData?.travel_city);
      //   if (!dataCity) {
      //     throw new BadRequestException("City not found!");
      //   }
      //   if (dataCity.loc && dataCity?.loc?.coordinates) {
      //     const dataToUpdate = {
      //       user_id: updateData._id,
      //       travel_city: updateData?.travel_city,
      //       loc: {
      //         type: "Point",
      //         coordinates: dataCity?.loc?.coordinates,
      //       },
      //     };
      //     await this.userOptionService.update(dataToUpdate);
      //   }
      // }
      //Check Password
      if (dataUpdate?.old_password && dataUpdate?.user_password) {
        //Check Old Password
        const dataToUpdatePassword = await this.appUserService.findById(dataUpdate?._id?.toString(), {});
        const passwordToCheck = await this.handleProcessPassword(dataUpdate?.old_password);
        if (passwordToCheck?.toString() !== dataToUpdatePassword?.user_password?.toString()) {
          throw new BadRequestException("E-mail or Password is not correct!");
        }
        dataUpdate.user_password = await this.handleProcessPassword(dataUpdate?.user_password);
      } else {
        delete dataUpdate.old_password;
        delete dataUpdate.user_password;
      }
      //Check Avatar Update
      let isUpdateAvatar = false;
      if (dataUpdate?.user_avatar && userObject?.user_avatar !== dataUpdate?.user_avatar) {
        isUpdateAvatar = true;
      }

      const dataReturn = await this.appUserService.update(dataUpdate);

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
   * @param password
   */
  async handleProcessPassword(password: string) {
    try {
      password = password + "pxtPAtrn9Q2xADXp";
      const newPassword = createHash("sha256").update(password).digest("hex");
      return newPassword?.toString();
    } catch (error) {
      this.logger.log("Login with Password Error: " + JSON.stringify(error));
      return null;
    }
  }

  /**
   * @author Tony Vu
   * @function processUserUpdate
   */
  async processUpdateUserActive(updateData: UpdateUserActiveDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const currentTime = new Date();

      const dataToUpdate = {
        _id: userObject._id.toString(),
        user_active: Number(updateData.user_active),
        last_active: currentTime.toUTCString(),
      };

      const dataBaseUser = await this.appUserService.update(dataToUpdate);

      //Handle Send Message
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataBaseUser);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  /**
   *
   * @param dataRequest
   * @param req
   * @param res
   */
  async handleRequestLocation(dataRequest: RequestDataDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const authCode = req?.auth_code;
      const dataPartner = await this.appUserService.findOneLogin({ _id: dataRequest?.partner_id });
      if (!dataPartner) {
        throw new BadRequestException("Partner not exist!");
      } else {
        const dataToSendNotification = {
          data_id: userObject._id.toString(),
          path: "/v/user/",
        };
        const dataNotification = {
          createdBy: userObject._id.toString(),
          user_id: dataRequest?.partner_id,
          channel_id: req?.channel_id,
          title: "Request Location from " + userObject.display_name,
          content: "Request Location from " + userObject.display_name,
          param: JSON.stringify(dataToSendNotification),
          type_action: "request_location",
          router: NotificationRouter.NAVIGATION_CHAT_ROOM,
          click_action: "",
          image: userObject.user_avatar
            ? userObject.user_avatar.toString()
            : "https://lgbtapp.s3.ap-southeast-1.amazonaws.com/2022/08/23/62e8a1df34a5b011e5d174e5-default_avatar.png",
          channel: "user",
        };
        await this.notificationHelper.handleSendNotification(dataNotification, authCode);

        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataPartner);
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @function processUserUpdate
   */
  async processDeleteUser(id: string, req: ExpressRequestDto, res: Response) {
    try {
      const dataUpdate = {
        _id: id,
        user_status: "0",
      };

      if (req.user_id.toString() !== id) throw new ForbiddenException("You don't have permission");

      const dataReturn = await this.appUserService.update(dataUpdate);
      await this.userSessionService.removeByUserId(id);
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
  async processViewUser(dataFollow: CreateUserViewDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const authCode = req?.auth_code;
      if (dataFollow.partner_id.toString() === userObject._id.toString()) {
        //Check Admin
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json({});
      }
      const dataUpdate = {
        user_id: userObject._id.toString(),
        partner_id: dataFollow.partner_id.toString(),
      };
      let dataReturn = await this.userViewService.update(dataUpdate);

      const followUserObject = [];
      if (userObject?.follow_users && userObject?.follow_users?.length) {
        for (const followItem of userObject?.follow_users) {
          followUserObject.push(followItem.toString());
        }
      }

      if (followUserObject.indexOf(dataFollow.partner_id.toString()) !== -1) {
        dataReturn = { ...dataReturn, ...{ is_follow: true } };
      } else {
        dataReturn = { ...dataReturn, ...{ is_follow: false } };
      }

      const blockUserObject = [];
      if (userObject?.block_users && userObject?.block_users?.length) {
        for (const blockItem of userObject?.block_users) {
          blockUserObject.push(blockItem.toString());
        }
      }

      if (blockUserObject.indexOf(dataFollow.partner_id.toString()) !== -1) {
        dataReturn = { ...dataReturn, ...{ is_block: true } };
      } else {
        dataReturn = { ...dataReturn, ...{ is_block: false } };
      }

      //Send Notification if Brand is CallU
      if (process.env.BRANCH_NAME === "live_video") {
        //let userObjectDetail: any = await this.appUserService.findOneLogin({ _id: dataFollow.partner_id.toString() });
        const partnerObjectDetail: any = await this.appUserService.findOneLogin({ _id: userObject._id.toString() });
        if (partnerObjectDetail?.base_role === "women") {
          //Get user
          const notificationTitle = partnerObjectDetail?.display_name;
          const notificationDescription = partnerObjectDetail?.display_name + " visits you, text her now!";
          await this.sendNotificationToUser(
            dataFollow.partner_id.toString(),
            partnerObjectDetail,
            notificationTitle,
            notificationDescription,
            "user",
            authCode
          );
        }
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
   * @param dataFollow
   * @param req
   * @param res
   * @returns
   */
  async processFollowUser(dataFollow: CreateUserFollowDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const authCode = req?.auth_code;
      const userSession = req?.session_id;
      if (dataFollow.partner_id.toString() === userObject._id.toString()) {
        //Check Admin
        throw new BadRequestException("You haven't permission for this Action!");
      }
      let dataUpdate = {
        user_id: userObject._id.toString(),
        partner_id: dataFollow.partner_id.toString(),
      };
      let dataFollowUpdate = [dataFollow.partner_id.toString()];
      if (userObject?.follow_users) {
        dataFollowUpdate = _.union(userObject?.follow_users, dataFollowUpdate);
      }
      //Update for Partner
      const dataPartnerUpdate = {
        user_id: dataFollow.partner_id.toString(),
        partner_id: userObject._id.toString(),
        match_status: 1,
      };

      //Query 01
      const followPartnerObject = await this.userFollowService.updateWithoutCreate(dataPartnerUpdate);

      let isSendNotification = false;
      if (followPartnerObject && followPartnerObject._id) {
        dataUpdate = { ...dataUpdate, ...{ match_status: 1 } };
        //Send Notification to Partner
        isSendNotification = true;
      } else {
        dataUpdate = { ...dataUpdate, ...{ match_status: 0 } };
      }
      let dataDisagreeToCompare = [];

      if (userObject?.disagree_users) {
        for (const disagreeItem of userObject?.disagree_users) {
          dataDisagreeToCompare.push(disagreeItem.toString());
        }
      }
      dataDisagreeToCompare = dataDisagreeToCompare.filter((value, index) => {
        return value !== dataFollow.partner_id.toString();
      });
      const dataToUpdate = {
        _id: userObject._id.toString(),
        follow_users: dataFollowUpdate,
        disagree_users: dataDisagreeToCompare,
      };
      //Update Follow User
      //Query 02
      await this.appUserService.update(dataToUpdate);

      //Query 03
      await this.userDisagreeService.removeOne(dataUpdate);
      const dataReturn = await this.userFollowService.update(dataUpdate);

      if (isSendNotification) {
        await this.sendNotificationToPartner(dataFollow.partner_id.toString(), userObject, authCode, req);
      } else {
        //Check Last Notification
        const currentTime = new Date().getTime();
        const lastHour = currentTime - 60 * 60 * 1000;
        const afterTime = new Date(lastHour);

        const dataFilterNotification = {
          from_time: afterTime.toString(),
          notification_type: "like",
          user_id: dataFollow.partner_id.toString(),
        };
        const dataNotification = await this.notificationService.filter(dataFilterNotification, {}, 1, 1);
        if (!dataNotification || dataNotification.length == 0) {
          await this.sendNotificationToLike(dataFollow.partner_id.toString(), userObject, authCode, req);
        }
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
   * @param dataFollow
   * @param req
   * @param res
   * @returns
   */
  async processUnFollowUser(dataFollow: CreateUserFollowDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      if (dataFollow.partner_id.toString() === userObject._id.toString()) {
        //Check User
        throw new BadRequestException("You haven't permission for this Action!");
      }
      const dataFindOne = {
        user_id: userObject._id.toString(),
        partner_id: dataFollow.partner_id.toString(),
      };
      const dataToCheck = await this.userFollowService.findOne(dataFindOne);

      if (dataToCheck) {
        const dataReturn = await this.userFollowService.remove(dataToCheck._id.toString());
        //Remove in Partner
        const dataPartnerUpdate = {
          partner_id: userObject._id.toString(),
          user_id: dataFollow.partner_id.toString(),
          match_status: 0,
        };
        await this.userFollowService.update(dataPartnerUpdate);

        if (userObject?.follow_users) {
          //dataFollowUpdate = _.union(userObject?.follow_users, dataFollowUpdate);
          const dataFollowUpdate = userObject?.follow_users?.filter((value: any, index: number) => {
            if (value?.toString() === dataFollow.partner_id.toString()) {
              return false;
            } else {
              return true;
            }
          });
          const dataToUpdate = {
            _id: userObject._id.toString(),
            follow_users: dataFollowUpdate,
          };
          //Update Follow User
          await this.appUserService.update(dataToUpdate);
        } else {
          const dataToUpdate = {
            _id: userObject._id.toString(),
            follow_users: [],
          };
          //Update Follow User
          await this.appUserService.update(dataToUpdate);
        }

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
   * @author Tony Vu
   * @param dataFollow
   * @param req
   * @param res
   * @returns
   */
  async processDisagreeUser(dataFollow: CreateUserFollowDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      if (dataFollow.partner_id.toString() === userObject._id.toString()) {
        //Check Admin
        throw new BadRequestException("You haven't permission for this Action!");
      }
      const dataUpdate = {
        user_id: userObject._id.toString(),
        partner_id: dataFollow.partner_id.toString(),
      };
      let dataFollowUpdate = [dataFollow.partner_id.toString()];
      if (userObject?.disagree_users) {
        dataFollowUpdate = _.union(userObject?.disagree_users, dataFollowUpdate);
      }

      let dataFollowToCompare = [];
      if (userObject?.follow_users) {
        for (const followItem of userObject?.follow_users) {
          dataFollowToCompare.push(followItem.toString());
        }
      }
      dataFollowToCompare = dataFollowToCompare.filter((value, index) => {
        return value !== dataFollow.partner_id.toString();
      });

      await this.userFollowService.removeOne(dataUpdate);
      //Update partner Data
      const updatePartner = {
        user_id: dataFollow.partner_id.toString(),
        partner_id: userObject._id.toString(),
        match_status: 0,
      };
      await this.userFollowService.updateWithoutCreate(updatePartner);

      const dataReturn = await this.userDisagreeService.update(dataUpdate);
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
  async processUnDisagreeUser(dataFollow: CreateUserFollowDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      if (dataFollow.partner_id.toString() === userObject._id.toString()) {
        //Check User
        throw new BadRequestException("You haven't permission for this Action!");
      }
      const dataFindOne = {
        user_id: userObject._id.toString(),
        partner_id: dataFollow.partner_id.toString(),
      };
      const dataToCheck = await this.userDisagreeService.findOne(dataFindOne);

      if (dataToCheck) {
        const dataReturn = await this.userDisagreeService.remove(dataToCheck._id.toString());
        if (userObject?.disagree_users) {
          //dataFollowUpdate = _.union(userObject?.disagree_users, dataFollowUpdate);
          const dataFollowUpdate = userObject?.disagree_users?.filter((value: any, index: number) => {
            if (value?.toString() === dataFollow.partner_id.toString()) {
              return false;
            } else {
              return true;
            }
          });
          const dataToUpdate = {
            _id: userObject._id.toString(),
            disagree_users: dataFollowUpdate,
          };
          //Update Follow User
          await this.appUserService.update(dataToUpdate);
        } else {
          const dataToUpdate = {
            _id: userObject._id.toString(),
            disagree_users: [],
          };
          //Update Follow User
          await this.appUserService.update(dataToUpdate);
        }

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
   * @author Tony Vu
   * @param dataFollow
   * @param req
   * @param res
   * @returns
   */
  async processBlockUser(dataBlock: CreateUserBlockDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      if (dataBlock.partner_id.toString() === userObject._id.toString()) {
        //Check Admin
        throw new BadRequestException("You haven't permission for this Action!");
      }
      const dataToFind = {
        partner_id: userObject._id.toString(),
        user_id: dataBlock.partner_id.toString(),
      };
      const dataBlockToCheck = await this.userBlockService.findOne(dataToFind);
      if (dataBlockToCheck) {
        throw new NotFoundException("Can't block this user!");
      }
      const dataUpdate = {
        user_id: userObject._id.toString(),
        partner_id: dataBlock.partner_id.toString(),
      };
      const dataReturn = await this.userBlockService.update(dataUpdate);

      const chatRoomData = await this.chatRoomUserOptionService.findOne(dataUpdate);
      if (chatRoomData) {
        const dataToUpdate = {
          user_block: userObject._id.toString(),
        };
        await this.chatRoomUserOptionService.updateMany(
          { chat_room_id: chatRoomData.chat_room_id._id.toString() },
          dataToUpdate
        );
      }

      let dataBlockUpdate = [dataBlock.partner_id.toString()];
      if (userObject?.block_users) {
        dataBlockUpdate = _.union(userObject?.block_users, dataBlockUpdate);
      }
      const dataToUpdate = {
        _id: userObject._id.toString(),
        block_users: dataBlockUpdate,
      };
      //Update Follow User
      await this.appUserService.update(dataToUpdate);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async handleUpdateFollow(res: Response, req: ExpressRequestDto) {
    const dataUser = await this.appUserService.filter({}, {}, 1, 10000);
    if (dataUser && dataUser.length) {
      for (const dataItem of dataUser) {
        const userId = dataItem._id.toString();
        const followObject = await this.userFollowService.filter({ user_id: userId }, {}, 1, 10000);
        const dataFollowToUpdate = [];
        if (followObject && followObject.length) {
          for (const followItem of followObject) {
            dataFollowToUpdate.push(followItem.partner_id._id.toString());
          }
        }
        const blockObject = await this.userBlockService.filter({ user_id: userId }, {}, 1, 10000);
        const dataBlockToUpdate = [];
        if (blockObject && blockObject.length) {
          for (const blockItem of blockObject) {
            dataBlockToUpdate.push(blockItem.partner_id._id.toString());
          }
        }
        const dataUserToUpdate = {
          _id: userId,
          block_users: dataBlockToUpdate,
          follow_users: dataFollowToUpdate,
        };

        await this.appUserService.update(dataUserToUpdate);
        console.log("UPDATE OK");
      }
    }
  }

  // /**
  //  *
  //  * @param userId
  //  * @param cityName
  //  * @param countryName
  //  */
  // async sendMessage(partnerObject: User, req: ExpressRequestDto, res: Response, dataMessage: string) {
  //   setTimeout(async () => {
  //     const supportAccount = await this.appUserService.findOne({ _id: process.env.INFO_USER });
  //     //Create new
  //     const dataCreateReturnRoom = await this.chatRoomHelper.handleCreateRoom(
  //       supportAccount,
  //       partnerObject._id.toString(),
  //       "personal",
  //       "",
  //       true
  //     );

  //     if (!dataCreateReturnRoom) {
  //       console.log("Not found");
  //     } else {
  //       // let updatedAt = new Date(dataCreateReturnRoom?.updatedAt).getTime();
  //       // let currentTime = new Date().getTime();

  //       //console.log(currentTime - updatedAt);
  //       // let leftTime = currentTime - updatedAt;
  //       // if (leftTime < 2592000000 && Number(dataCreateReturnRoom?.chat_history_count) > 0) {
  //       //   console.log("Not return");
  //       //   return null;
  //       // }

  //       const chatContent = dataMessage;
  //       const tokenReturn = this.jwtHelper.generateJwt(
  //         process.env.INFO_USER,
  //         supportAccount?.user_email?.toString(),
  //         process.env.INFO_SESSION,
  //         true
  //       );
  //       const createChatHistoryDto = {
  //         chat_room_id: dataCreateReturnRoom?.chat_room_id?._id?.toString(),
  //         chat_content: chatContent,
  //       };

  //       req.user_id = supportAccount?._id.toString();
  //       req.user_object = supportAccount;
  //       req.session_id = process.env.INFO_SESSION;
  //       req.auth_code = tokenReturn.toString();

  //       const dataReturnHistory: any = await this.chatHistoryHelper.createNewHistory(
  //         req,
  //         res,
  //         createChatHistoryDto,
  //         false,
  //         true
  //       );
  //     }
  //   }, 2000);

  //   return true;
  // }

  /**
   * @author Tony Vu
   * @param dataFollow
   * @param req
   * @param res
   * @returns
   */
  async processUnBlockUser(dataBlock: CreateUserBlockDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      if (dataBlock.partner_id.toString() === userObject._id.toString()) {
        //Check User
        throw new BadRequestException("You haven't permission for this Action!");
      }
      const dataFindOne = {
        user_id: userObject._id.toString(),
        partner_id: dataBlock.partner_id.toString(),
      };
      const dataToCheck = await this.userBlockService.findOne(dataFindOne);
      if (dataToCheck) {
        await this.userBlockService.remove(dataToCheck._id.toString());

        const chatRoomData = await this.chatRoomUserOptionService.findOne(dataFindOne);
        if (chatRoomData) {
          const dataToUpdate = {
            user_block: "",
          };
          await this.chatRoomUserOptionService.updateMany(
            { chat_room_id: chatRoomData.chat_room_id._id.toString() },
            dataToUpdate
          );
        }

        if (userObject?.block_users) {
          //dataFollowUpdate = _.union(userObject?.follow_users, dataFollowUpdate);
          const dataBlockUpdate = userObject?.block_users?.filter((value: any, index: number) => {
            if (value?.toString() === dataBlock.partner_id.toString()) {
              return false;
            } else {
              return true;
            }
          });
          const dataToUpdate = {
            _id: userObject._id.toString(),
            block_users: dataBlockUpdate,
          };
          //Update Follow User
          await this.appUserService.update(dataToUpdate);
        } else {
          const dataToUpdate = {
            _id: userObject._id.toString(),
            block_users: [],
          };
          //Update Follow User
          await this.appUserService.update(dataToUpdate);
        }
        const dataReturn = null;

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
   * @param partnerId
   */
  async sendNotificationToPartner(partnerId: string, fromUser: any, authCode, req: ExpressRequestDto) {
    try {
      const userDisplay = fromUser.display_name ? fromUser.display_name : fromUser.user_login;
      const notificationTitle = userDisplay + " đã trở thành bạn bè của bạn!";
      const contentNotification = "Xem ngay hồ sơ của " + userDisplay + "! Họ đã trở thành bạn bè của bạn!";
      // if (fromUser?.country == "VN") {
      //   notificationTitle = "Ai đó đã tương hợp với bạn!";
      //   contentNotification = "Anh ấy có phải là định mệnh của bạn hay không? Anh ấy là ai?";
      // }
      const dataNotification = {
        createdBy: fromUser._id.toString(),
        user_id: partnerId,
        title: notificationTitle,
        content: contentNotification,
        channel_id: req?.channel_id,
        param: JSON.stringify({ path: "/v/user/", data_id: fromUser?._id }),
        type_action: "link",
        notification_type: "match",
        router: NotificationRouter.NAVIGATION_MESSAGE_SCREEN,
        click_action: "",
        image: "",
        channel: "user",
      };
      await this.notificationHelper.handleSendNotification(dataNotification, authCode);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   *
   * @param partnerId
   */
  async sendNotificationToUser(
    partnerId: string,
    fromUser: User,
    title: string,
    description: string,
    userType: string,
    authCode: string
  ) {
    try {
      const dataNotification = {
        createdBy: fromUser._id.toString(),
        user_id: partnerId,
        title: title,
        content: description,
        param: JSON.stringify({ item: fromUser }),
        type_action: "link",
        notification_type: userType,
        router: "",
        click_action: "",
        image: "",
        channel: "user",
      };
      // console.log(dataNotification, "dataNotification");
      //Check last Notification
      const dataNotificationObject: any = await this.notificationHelper.getNotification({
        user_id: partnerId.toString(),
      });
      if (dataNotificationObject) {
        const updatedAt = new Date(dataNotificationObject.createdAt).getTime();
        const currentTime = new Date().getTime();
        //console.log(currentTime - updatedAt);
        const leftTime = currentTime - updatedAt;
        if (leftTime < 3600000) {
          console.log("Not return");
          return null;
        }
      }
      await this.notificationHelper.handleSendNotification(dataNotification, authCode);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   *
   * @param partnerId
   */
  async sendNotificationToLike(partnerId: string, fromUser: User, authCode: string, req: ExpressRequestDto) {
    try {
      const userDisplay = fromUser.display_name ? fromUser.display_name : fromUser.user_login;

      const notificationTitle = userDisplay + " đã theo dõi bạn!";
      const contentNotification = userDisplay + " đã theo dõi bạn, hãy xem hồ sơ và tạo vòng kết nối với họ!";

      const dataNotification = {
        createdBy: fromUser._id.toString(),
        user_id: partnerId,
        title: notificationTitle,
        channel_id: req?.channel_id,
        content: contentNotification,
        param: JSON.stringify({ path: "/v/user/", data_id: fromUser?._id }),
        type_action: "link",
        notification_type: "like",
        router: NotificationRouter.NAVIGATION_LIKED_SCREEN,
        click_action: "",
        image: "",
        channel: "user",
      };
      await this.notificationHelper.handleSendNotification(dataNotification, authCode);
      return true;
    } catch (error) {
      return false;
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
  async createUserInterest(createUserInterest: CreateUserInterestDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (createUserInterest?.name_object) {
        createUserInterest = {
          ...createUserInterest,
          ...{ name_object: JSON.parse(createUserInterest?.name_object) },
        };
      }
      const dataCreate = await this.userInterestService.create(createUserInterest);
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
   * @param req
   * @param res
   * @returns
   */
  async handleGetUserInterestByUserId(id: string, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new NotFoundException("User is invalid");
      }
      const dataFilter = {
        _id: id.toString(),
      };
      const dataUser = await this.userInterestService.findOne(dataFilter, true);
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
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async processUpdateUserQuestion(dataUpdate: UpdateUserQuestionDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (dataUpdate?.question) {
        dataUpdate = {
          ...dataUpdate,
          ...{ question: JSON.parse(dataUpdate?.question) },
        };
      }
      const dataCreate = await this.userQuestionService.update(dataUpdate);
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
  async processCreateUserQuestion(dataUpdate: CreateUserQuestionDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (dataUpdate?.question) {
        dataUpdate = {
          ...dataUpdate,
          ...{ question: JSON.parse(dataUpdate?.question), user_id: userId },
        };
      }
      const dataCreate = await this.userQuestionService.create(dataUpdate);
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
  async processCreateUserLocation(dataUpdate: CreateUserLocationDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const authCode = req?.auth_code;
      const userId = userObject._id.toString();
      dataUpdate = {
        ...dataUpdate,
        ...{ user_id: userId },
      };

      const dataCreate = await this.userLocationService.create(dataUpdate);
      //Update user option
      await this.handleUpdateSocket(dataCreate, userObject, authCode);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataCreate);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async handleUpdateSocket(locationObject: UserLocationHistory, userObject: User, auth: string) {
    try {
      const userIds = [];
      //Check
      const dataToFilter = {
        partner_id: userObject?._id?.toString(),
        match_status: 1,
      };
      const orderByOBject = {};
      const page = 1;
      const limit = 100;
      const dataReturn = await this.userFollowService.filterUser(dataToFilter, orderByOBject, page, limit);
      if (dataReturn && dataReturn?.length) {
        for (const matchItem of dataReturn) {
          const userString = matchItem?.user_id?._id?.toString();
          userIds.push(userString);
        }
      }

      if (userIds && userIds?.length) {
        const dataToUpdate = {
          location: JSON.stringify(locationObject),
          user_ids: JSON.stringify(userIds),
        };
        const params = new URLSearchParams(dataToUpdate);
        const headers = {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Authorization": auth,
        };
        const dataNotification = await this.socketService
          .send(SocketPath.CHANGE_LOCATION, headers, params)
          .then((response) => {
            if (response?.data) {
              this.logger.log("Send change location Successfully" + JSON.stringify(response.data));
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
      }

      return true;
    } catch (error) {}
  }

  /**
   *
   * @param dataUpdate
   * @param res
   * @param req
   * @returns
   */
  async processCreateUserAnonymous(dataUpdate: CreateUserAnonymousDto, res: Response, req: ExpressRequestDto) {
    try {
      let dataFilter = {
        device_id: dataUpdate?.device_id,
      };
      if (dataUpdate?.user_type) {
        dataFilter = { ...dataFilter, ...{ user_type: dataUpdate?.user_type } };
      }
      let dataCreate: any;
      const dataReturn = await this.userAnonymousService.findOne(dataFilter);
      if (dataReturn) {
        dataUpdate = { ...dataUpdate, ...{ _id: dataReturn?._id?.toString() } };
        dataCreate = await this.userAnonymousService.update(dataUpdate);
      } else {
        dataCreate = await this.userAnonymousService.create(dataUpdate);
        dataCreate = dataCreate?.toObject();
      }

      const dataFind = {
        type: "limit_ab",
      };
      const dataConfig = await this.configService.findOne(dataFind);

      if (dataConfig && !dataCreate?.is_ab_testing) {
        const dataLimit = dataConfig?.data_content;
        const dataUsed = dataConfig?.count_ab;
        let isAb = false;
        if (Number(dataUsed) < Number(dataLimit)) {
          isAb = true;
        }
        await this.userAnonymousService.update({ _id: dataCreate?._id?.toString(), is_ab_testing: isAb });
        dataCreate = { ...dataCreate, ...{ is_ab_testing: isAb } };
      }

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
  async getListUserInterestByAdmin(query: SearchUserInterestDto, res: Response, req: ExpressRequestDto) {
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
      const dataReturn = await this.userInterestService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.userInterestService.count(dataToFilter);

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
  async updateUserInterestByAdmin(dataUpdate: UpdateUserInterestDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      //Check Permission
      if (dataUpdate?.name_object) {
        dataUpdate = {
          ...dataUpdate,
          ...{ name_object: JSON.parse(dataUpdate?.name_object) },
        };
      }

      if (dataUpdate?.description_object) {
        dataUpdate = {
          ...dataUpdate,
          ...{ description_object: JSON.parse(dataUpdate?.description_object) },
        };
      }
      const dataReturn = await this.userInterestService.update(dataUpdate);
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
  async removeUserInterest(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      //Check Permission
      const dataReturn = await this.userInterestService.remove(id);
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
  async removeUserQuestion(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }

      const dataReturn = await this.userQuestionService.remove(id);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async ignoreFollower(data: IgnoreFollowerDTO, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const ignoreFollowers = [
        ...userObject.ignore_followers,
        ...data.user_ids.map((user_id) => new mongoose.Types.ObjectId(user_id)),
      ];

      const dataReturn = await this.appUserService.update({
        _id: userObject._id.toString(),
        ignore_followers: ignoreFollowers,
      });
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async unIgnoreFollower(data: IgnoreFollowerDTO, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let currentIgnoreUser = userObject.ignore_followers;
      currentIgnoreUser = currentIgnoreUser.filter((userId) => {
        return !data.user_ids.includes(userId.toString());
      });

      const dataReturn = await this.appUserService.update({
        _id: userObject._id.toString(),
        ignore_followers: currentIgnoreUser,
      });
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async enterInvitationCode(body: InvitationCodeBody, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) throw new Error("Invalid user");

      const referralUser = await this.appUserService.findOne({ invitation_code: body.invitation_code });
      if (!referralUser) throw new Error("Invalid invitation code");

      if (referralUser._id.toString() === userObject._id.toString())
        throw new BadRequestException("You can not enter your code itself");

      await this.appUserService.update({
        _id: userObject._id.toString(),
        ref_invitation_code: referralUser.invitation_code,
      });

      // update redeem mission for user
      if (referralUser)
        this.redeemUserService.updateUserRedeem(
          referralUser,
          RedeemMissionActionType.REFERRAL,
          RedeemMissionActionTarget.ACCOUNT
        );

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
