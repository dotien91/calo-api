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
import { CreatePostDto } from "../dto/create-post.dto";
import { PostService } from "../services/post.service";
import { ListPostDto } from "../dto/list-post.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UpdatePostDto } from "../dto/update-post.dto";
import { Types } from "mongoose";
import { CreatePostCrawlDto } from "../dto/create-post_crawl.dto";
import { PostCrawlService } from "../services/post_crawl.service";
import { ListCategoryDto } from "../dto/list-category.dto";
import axios from "axios";
import { PostCategoryService } from "../services/post_category.service";
import { CreatePostPromptDto } from "../dto/create-post_prompt.dto";
import { PostPromptService } from "../services/post_prompt.service";
import { UpdatePostPromptDto } from "../dto/update-post_prompt.dto";
import { CreateUserPromptDto } from "../dto/create-user_prompt.dto";
import { PostAnonymousService } from "../services/post_anonymous.service";
import { CreatePromptHistoryDto } from "../dto/create-prompt_history.dto";
import { PromptHistoryService } from "../services/prompt_history.service";
import { ListPromptHistoryDto } from "../dto/list-prompt_history.dto";
import { UpdatePromptHistoryDto } from "../dto/update-prompt_history.dto";

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class PromptHistoryHelper {
  constructor(
    private postCategoryService: PostCategoryService,
    private postService: PostService,
    private postCrawlService: PostCrawlService,
    private userPermissionService: UserPermissionService,
    private postPromptService: PostPromptService,
    private postAnonymousService: PostAnonymousService,
    private promptHistoryService: PromptHistoryService
  ) { }

  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewPromptHistory(createDataHistory: CreatePromptHistoryDto, res: Response, req: ExpressRequestDto) {
    try {

      let authCodeHeader = req?.headers;
      let authCodeString = "";
      if (authCodeHeader && authCodeHeader["x-authorization"]) {
        authCodeString = authCodeHeader["x-authorization"]?.toString();
      }
      console.log(authCodeString, 'authCodeString')

      if (createDataHistory.media_data) {
        createDataHistory = { ...createDataHistory, ...{ media_data: JSON.parse(createDataHistory.media_data) } };
      }
      console.log(createDataHistory, 'createDataHistory')
      let dataCreate = await this.promptHistoryService.create(createDataHistory);
      let dataReturn = await this.promptHistoryService.findById(dataCreate?._id?.toString());
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
  async getPromptHistory(query: ListPromptHistoryDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000) {
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
      let dataReturn = await this.promptHistoryService.filter(dataToFilter, orderByOBject, page, limit);
      let dataCount = await this.promptHistoryService.count(dataToFilter);
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
  async getDetailPromptHistory(id: string, res: Response, req: ExpressRequestDto) {
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
      let dataReturn = await this.promptHistoryService.findOne(dataToFilter);
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
    let date = new Date().getTime();
    return str + "-" + date;
  }
}
