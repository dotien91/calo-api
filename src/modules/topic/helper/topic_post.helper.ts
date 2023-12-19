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
import { CreateTopicPostDto } from "../dto/create-topic_post.dto";
import { TopicPostService } from "../services/topic_post.service";
import { ListTopicPostDto } from "../dto/list-topic_post.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UpdateTopicPostDto } from "../dto/update-topic_post.dto";
import { Types } from "mongoose";
import { TopicService } from "../services/topic.service";

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class TopicPostHelper {
  constructor(
    private topicService: TopicService,
    private topicPostService: TopicPostService,
    private userPermissionService: UserPermissionService
  ) {}

  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewPost(createPostData: CreateTopicPostDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const userId = userObject._id.toString();
      //if (await this.userPermissionService.isHavePermission(userId, "order/list")) {
      const topicId = await this.topicService.findById(createPostData.topic_id);
      if (topicId) {
        const dataSlug = this.toSlug(createPostData.post_title);
        createPostData = {
          ...createPostData,
          ...{
            post_slug: dataSlug,
            user_id: userObject._id.toString(),
            chat_room_id: topicId.chat_room_id,
          },
        };

        const dataCreate = await this.topicPostService.create(createPostData);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataCreate);
      } else {
        throw new BadRequestException("Topic not found!");
      }
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
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getPostListByAdmin(query: ListTopicPostDto, res: Response, req: ExpressRequestDto) {
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
      let dataToFilter = { ...query };

      if (query?.is_homepage) {
        const dataTopic = userObject?.join_topics;
        if (dataTopic && dataTopic?.length) {
          dataToFilter = { ...dataToFilter, ...{ topic_ids: dataTopic } };
        }
      }

      if (query.topic_id) {
        const topicObject = await this.topicService.findOne({ _id: query.topic_id });
        if (!topicObject) {
          throw new NotFoundException("Not find Topic ID");
        }
        if (!topicObject?.parent_id) {
          //Get all Child Topic
          const dataFilter = {
            parent_id: query.topic_id,
          };
          const childTopicArray = await this.topicService.filter(dataFilter, {}, 1, 10000);
          const topicIds = [];
          for (const topicItem of childTopicArray) {
            topicIds.push(topicItem?._id?.toString());
          }
          dataToFilter = { ...dataToFilter, ...{ topic_ids: topicIds } };
        }
      }

      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const dataReturn = await this.topicPostService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.topicPostService.count(dataToFilter);
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
  async getPostListByUser(query: ListTopicPostDto, res: Response, req: ExpressRequestDto) {
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
      const dataToFilter = { ...query, ...{ user_id: userId } };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const dataReturn = await this.topicPostService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.topicPostService.count(dataToFilter);
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
  async handleGetDetailPost(id: string, res: Response, req: ExpressRequestDto) {
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
      const dataReturn = await this.topicPostService.findOne(dataToFilter);
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
  async handleUpdatePostByAdmin(dataUpdate: UpdateTopicPostDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      if (dataUpdate.post_slug) {
        const dataToFind = await this.topicPostService.findOne({ post_slug: dataUpdate.post_slug });
        if (dataToFind && dataToFind._id.toString() !== dataUpdate._id.toString()) {
          throw new ForbiddenException("Slug is exist!");
        }
      }
      const userId = userObject._id.toString();
      //Check Permission
      if (await this.userPermissionService.isHavePermission(userId, "post/update")) {
        const dataReturn = await this.topicPostService.update(dataUpdate);
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
  async handleDeletePost(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "post/delete")) {
        //Check Permission
        const dataReturn = await this.topicPostService.remove(id);
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
    const date = new Date().getTime();
    return str + "-" + date;
  }
}
