import { response, Response } from "express";
import {
  ForbiddenException,
  BadRequestException,
  HttpStatus,
  NotFoundException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { UserService } from "../services/user.service";
import { UpdateUserOptionDto } from "../dto/update-user_option.dto";
import { UserOptionService } from "../services/user_option.service";
import { CreateUserFollowDto } from "../dto/create-user_follow.dto";
import { UserFollowService } from "../services/user_follow.service";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { CreateUserBlockDto } from "../dto/create-user_block.dto";
import { UserBlockService } from "../services/user_block.service";
import { ChatRoomUserOptionService } from "../../../modules/chat_room/services/chat_room_user_option.service";
import { UserSessionService } from "../services/user_session.service";
import { CreateUserViewDto } from "../dto/create-user_view.dto";
import { UserViewService } from "../services/user_view.service";
import * as _ from "lodash";
import { UpdateUserActiveDto } from "../dto/update-user_active.dto";
import { UserDisagreeService } from "../services/user_disagree.service";
import { ChatRoomHelper } from "../../../modules/chat_room/helpers/chat_room.helper";
import { CityService } from "../../../modules/city/services/city.service";
import { NotificationHelper } from "../../../modules/notification/helper/notification.helper";
import { UserInterestService } from "../services/user_interest.service";
import { CreateUserInterestDto } from "../dto/create-user_interest.dto";
import { SearchUserInterestDto } from "../dto/search-user_interest.dto";
import { UpdateUserInterestDto } from "../dto/update-user_interest.dto";
import { NotificationService } from "../../../modules/notification/services/notification.service";
import { User } from "../schemas/user.schema";
import { FaceDetectionService } from "../../../modules/face_detection/services/face_detection.service";
import { FaceDetectionHelper } from "../../../modules/face_detection/helper/face_detection.helper";
import { ChatMediaService } from "../../../modules/chat_media/services/chat_media.service";
import { UserMoodService } from "../services/user_mood.service";
import { UpdateUserQuestionDto } from "../dto/update-user_question.dto";
import { UserQuestionService } from "../services/user_question.service";
import { CreateUserQuestionDto } from "../dto/create-user_question.dto";
import { ConfigService } from "../../../modules/config/services/config.service";
import { JwtHelperService } from "../../../modules/core/services/jwt_helper.service";
import { ChatHistoryHelper } from "../../../modules/chat_history/helpers/chat_history.helper";
import TimeZone from "countries-and-timezones";
import { CreateUserLocationDto } from "../dto/create-user_location.dto";
import { UserLocationService } from "../services/user_location.service";
import { CreateUserAnonymousDto } from "../dto/create-user_anonymous.dto";
import { UserAnonymousService } from "../services/user_anonymous.service";
import { RequestDataDto } from "../dto/request-data.dto";
import axios from "axios";
import { createHash } from "crypto";
import { UserLocationHistory } from "../schemas/user_location_history.schema";
import { ChannelPermissionService } from "../../../modules/channel/services/channel_permission.service";
import { Types } from "mongoose";
/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class UpdateUserHelper {
  constructor(
    private appUserService: UserService,
    private userOptionService: UserOptionService,
    private userFollowService: UserFollowService,
    private userViewService: UserViewService,
    private userDisagreeService: UserDisagreeService,
    private userPermissionService: UserPermissionService,
    private chatRoomHelper: ChatRoomHelper,
    private userBlockService: UserBlockService,
    private userSessionService: UserSessionService,
    private chatRoomUserOptionService: ChatRoomUserOptionService,
    private chatMediaService: ChatMediaService,
    private faceDetectionHelper: FaceDetectionHelper,
    private faceDetectionService: FaceDetectionService,
    private cityService: CityService,
    private notificationHelper: NotificationHelper,
    private userInterestService: UserInterestService,
    private notificationService: NotificationService,
    private userMoodService: UserMoodService,
    private userQuestionService: UserQuestionService,
    private jwtHelper: JwtHelperService,
    private configService: ConfigService,
    private chatHistoryHelper: ChatHistoryHelper,
    private userLocationService: UserLocationService,
    private userAnonymousService: UserAnonymousService,
    private readonly channelPermissionService: ChannelPermissionService
  ) {}

  private readonly logger = new Logger("call");
  /**
   * @author Tony Vu
   * @function processUserUpdate
   */
  async processUserUpdate(updateData: UpdateUserDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      if (updateData._id.toString() !== userObject._id.toString()) {
        const userPermissionObject = await this.userPermissionService.isHavePermission(
          userObject._id.toString(),
          "user/update"
        );
        if (!userPermissionObject) {
          //Check Admin
          throw new BadRequestException("You haven't permission for this Action!");
        }
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
      if (updateData?.travel_city) {
        const dataCity = await this.cityService.findById(updateData?.travel_city);
        if (!dataCity) {
          throw new BadRequestException("City not found!");
        }
        if (dataCity.loc && dataCity?.loc?.coordinates) {
          const dataToUpdate = {
            user_id: updateData._id,
            travel_city: updateData?.travel_city,
            loc: {
              type: "Point",
              coordinates: dataCity?.loc?.coordinates,
            },
          };
          await this.userOptionService.update(dataToUpdate);
        }
      }
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
      if (
        updateData.user_avatar_thumbnail &&
        updateData.user_avatar_thumbnail.indexOf("lgbtapp.s3.ap-southeast-1.amazonaws.com") !== -1
      ) {
        const dataUpdateOption = {
          user_id: updateData._id,
          is_avatar: 1,
        };
        await this.userOptionService.update(dataUpdateOption);
      }

      if (updateData?.user_role) {
        //Check Admin && Permission
        const userPermissionObject = await this.userPermissionService.isHavePermission(
          userObject._id.toString(),
          "user/update"
        );

        if (!userPermissionObject) {
          throw new BadRequestException("You haven't permission for this Action!");
        }
      }
      if (isUpdateAvatar) {
        //Check Data
        //Update
        //Validate
        const avatarUrl = dataUpdate?.user_avatar;
        const image1Object = await this.chatMediaService.findOne({ media_url: avatarUrl });

        let genderPoint = 0;
        if (image1Object && image1Object?.gender) {
          if (image1Object?.gender === "male") {
            genderPoint = -10;
          } else {
            if (image1Object?.gender === "female") {
              genderPoint = 0;
            } else {
              genderPoint = 10;
            }
          }
        } else {
          genderPoint = 10;
        }

        const userOptionData = await this.userOptionService.findOne({ user_id: updateData._id?.toString() });
        const oldPoint = userOptionData?.avatar_point;

        //console.log(parseFloat(oldPoint?.toString()) - parseFloat(genderPoint?.toString()), "point Plus");
        const pointToPlus =
          parseFloat(userOptionData?.circle_point?.toString()) -
          parseFloat(oldPoint?.toString()) +
          parseFloat(genderPoint?.toString());

        //Update Gender Point
        const dataUpdateAfter = {
          user_id: updateData._id?.toString(),
          avatar_point: genderPoint,
          avatar_gender: image1Object?.gender,
          circle_point: pointToPlus,
        };

        await this.userOptionService.update(dataUpdateAfter);

        const dataValidate = await this.faceDetectionService.findOne({
          user_id: userObject._id.toString(),
          validate_status: 1,
        });

        if (dataValidate) {
          const image2Object = await this.chatMediaService.findById(dataValidate.id_compare?.toString());
          if (image1Object && image2Object) {
            const dataIds = [];
            if (dataValidate.media_ids) {
              for (const mediaItem of dataValidate.media_ids) {
                dataIds.push(mediaItem.toString());
              }
            }
            try {
              await this.faceDetectionHelper.handleDetectFromServer(image1Object, image2Object, userObject, dataIds);
            } catch (error) {}
          }
        }
      }
      const user = await this.appUserService.updateCount({ _id: updateData?._id }, { user_version: 1 });
      if (user.display_name !== "" && user.user_phone !== "") {
        await this.channelPermissionService.updateCount(
          { user_id: user?._id?.toString(), channel_id: req?.channel_id.toString() },
          { point: 0, point_month: 0, point_week: 0 },
          req?.auth_code,
          {
            entity_id: new Types.ObjectId(),
            entity_type: "update_profile",
            content: user?.display_name,
            user_id: user?._id,
            point_number: 0,
          },
          "update_profile"
        );
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
  async updateTravelCity(req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      const dataToUpdate = {
        user_id: userId,
        travel_city: null,
      };
      await this.userOptionService.update(dataToUpdate);
      const dataUpdateMain = {
        _id: userId,
        travel_city: null,
      };
      const dataReturn = await this.appUserService.update(dataUpdateMain);
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
   */
  async processUserCron() {
    try {
      if (process.env.BRANCH_NAME === "live_video" || process.env.BRANCH_NAME === "chat_gpt") {
        const dataCountries = TimeZone.getAllCountries();

        const countriesMorning = [];
        const countriesNoon = [];
        const countriesAfternoon = [];
        const countriesEvening = [];

        const date = new Date();
        const utcHour = date.getUTCHours();

        for (const key of Object.keys(dataCountries)) {
          const val = dataCountries[key];
          const dataTimeZone = TimeZone.getTimezone(val.timezones[0]);
          const dataHour = dataTimeZone?.utcOffset / 60;

          if (utcHour + dataHour === 7) {
            countriesMorning.push(key);
          }
          if (utcHour + dataHour === 12) {
            countriesNoon.push(key);
          }
          if (utcHour + dataHour === 16) {
            countriesAfternoon.push(key);
          }
          if (utcHour + dataHour === 20) {
            countriesEvening.push(key);
          }
          // use val
        }
        const authCode =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjY2NDcxMjAsImRhdGEiOnsiX2lkIjoiNjRkODc2M2Y1NjUxMTAxOWJlZTEyM2U4Iiwia2V5IjoiNWNjN2YzZmQ1ODVkNzBmZmI3YmYxZTRmMGI1ZDE5OTAiLCJzaWduYXR1cmUiOiJlOTk2OTkyYzU3N2YyZjQwOWQyMGEwZDYyYTBhZGRlZiIsInNlc3Npb24iOiI2NTA5NTdkMGJhNzU4M2FkODIyNzJjMzcifSwiaWF0IjoxNjk1MTExMTIwfQ.mxk4ZiIi8yXo5ul6RCYCuyngimMy6syUQUHGwHNtQfg";

        for (const countryItem of countriesMorning) {
          this.handleSendMessageForTime(countryItem, countryItem + "_morning", authCode);
        }
        for (const countryItem of countriesAfternoon) {
          this.handleSendMessageForTime(countryItem, countryItem + "_afternoon", authCode);
        }
        for (const countryItem of countriesNoon) {
          this.handleSendMessageForTime(countryItem, countryItem + "_noon", authCode);
        }
        for (const countryItem of countriesEvening) {
          this.handleSendMessageForTime(countryItem, countryItem + "_evening", authCode);
        }
      }
    } catch (error) {
      console.log(error.message, "Error cron 283");
    }
  }

  /**
   *
   * @param countryItem
   * @param configName
   * @returns
   */
  async handleSendMessageForTime(countryItem: string, configName: string, authCode: string) {
    const configData = configName;
    const dataFind = {
      type: configData,
    };
    const dataConfig = await this.configService.findOne(dataFind);
    if (!dataConfig) {
      return null;
    }
    let userArray = null;
    if (process.env.BRANCH_NAME === "live_video") {
      userArray = await this.userOptionService.filterForCron({ country: countryItem, base_role: "man" }, 1, 10000);
    } else {
      userArray = await this.userOptionService.filterForCron({ country: countryItem }, 1, 10000);
    }

    let anonymousArray = null;
    if (process.env.BRANCH_NAME !== "live_video") {
      const dataContent = dataConfig?.data_content;
      if (dataContent) {
        anonymousArray = await this.userAnonymousService.filter({ user_type: dataContent?.toString() }, {}, 1, 10000);
      }
    }

    if (anonymousArray && anonymousArray?.length) {
      for (const userArrayItem of anonymousArray) {
        if (dataConfig && dataConfig?.data_filter && dataConfig?.data_filter?.length) {
          const arrayMessage = dataConfig?.data_filter;
          const notificationTitle = "Hey " + userArrayItem?.display_name + "!";
          let notificationDescription = _.sample(arrayMessage);
          notificationDescription = notificationDescription.replace("{{display_name}}", userArrayItem?.display_name);
          await this.sendNotificationToUser(
            userArrayItem?._id?.toString(),
            userArrayItem,
            notificationTitle,
            notificationDescription,
            "anonymous",
            authCode
          );
        }
      }
    }
    if (userArray && userArray.length) {
      for (const userArrayItem of userArray) {
        if (dataConfig && dataConfig?.data_filter && dataConfig?.data_filter?.length) {
          const arrayMessage = dataConfig?.data_filter;
          const notificationTitle = "Hey " + userArrayItem?.display_name + "!";
          let notificationDescription = _.sample(arrayMessage);
          notificationDescription = notificationDescription.replace("{{display_name}}", userArrayItem?.display_name);
          await this.sendNotificationToUser(
            userArrayItem?._id?.toString(),
            userArrayItem,
            notificationTitle,
            notificationDescription,
            "user",
            authCode
          );
        }
      }
    }
    return true;
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
      const authCode = req?.auth_code;
      const currentTime = new Date();

      let dataToUpdate = {
        _id: userObject._id.toString(),
        user_active: Number(updateData.user_active),
        last_active: currentTime.toUTCString(),
      };
      //Update System Message
      if (
        (!userObject.system_message || Number(userObject.system_message) === 0) &&
        process.env.BRANCH_NAME === "whiteg"
      ) {
        dataToUpdate = {
          ...dataToUpdate,
          ...{
            system_message: 1,
          },
        };
        //Check country && core
        const dataKey = userObject.country + "_message";
        const dataFindConfig = {
          type: dataKey,
        };
        const dataReturnConfig: any = await this.configService.findOne(dataFindConfig);
        // let isMatch = true;
        // if (dataReturnConfig) {
        //   if (dataReturnConfig.data_filter) {
        //     for (let indexItem in dataReturnConfig.data_filter) {
        //       if (Number(indexItem) === 0) {

        //       }
        //     }
        //   }
        // }
        if (dataReturnConfig) {
          const dataMessage = dataReturnConfig.data_content;
          //Send Message
          this.sendMessage(userObject, req, res, dataMessage);
        }
      }

      //Send message to CallU user
      if (process.env.BRANCH_NAME === "live_video") {
        const userObjectDetail: any = await this.appUserService.findOneLogin({ _id: userObject?._id?.toString() });
        if (userObjectDetail?.base_role === "women") {
          //Get user
          const dataLoc = userObjectDetail?.loc?.coordinates;
          const dataToFilterCallU = {
            latitude: parseFloat(dataLoc[1]?.toString()),
            longitude: parseFloat(dataLoc[0]?.toString()),
            distance: 1000,
            is_match: "1",
            base_role: "man",
          };
          const orderByOBject = {};
          const page = 1;
          const limit = 20;
          console.log(dataToFilterCallU, "dataToFilterCallU");
          const dataReturn = await this.userOptionService.filterFree(dataToFilterCallU, orderByOBject, page, limit);
          for (const userItem of dataReturn) {
            const notificationTitle = userObjectDetail?.display_name;
            const notificationDescription = userObjectDetail?.display_name + " online now! Let send message to her!";
            await this.sendNotificationToUser(
              userItem?._id?.toString(),
              userObjectDetail,
              notificationTitle,
              notificationDescription,
              "user",
              authCode
            );
          }
        }
      }
      const dataBaseUser = await this.appUserService.update(dataToUpdate);
      dataToUpdate = { ...dataToUpdate, ...{ user_id: userObject._id.toString() } };
      delete dataToUpdate._id;

      //Update time_point, circle_point
      const userOptionData = await this.userOptionService.findOne({ user_id: dataToUpdate._id?.toString() });
      const oldPoint = userOptionData?.time_point ? userOptionData?.time_point : 0;

      //console.log(parseFloat(oldPoint?.toString()) - parseFloat(genderPoint?.toString()), "point Plus");
      const pointToPlus =
        parseFloat(userOptionData?.circle_point ? userOptionData.time_point?.toString() : "0") -
        parseFloat(oldPoint?.toString());

      dataToUpdate = {
        ...dataToUpdate,
        ...{
          circle_point: pointToPlus,
          time_point: 0,
        },
      };
      if (Number(updateData.user_active) === 0) {
        dataToUpdate = {
          ...dataToUpdate,
          ...{
            ready_status: 0,
          },
        };
      }

      const dataReturn = await this.userOptionService.update(dataToUpdate);
      //Handle Send Message
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @function processUserUpdate
   */
  async processUserUpdateMapCount(req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const dataUpdate = {
        map_count: 1,
      };
      const dataFilter = {
        _id: userObject._id.toString(),
      };
      const dataReturn = await this.appUserService.updateCount(dataFilter, dataUpdate);
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
          router: "NAVIGATION_CHAT_ROOM",
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
  async processUpdateUserOption(updateData: UpdateUserOptionDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let isAdmin = false;
      if (updateData.user_id.toString() !== userObject._id.toString()) {
        const userPermissionObject = await this.userPermissionService.isHavePermission(
          userObject._id.toString(),
          "user/update"
        );
        if (!userPermissionObject) {
          //Check Admin
          throw new BadRequestException("You haven't permission for this Action!");
        } else {
          isAdmin = true;
        }
      }
      if (
        updateData &&
        Object.keys(updateData).length === 0 &&
        Object.getPrototypeOf(updateData) === Object.prototype
      ) {
        throw new NotFoundException("Empty update Data!");
      }
      let whereToMeet = [];
      if (updateData.where_to_meet) {
        whereToMeet = JSON.parse(updateData.where_to_meet);
      }
      let lookingFor = [];
      if (updateData.locking_for) {
        lookingFor = JSON.parse(updateData.locking_for);
      }
      let publicInstagram = [];
      if (updateData.public_instagram) {
        publicInstagram = JSON.parse(updateData.public_instagram.toString());
      }

      let userQuestion = null;
      if (updateData.user_question) {
        userQuestion = JSON.parse(updateData.user_question.toString());
      }

      let userMood = null;
      if (updateData.user_mood) {
        userMood = JSON.parse(updateData.user_mood.toString());
        userMood = { ...userMood, ...{ updateAt: new Date() } };
        const dataUserMood = await this.userMoodService.findOne({ user_id: updateData.user_id.toString() });
        if (!dataUserMood || dataUserMood.text.toString() !== userMood?.text) {
          //Create new User Mood
          const dataCreateUserMood = {
            user_id: updateData.user_id.toString(),
            text: userMood?.text,
            image: userMood?.image,
          };
          await this.userMoodService.create(dataCreateUserMood);
        }
      }

      let socialLink = [];
      if (updateData.social_link) {
        socialLink = JSON.parse(updateData.social_link);
      }

      let mediaLink = [];
      if (updateData.media_link) {
        mediaLink = JSON.parse(updateData.media_link);
      }

      let publicAlbum = [];
      if (updateData.public_album) {
        const newPublicAlbum = JSON.parse(updateData.public_album);
        const dataPublicNew = [];
        if (newPublicAlbum && newPublicAlbum?.length) {
          for (const itemAlbum of newPublicAlbum) {
            if (itemAlbum) {
              dataPublicNew.push(itemAlbum);
            }
          }
          publicAlbum = dataPublicNew;
        }
      }

      let userInterest = [];
      if (updateData.user_interest) {
        try {
          userInterest = JSON.parse(updateData.user_interest);
          await this.userInterestService.updatePriority(userInterest);
        } catch (error) {}
      }

      let privateAlbum = [];
      if (updateData.private_album) {
        privateAlbum = JSON.parse(updateData.private_album);
      }

      let safetyPractices = [];

      if (updateData.safety_practices) {
        safetyPractices = JSON.parse(updateData.safety_practices);
      }

      let language = [];
      if (updateData.language) {
        language = JSON.parse(updateData.language);
      }

      if (updateData && updateData.sexual_content) {
        if (!isAdmin && process.env.BRANCH_NAME !== "revu") {
          delete updateData.sexual_content;
        }
      }

      if (updateData && updateData.user_spotlight) {
        if (!isAdmin && process.env.BRANCH_NAME !== "revu") {
          delete updateData.user_spotlight;
        }
      }

      let dataUpdate: any = updateData;

      if (updateData.user_birthday) {
        let userBirthdayYear = 0;
        const birthdayObject = new Date(updateData.user_birthday.toString());
        if (birthdayObject) {
          userBirthdayYear = birthdayObject.getFullYear();
        }
        dataUpdate = {
          ...dataUpdate,
          ...{
            user_birthday_year: userBirthdayYear,
          },
        };
      }

      if (userQuestion && userQuestion?.length) {
        dataUpdate = {
          ...dataUpdate,
          ...{
            user_question: userQuestion,
          },
        };
      } else {
        //delete dataUpdate.user_question;
        if (updateData.user_question) {
          dataUpdate = {
            ...dataUpdate,
            ...{
              user_question: [],
            },
          };
        } else {
          delete dataUpdate.user_question;
        }
      }
      if (userMood && userMood?.text) {
        dataUpdate = {
          ...dataUpdate,
          ...{
            user_mood: userMood,
          },
        };
      } else {
        //delete dataUpdate.user_mood;
        if (updateData.user_mood) {
          dataUpdate = {
            ...dataUpdate,
            ...{
              user_mood: [],
            },
          };
        } else {
          delete dataUpdate.user_mood;
        }
      }

      if (privateAlbum && privateAlbum?.length) {
        dataUpdate = {
          ...dataUpdate,
          ...{
            private_album: privateAlbum,
          },
        };
      } else {
        //delete dataUpdate.private_album;
        if (updateData.private_album) {
          dataUpdate = {
            ...dataUpdate,
            ...{
              private_album: [],
            },
          };
        } else {
          delete dataUpdate.private_album;
        }
      }

      if (userInterest && userInterest?.length) {
        dataUpdate = {
          ...dataUpdate,
          ...{
            user_interest: userInterest,
          },
        };
      } else {
        //delete dataUpdate.user_interest;
        if (updateData.user_interest) {
          dataUpdate = {
            ...dataUpdate,
            ...{
              user_interest: [],
            },
          };
        } else {
          delete dataUpdate.user_interest;
        }
      }

      if (language && language?.length) {
        dataUpdate = {
          ...dataUpdate,
          ...{
            language: language,
          },
        };
      } else {
        //delete dataUpdate.language;
        if (updateData.language) {
          dataUpdate = {
            ...dataUpdate,
            ...{
              language: [],
            },
          };
        } else {
          delete dataUpdate.language;
        }
      }

      if (safetyPractices && safetyPractices?.length) {
        dataUpdate = {
          ...dataUpdate,
          ...{
            safety_practices: safetyPractices,
          },
        };
      } else {
        //delete dataUpdate.safety_practices;
        if (updateData.safety_practices) {
          dataUpdate = {
            ...dataUpdate,
            ...{
              safety_practices: [],
            },
          };
        } else {
          delete dataUpdate.safety_practices;
        }
      }

      if (socialLink && socialLink?.length) {
        dataUpdate = {
          ...dataUpdate,
          ...{
            social_link: socialLink,
          },
        };
      } else {
        //delete dataUpdate.social_link;
        if (updateData.social_link) {
          dataUpdate = {
            ...dataUpdate,
            ...{
              social_link: [],
            },
          };
        } else {
          delete dataUpdate.social_link;
        }
      }

      if (mediaLink && mediaLink?.length) {
        dataUpdate = {
          ...dataUpdate,
          ...{
            media_link: mediaLink,
          },
        };
      } else {
        //delete dataUpdate.social_link;
        if (updateData.media_link) {
          dataUpdate = {
            ...dataUpdate,
            ...{
              media_link: [],
            },
          };
        } else {
          delete dataUpdate.media_link;
        }
      }

      if (lookingFor && lookingFor?.length) {
        dataUpdate = {
          ...dataUpdate,
          ...{
            locking_for: lookingFor,
          },
        };
      } else {
        //delete dataUpdate.locking_for;
        if (updateData.locking_for) {
          dataUpdate = {
            ...dataUpdate,
            ...{
              locking_for: [],
            },
          };
        } else {
          delete dataUpdate.locking_for;
        }
      }

      if (publicAlbum && publicAlbum?.length) {
        dataUpdate = {
          ...dataUpdate,
          ...{
            public_album: publicAlbum,
          },
        };
      } else {
        if (updateData.public_album) {
          dataUpdate = {
            ...dataUpdate,
            ...{
              public_album: [],
            },
          };
        } else {
          delete dataUpdate.public_album;
        }
      }

      if (whereToMeet && whereToMeet?.length) {
        dataUpdate = {
          ...dataUpdate,
          ...{
            where_to_meet: whereToMeet,
          },
        };
      } else {
        //delete dataUpdate.where_to_meet;
        if (updateData.where_to_meet) {
          dataUpdate = {
            ...dataUpdate,
            ...{
              where_to_meet: [],
            },
          };
        } else {
          delete dataUpdate.where_to_meet;
        }
      }
      if (publicInstagram && publicInstagram.length) {
        dataUpdate = {
          ...dataUpdate,
          ...{
            public_instagram: publicInstagram,
          },
        };
      } else {
        //delete dataUpdate.public_instagram;
        if (updateData.public_instagram) {
          dataUpdate = {
            ...dataUpdate,
            ...{
              public_instagram: [],
            },
          };
        } else {
          delete dataUpdate.public_instagram;
        }
      }

      const dataReturn = await this.userOptionService.update(dataUpdate);
      await this.appUserService.updateCount({ _id: dataUpdate?._id }, { user_version: 1 });
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
   * @function processUserUpdate
   */
  async processDeleteUser(id: string, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      if (id.toString() !== userObject._id.toString()) {
        const userPermissionObject = await this.userPermissionService.isHavePermission(
          userObject._id.toString(),
          "user/delete"
        );
        if (!userPermissionObject) {
          //Check Admin
          throw new BadRequestException("You haven't permission for this Action!");
        }
      }

      const dataUpdate = {
        _id: id,
        user_status: "0",
      };
      const dataReturn = await this.appUserService.update(dataUpdate);
      const dataOptionUpdate = {
        user_id: id,
        user_status: 0,
      };
      await this.userOptionService.update(dataOptionUpdate);
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
      const dataUpdateCount = {
        circle_point: -2,
        like_point: -2,
      };
      await this.userOptionService.handleUpdateInc({ user_id: dataFollow.partner_id.toString() }, dataUpdateCount);
      //Query 03
      await this.userDisagreeService.removeOne(dataUpdate);
      let dataReturn = await this.userFollowService.update(dataUpdate);
      if (dataReturn.match_status) {
        //Query 04
        const chatRoomObject = await this.chatRoomHelper.handleCreateRoom(
          userObject,
          dataFollow.partner_id,
          "personal"
        );
        //Create Room
        dataReturn = { ...dataReturn, ...{ create_room: chatRoomObject } };
      } else {
        dataReturn = { ...dataReturn, ...{ create_room: null } };
      }

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

        const dataUpdateCount = {
          circle_point: 1,
          like_point: 1,
        };
        await this.userOptionService.handleUpdateInc({ user_id: dataFollow.partner_id.toString() }, dataUpdateCount);

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

      const dataToUpdate = {
        _id: userObject._id.toString(),
        disagree_users: dataFollowUpdate,
        follow_users: dataFollowToCompare,
      };
      //Update Follow User
      await this.appUserService.update(dataToUpdate);
      const dataUpdateCount = {
        circle_point: 1,
        like_point: 1,
      };
      await this.userOptionService.handleUpdateInc({ user_id: dataFollow.partner_id.toString() }, dataUpdateCount);
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
        const dataUpdateCount = {
          circle_point: -2,
          like_point: -2,
        };
        await this.userOptionService.handleUpdateInc({ user_id: dataFollow.partner_id.toString() }, dataUpdateCount);
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

  /**
   *
   * @param userId
   * @param cityName
   * @param countryName
   */
  async sendMessage(partnerObject: User, req: ExpressRequestDto, res: Response, dataMessage: string) {
    setTimeout(async () => {
      const supportAccount = await this.appUserService.findOne({ _id: process.env.INFO_USER });
      //Create new
      const dataCreateReturnRoom = await this.chatRoomHelper.handleCreateRoom(
        supportAccount,
        partnerObject._id.toString(),
        "personal",
        "",
        true
      );

      if (!dataCreateReturnRoom) {
        console.log("Not found");
      } else {
        // let updatedAt = new Date(dataCreateReturnRoom?.updatedAt).getTime();
        // let currentTime = new Date().getTime();

        //console.log(currentTime - updatedAt);
        // let leftTime = currentTime - updatedAt;
        // if (leftTime < 2592000000 && Number(dataCreateReturnRoom?.chat_history_count) > 0) {
        //   console.log("Not return");
        //   return null;
        // }

        const chatContent = dataMessage;
        const tokenReturn = this.jwtHelper.generateJwt(
          process.env.INFO_USER,
          supportAccount?.user_email?.toString(),
          process.env.INFO_SESSION,
          true
        );
        const createChatHistoryDto = {
          chat_room_id: dataCreateReturnRoom?.chat_room_id?._id?.toString(),
          chat_content: chatContent,
        };

        req.user_id = supportAccount?._id.toString();
        req.user_object = supportAccount;
        req.session_id = process.env.INFO_SESSION;
        req.auth_code = tokenReturn.toString();

        const dataReturnHistory: any = await this.chatHistoryHelper.createNewHistory(
          req,
          res,
          createChatHistoryDto,
          false,
          true
        );
      }
    }, 2000);

    return true;
  }

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
        const dataReturn = await this.userBlockService.remove(dataToCheck._id.toString());

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
        router: "NAVIGATION_MESSAGE_SCREEN",
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
        router: "NAVIGATION_LIKED_SCREEN",
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
      if (await this.userPermissionService.isHavePermission(userId, "user/create")) {
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
      if (await this.userPermissionService.isHavePermission(userId, "user/create")) {
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
      if (await this.userPermissionService.isHavePermission(userId, "user/create")) {
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
      const dataUpdateUserOption = {
        user_id: userId,
        last_user_location: dataCreate?._id?.toString(),
      };
      const dataUpdateUser = {
        _id: userId,
        last_user_location: dataCreate?._id?.toString(),
      };
      await this.userOptionService.update(dataUpdateUserOption);
      await this.appUserService.update(dataUpdateUser);
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
        const config = {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Authorization": auth,
          },
        };
        const urlLogin = process.env.SOCKET_API;
        const dataNotification = await axios
          .post(urlLogin + "/change-location", params, config)
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
      if (await this.userPermissionService.isHavePermission(userId, "user/update")) {
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
  async removeUserInterest(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "plan/delete")) {
        //Check Permission
        const dataReturn = await this.userInterestService.remove(id);
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
  async removeUserQuestion(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "user/delete")) {
        //Check Permission
        const dataReturn = await this.userQuestionService.remove(id);
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
