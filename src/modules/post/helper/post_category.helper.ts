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
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { Types } from "mongoose";
import { UpdateCategoryDto } from "../dto/update-category.dto";
import { CreateCategoryDto } from "../dto/create-category.dto";
import { ListCategoryDto } from "../dto/list-category.dto";
import { PostCategoryService } from "../services/post_category.service";

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class PostCategoryHelper {
  constructor(private postCategoryService: PostCategoryService, private userPermissionService: UserPermissionService) {}

  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewCategory(createPostData: CreateCategoryDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "order/list")) {
        let dataSlug = this.toSlug(createPostData.category_title);
        createPostData = { ...createPostData, ...{ category_slug: dataSlug, user_id: userObject._id.toString() } };

        let dataCreate = await this.postCategoryService.create(createPostData);
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
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getCategoryListByAdmin(query: ListCategoryDto, res: Response, req: ExpressRequestDto) {
    try {
      // let userObject = req?.user_object;
      // if (!userObject) {
      //   throw new ForbiddenException("User is invalid");
      // }
      // let userId = userObject._id.toString();
      // if (await this.userPermissionService.isHavePermission(userId, "order/list")) {
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
      let dataReturn = await this.postCategoryService.filter(dataToFilter, orderByOBject, page, limit);
      let dataCount = await this.postCategoryService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .json(dataReturn);
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
  async getCategoryListByUser(query: ListCategoryDto, res: Response, req: ExpressRequestDto) {
    try {
      // let userObject = req?.user_object;
      // if (!userObject) {
      //   throw new ForbiddenException("User is invalid");
      // }
      // let userId = userObject._id.toString();

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
      if (query?.ids) {
        dataToFilter = { ...dataToFilter, ...{ ids: [query?.ids] } };
      }
      let dataReturn = await this.postCategoryService.filter(dataToFilter, orderByOBject, page, limit);
      let dataCount = await this.postCategoryService.count(dataToFilter);
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
      let dataReturn = await this.postCategoryService.findOne(dataToFilter);
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
  async handleUpdateCategoryByAdmin(dataUpdate: UpdateCategoryDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      if (dataUpdate.category_slug) {
        let dataToFind = await this.postCategoryService.findOne({ category_slug: dataUpdate.category_slug });
        if (dataToFind && dataToFind._id.toString() !== dataUpdate._id.toString()) {
          throw new ForbiddenException("Slug is exist!");
        }
      }
      let userId = userObject._id.toString();
      //Check Permission
      if (await this.userPermissionService.isHavePermission(userId, "post/update")) {
        let dataReturn = await this.postCategoryService.update(dataUpdate);
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
  async handleDeleteCategory(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "post/delete")) {
        //Check Permission
        let dataReturn = await this.postCategoryService.remove(id);
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
    let date = new Date().getTime();
    return str + "-" + date;
  }
}
