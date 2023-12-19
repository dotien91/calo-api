import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { RequestCategory, RequestCategoryDocument } from "../schemas/request-category.schema";
import { SearchRequestCategoryDto } from "../dto/search-request_category.dto";
import { SortByRequestCommentDto } from "../dto/sort_by-request_comment.dto";
import { UpdateRequestCategoryDto } from "../dto/update-request_category.dto";
import { CreateRequestCategoryDto } from "../dto/create-request_category.dto";

@Injectable()
export class RequestCategoryService {
  constructor(
    @InjectModel(RequestCategory.name)
    private requestModel: Model<RequestCategoryDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchRequestCategoryDto) {
    let condition: any = {};
    if (filter.search) {
      let dataSearch = `${filter.search}`;
      let dataRegex = new RegExp("^" + dataSearch.toLowerCase(), "i");
      // console.log(dataRegex);
      // condition = Object.assign(condition, { $text: { $search: dataRegex } });
      condition = Object.assign(condition, { $or: [{ category_title: dataRegex }, { category_content: dataRegex }] });
    }

    if (filter?.version) {
      condition = Object.assign(condition, { version: { $gte: parseInt(filter?.version) } });
    }

    if (filter?.channel_id) {
      condition = Object.assign(condition, { channel_id: filter.channel_id });
    }

    if (filter.hasOwnProperty("public_status")) {
      condition = Object.assign(condition, { public_status: filter?.public_status });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByRequestCommentDto) {
    let sort = { priority: -1 };
    if (sortBy.createdAt) {
      sort = Object.assign(sort, { _id: sortBy.createdAt === "DESC" ? -1 : 1 });
    }
    return sort;
  }

  /**
   * @author Tony Vu
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filter(filter: SearchRequestCategoryDto, sortBy: SortByRequestCommentDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};

    let dataReturn = await this.requestModel
      .find(condition)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("category_avatar")
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filterAdmin(filter: SearchRequestCategoryDto, sortBy: SortByRequestCommentDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};
    let dataReturn = await this.requestModel
      .find(condition, projection)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("category_avatar")
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  public count = async (filter: SearchRequestCategoryDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.requestModel.estimatedDocumentCount();
      } else {
        return this.requestModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateRequestCategoryDto) {
    const createdPost = new this.requestModel(createUser);
    let dataCreate = await createdPost.save();
    return dataCreate;
  }

  /**
   * @author Tony Vu
   * @param userId
   * @returns boolean
   */
  async isSuperAdmin(userId: string) {
    let superAdmin = process.env.SUPER_ADMIN;
    if (superAdmin) {
      let superAdminArray = superAdmin.split(",");
      if (superAdminArray.indexOf(userId) !== -1) {
        return true;
      }
    }
    return false;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<RequestCategory[]> {
    return this.requestModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<RequestCategory> {
    return await this.requestModel
      .findOne(dataToSearch)
      .sort({ _id: -1 })
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("category_avatar")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<RequestCategory> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.requestModel
      .findById(objectId)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("category_avatar")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.requestModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateRequestCategoryDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = null;
      if (dataUpdate._id) {
        dataReturn = await this.requestModel.findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: false });
      }
      if (dataReturn._id) {
        return { ...dataReturn.toObject(), ...dataUpdate };
      } else {
        return dataReturn;
      }
    } catch (e) {
      return e;
    }
  }

  /**
   * @author Tony Vu
   * @param dataFilter
   * @returns
   */
  async updateCount(dataFilter: any, dataUpdate: any) {
    try {
      return this.requestModel.findByIdAndUpdate(dataFilter._id, { $inc: dataUpdate });
    } catch (e) {
      return null;
    }
  }
}
