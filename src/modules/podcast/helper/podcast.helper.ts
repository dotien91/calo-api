import { Response, Request, response } from "express";
import { ForbiddenException, HttpStatus, NotFoundException, Injectable, BadRequestException } from "@nestjs/common";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreatePodcastDto } from "../dto/create-podcast.dto";
import { PodcastService } from "../services/podcast.service";
import { ListPodcastDto } from "../dto/list-podcast.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UpdatePodcastDto } from "../dto/update-podcast.dto";
import { Types } from "mongoose";
import { PodcastCategoryService } from "../services/podcast_category.service";
import { CreatePodcastCategoryDto } from "../dto/create-podcast_category.dto";
import { ListPodcastCategoryDto } from "../dto/list-podcast_category.dto";
import { UpdatePodcastCategoryDto } from "../dto/update-podcast_category.dto";
import { JwtService } from "@nestjs/jwt";
import { DecodeUserToken } from "../../../dto/decode-user-token.dto";
import { UserService } from "../../../modules/user/services/user.service";
import { UserAnonymousSessionService } from "../../../modules/user/services/user_anonymous_session.service";
import { UserAnonymousService } from "../../../modules/user/services/user_anonymous.service";
import { NotificationHelper } from "../../../modules/notification/helper/notification.helper";
import { User } from "../../../modules/user/schemas/user.schema";
import { Podcast as PodcastNew } from "../schemas/podcast.schema";
import { UserOptionService } from "../../../modules/user/services/user_option.service";
import { ChannelPermissionService } from "../../../modules/channel/services/channel_permission.service";
const { getFirestore } = require("firebase-admin/firestore");
let dataCrawl = `Other`;

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class PodcastHelper {
  constructor(
    private podcastService: PodcastService,
    private podcastCategoryService: PodcastCategoryService,
    private userPermissionService: UserPermissionService,
    private userAnonymousSession: UserAnonymousSessionService,
    private userAnonymousService: UserAnonymousService,
    private userService: UserService,
    private userOptionService: UserOptionService,
    private notificationHelper: NotificationHelper,
    private channelPermissionService: ChannelPermissionService
  ) {}

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

  async handleCategory() {
    let dataCategory = await this.podcastCategoryService.filter({}, {}, 1, 100);
    for (let dataCategoryItem of dataCategory) {
      let dataToUpdate = {
        version: 82,
        _id: dataCategoryItem?._id?.toString(),
      };
      let dataUpdate = await this.podcastCategoryService.update(dataToUpdate);
    }
  }

  async processCategory() {
    try {
      let dataCrawlArray = dataCrawl.split("\n");
      for (let itemData of dataCrawlArray) {
        let dataToCreate = {
          user_id: "642a49eb18acaeada350130e",
          category_language: "en",
          category_content: itemData,
          category_excerpt: "",
          category_parent: "",
          category_slug: this.toSlug(itemData),
          category_status: "",
          category_avatar: null,
          category_title: itemData,
          category_type: "",
          category_view: 0,
        };
        await this.podcastCategoryService.create(dataToCreate);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async updatePodcast() {
    try {
      let dataPodcast = await this.podcastService.filter({}, {}, 1, 1000);
      for (let dataPodcastItem of dataPodcast) {
        // console.log(dataPodcastItem);
        let userObject = await this.userService.findById(dataPodcastItem?.user_id?._id?.toString(), {});
        let dataToUpdate = {
          _id: dataPodcastItem?._id?.toString(),
          country: userObject?.country,
        };
        await this.podcastService.update(dataToUpdate);
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
  async getListPodcast(query: ListPodcastDto, res: Response, req: ExpressRequestDto) {
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

      let dataReturn = await this.podcastService.filter(dataToFilter, orderByOBject, page, limit);

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

      let dataCount = await this.podcastService.count(dataToFilter);
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
  async createNewPodcast(createPodcastData: CreatePodcastDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject?._id?.toString();
      let channelId = req?.channel_id || "";
      let userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("podcast/delete") !== -1)
      ) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "podcast/delete")) {
        havePermission = true;
      }
      if (!havePermission) {
        throw new ForbiddenException("You not have permission for this activity!");
      }

      let dataSlug = this.toSlug(createPodcastData.title);
      createPodcastData = {
        ...createPodcastData,
        ...{ podcast_slug: dataSlug, user_id: userObject._id.toString(), channel_id: channelId },
      };

      let userCountry = userObject?.country;
      createPodcastData = { ...createPodcastData, ...{ country: userCountry } };

      if (this.validateJson(createPodcastData?.attach_files)) {
        createPodcastData = {
          ...createPodcastData,
          ...{
            attach_files: JSON.parse(createPodcastData?.attach_files),
          },
        };
      } else {
        createPodcastData = {
          ...createPodcastData,
          ...{
            attach_files: [],
          },
        };
      }

      let dataCreate: any = await this.podcastService.create(createPodcastData);
      let dataReturn = await this.podcastService.findById(dataCreate?._id?.toString());

      //Update Notification
      let dataUpdateNotification = {
        _id: userObject?._id?.toString(),
        notification_podcast: dataCreate?._id?.toString(),
      };
      await this.userService.updateArray(dataUpdateNotification, false);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      console.log(error, "error");
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param fromUser
   * @param dataPodcast
   * @returns
   */
  async handleSendNotificationToAll(
    fromUser: User,
    dataPodcast: PodcastNew,
    authCode: string = "",
    channelObject: any = {},
    req: ExpressRequestDto
  ) {
    try {
      let notificationTitle = fromUser.display_name ? fromUser.display_name : fromUser.user_login;
      let chatContentToSend = `${notificationTitle} đã đăng: ${dataPodcast.title}`;
      if (chatContentToSend && chatContentToSend.length >= 255) {
        chatContentToSend = chatContentToSend.substring(0, 250) + "...";
      }
      notificationTitle = notificationTitle + ` đăng bài mới!`;

      if (notificationTitle && notificationTitle.length >= 70) {
        notificationTitle = notificationTitle.substring(0, 68) + "...";
      }
      let userIdArray = [];
      let channelId = dataPodcast?.channel_id?.toString();
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
          post_name: dataPodcast.title,
          //@ts-ignore
          post_image: dataPodcast?.attach_files[0]?.media_url || "",
          email: emailItem,
          fullname: fromUser.display_name,
          user_id: fromUser?._id?.toString(),
          post_url: (channelObject?.domain || "https://gamifa.vn") + "/v/post/" + dataPodcast?.podcast_slug,
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
          podcast_id: dataPodcast?._id?.toString(),
          path: "/v/post/",
          data_id: dataPodcast?.podcast_slug?.toString(),
        };
        let notificationContent = chatContentToSend;
        let dataNotification = {
          createdBy: fromUser._id.toString(),
          user_id: userIdArray,
          channel_id: req?.channel_id,
          title: notificationTitle?.toString(),
          content: notificationContent,
          param: JSON.stringify(dataToSendNotification),
          podcast_id: dataPodcast?._id?.toString(),
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
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createCategory(createPodcastData: CreatePodcastCategoryDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let dataSlug = this.toSlug(createPodcastData.category_title);
      createPodcastData = { ...createPodcastData, ...{ category_slug: dataSlug, user_id: userObject._id.toString() } };

      let dataCreate = await this.podcastCategoryService.create(createPodcastData);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataCreate);
    } catch (error) {
      throw new NotFoundException(error.message);
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
  async handleGetDetailPodcast(id: string, query: ListPodcastDto, res: Response, req: ExpressRequestDto) {
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
        dataToFilter = { ...dataToFilter, ...{ podcast_slug: id.toString() } };
      }

      let dataReturn: any = await this.podcastService.findOne(dataToFilter);
      dataReturn = { ...dataReturn?.toObject() };

      let dataNotification = [];

      if (query?.auth_id) {
        let dataAuth = await this.userService.findById(query?.auth_id, {});
        //@ts-ignore
        if (dataAuth && dataAuth?.notification_podcast) {
          //@ts-ignore
          for (let dataItemNotification of dataAuth?.notification_podcast) {
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
  async handleGetDetailCategory(id: string, res: Response, req: ExpressRequestDto) {
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
        dataToFilter = { ...dataToFilter, ...{ category_slug: id.toString() } };
      }
      let dataReturn = await this.podcastCategoryService.findOne(dataToFilter);
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
  async handleUpdatePodcastByAdmin(dataUpdate: UpdatePodcastDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let podcastObject = await this.podcastService.findById(dataUpdate?._id?.toString());

      let userId = userObject?._id?.toString();
      let channelId = podcastObject?.channel_id || "";
      let userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("podcast/delete") !== -1)
      ) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "podcast/delete")) {
        havePermission = true;
      }
      if (!havePermission) {
        throw new ForbiddenException("You not have permission for this activity!");
      }

      if (dataUpdate.public_album) {
        dataUpdate = { ...dataUpdate, ...{ public_album: JSON.parse(dataUpdate.public_album) } };
      }
      if (dataUpdate.attach_files) {
        dataUpdate = { ...dataUpdate, ...{ attach_files: JSON.parse(dataUpdate.attach_files) } };
      }

      let dataReturn = await this.podcastService.update(dataUpdate);
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
  async handleUpdateCategory(dataUpdate: UpdatePodcastCategoryDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let dataReturn = await this.podcastCategoryService.update(dataUpdate);
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
  async handleDeletePodcast(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }

      let userId = userObject._id.toString();
      let podcastObject = await this.podcastService.findById(id);
      let channelId = podcastObject.channel_id;
      let userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });

      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("podcast/delete") !== -1)
      ) {
        havePermission = true;
      }
      if (podcastObject?.user_id?._id?.toString() == userId) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "podcast/delete")) {
        havePermission = true;
      }

      if (havePermission) {
        //Check Permission
        let dataReturn = await this.podcastService.remove(id);
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
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getPodcastCategoryList(query: ListPodcastCategoryDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000 || !query.limit) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let orderByOBject = {};

      let dataToFilter = { ...query };

      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      let dataReturn = await this.podcastCategoryService.filter(dataToFilter, orderByOBject, page, limit);
      let dataCount = await this.podcastCategoryService.count(dataToFilter);
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
  async handleDeleteCategory(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "podcast/delete")) {
        //Check Permission
        let dataReturn = await this.podcastCategoryService.remove(id);
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
