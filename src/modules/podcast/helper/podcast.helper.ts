import { BadRequestException, ForbiddenException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { Types } from "mongoose";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { NotificationHelper } from "../../../modules/notification/helper/notification.helper";
import { UserService } from "../../../modules/user/services/user.service";
import { UserAnonymousService } from "../../../modules/user/services/user_anonymous.service";
import { UserAnonymousSessionService } from "../../../modules/user/services/user_anonymous_session.service";
import { CreatePodcastDto } from "../dto/create-podcast.dto";
import { CreatePodcastCategoryDto } from "../dto/create-podcast_category.dto";
import { ListPodcastDto } from "../dto/list-podcast.dto";
import { ListPodcastCategoryDto } from "../dto/list-podcast_category.dto";
import { UpdatePodcastDto } from "../dto/update-podcast.dto";
import { UpdatePodcastCategoryDto } from "../dto/update-podcast_category.dto";
import { PodcastService } from "../services/podcast.service";
import { PodcastCategoryService } from "../services/podcast_category.service";
const dataCrawl = `Other`;

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class PodcastHelper {
  constructor(
    private podcastService: PodcastService,
    private podcastCategoryService: PodcastCategoryService,
    private userAnonymousSession: UserAnonymousSessionService,
    private userAnonymousService: UserAnonymousService,
    private userService: UserService,
    private notificationHelper: NotificationHelper
  ) {}

  async handleUpdateUser(userId: string) {
    const dataCreate = {
      user_id: userId,
    };
    const dataUser = await this.userService.create(dataCreate);
    if (dataUser) {
      const dataUpdate = {
        _id: userId,
        user_option_id: dataUser._id.toString(),
      };
      await this.userService.update(dataUpdate);
      return dataUser;
    } else {
      return null;
    }
  }

  async handleCategory() {
    const dataCategory = await this.podcastCategoryService.filter({}, {}, 1, 100);
    for (const dataCategoryItem of dataCategory) {
      const dataToUpdate = {
        version: 82,
        _id: dataCategoryItem?._id?.toString(),
      };
      const dataUpdate = await this.podcastCategoryService.update(dataToUpdate);
    }
  }

  async processCategory() {
    try {
      const dataCrawlArray = dataCrawl.split("\n");
      for (const itemData of dataCrawlArray) {
        const dataToCreate = {
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
      const dataPodcast = await this.podcastService.filter({}, {}, 1, 1000);
      for (const dataPodcastItem of dataPodcast) {
        // console.log(dataPodcastItem);
        const userObject = await this.userService.findById(dataPodcastItem?.user_id?._id?.toString(), {});
        const dataToUpdate = {
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

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;

      let orderByOBject = {};

      if (query.order_by && (query.order_type == "time" || !query?.order_type)) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }

      const dataToFilter = { ...query };

      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      const dataReturn = await this.podcastService.filter(dataToFilter, orderByOBject, page, limit);

      const dataCount = await this.podcastService.count(dataToFilter);
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
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewPodcast(createPodcastData: CreatePodcastDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const dataSlug = this.toSlug(createPodcastData.title);
      createPodcastData = {
        ...createPodcastData,
        ...{ podcast_slug: dataSlug, user_id: userObject._id.toString() },
      };

      const userCountry = userObject?.country;
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

      const dataCreate: any = await this.podcastService.create(createPodcastData);
      const dataReturn = await this.podcastService.findById(dataCreate?._id?.toString());

      //Update Notification
      const dataUpdateNotification = {
        _id: userObject?._id?.toString(),
        notification_podcast: dataCreate?._id?.toString(),
      };
      await this.userService.updateArray(dataUpdateNotification, false);

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
  async createCategory(createPodcastData: CreatePodcastCategoryDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const dataSlug = this.toSlug(createPodcastData.category_title);
      createPodcastData = { ...createPodcastData, ...{ category_slug: dataSlug, user_id: userObject._id.toString() } };

      const dataCreate = await this.podcastCategoryService.create(createPodcastData);
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
      const dataJson = JSON.parse(str);
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
  async handleGetDetailPodcast(id: string, res: Response, req: ExpressRequestDto) {
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

      let dataToFilter = {};
      if (objectId) {
        dataToFilter = { ...dataToFilter, ...{ _id: objectId } };
      } else {
        dataToFilter = { ...dataToFilter, ...{ podcast_slug: id.toString() } };
      }

      let dataReturn: any = await this.podcastService.findOne(dataToFilter);
      dataReturn = { ...dataReturn?.toObject() };

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
      const dataReturn = await this.podcastCategoryService.findOne(dataToFilter);
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
      if (dataUpdate.public_album) {
        dataUpdate = { ...dataUpdate, ...{ public_album: JSON.parse(dataUpdate.public_album) } };
      }
      if (dataUpdate.attach_files) {
        dataUpdate = { ...dataUpdate, ...{ attach_files: JSON.parse(dataUpdate.attach_files) } };
      }

      const dataReturn = await this.podcastService.update(dataUpdate);
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
      const dataReturn = await this.podcastCategoryService.update(dataUpdate);
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
      const dataReturn = await this.podcastService.remove(id);
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
  async getPodcastCategoryList(query: ListPodcastCategoryDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000 || !query.limit) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      const orderByOBject = {};

      const dataToFilter = { ...query };

      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const dataReturn = await this.podcastCategoryService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.podcastCategoryService.count(dataToFilter);
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
      const dataReturn = await this.podcastCategoryService.remove(id);
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
