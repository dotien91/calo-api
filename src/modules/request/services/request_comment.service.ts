import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { RequestComment, RequestCommentDocument } from "../schemas/request-comment.schema";
import { SearchRequestCategoryDto } from "../dto/search-request_category.dto";
import { SearchRequestCommentDto } from "../dto/search-request_comment.dto";
import { UpdateRequestCommentDto } from "../dto/update-request_comment.dto";
import { CreateRequestCommentDto } from "../dto/create-request_comment.dto";
import { SortByRequestCommentDto } from "../dto/sort_by-request_comment.dto";
import { ObjectId } from "mongodb";

@Injectable()
export class RequestCommentService {
  constructor(
    @InjectModel(RequestComment.name)
    private requestModel: Model<RequestCommentDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchRequestCommentDto) {
    let condition: any = {};

    if (filter?.parent_id) {
      condition = Object.assign(condition, { parent_id: filter.parent_id });
    } else {
      condition = Object.assign(condition, { parent_id: null });
    }

    if (filter?.request_id) {
      condition = Object.assign(condition, { request_id: filter?.request_id });
    }

    if (filter?.user_id) {
      condition = Object.assign(condition, { user_id: filter?.user_id });
    }

    if (filter.from_id || filter.to_id) {
      let dataFilter = {};
      if (filter.from_id) {
        let objectIdFrom = new ObjectId(filter?.from_id);
        dataFilter = { ...dataFilter, ...{ $gt: objectIdFrom } };
      }
      if (filter.to_id) {
        let objectIdTo = new ObjectId(filter?.to_id);
        dataFilter = { ...dataFilter, ...{ $lte: objectIdTo } };
      }
      condition = Object.assign(condition, { _id: dataFilter });
    }

    if (filter.search) {
      condition = Object.assign(condition, { $text: { $search: filter.search } });
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
  async filter(filter: SearchRequestCommentDto, sortBy: SortByRequestCommentDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};

    if (filter.search) {
      sortObject = { score: { $meta: "textScore" }, ...sortObject };
      projection = Object.assign(projection, { score: { $meta: "textScore" } });
    }

    let limitChild = filter.limit_child ? filter.limit_child : 1000;
    let pageChild = filter.page_child ? filter.page_child : 1;
    let orderByOBjectChild = { _id: 1 };

    if (filter.order_by_child) {
      orderByOBjectChild = { ...orderByOBjectChild, ...{ _id: filter.order_by_child === "DESC" ? -1 : 1 } };
    }

    let dataPopulateChild = {
      path: "child",
      options: {
        limit: limitChild,
        sort: orderByOBjectChild,
        skip: limitChild * (pageChild - 1),
      },
      populate: {
        path: "user_id",
        select:
          "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active",
      },
    };
    let dataReturn = await this.requestModel
      .find(condition)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate(dataPopulateChild)
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
  async filterAdmin(filter: SearchRequestCommentDto, sortBy: SortByRequestCommentDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};

    let dataPopulateChild = {
      path: "child",
      options: {
        limit: limit,
        sort: { sortObject },
        skip: 0,
      },
      populate: {
        path: "user_id",
        select:
          "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active",
      },
    };
    let dataReturn = await this.requestModel
      .find(condition, projection)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate(dataPopulateChild)
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
  async create(createUser: CreateRequestCommentDto) {
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
  async findAll(): Promise<RequestComment[]> {
    return this.requestModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<RequestComment> {
    return await this.requestModel
      .findOne(dataToSearch)
      .sort({ _id: -1 })
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<RequestComment> {
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
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findByIdPopulate(id: string): Promise<RequestComment> {
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
      .populate("request_id")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string): Promise<any> {
    return await this.requestModel.findByIdAndDelete(id).exec();
  }

  async deleteManyByIds(ids: string[]) {
    return await this.requestModel
      .deleteMany({
        _id: {
          $in: ids,
        },
      })
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateRequestCommentDto) {
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
   *
   * @param dataUpdate
   * @returns
   */
  async updateArray(dataUpdate: UpdateRequestCommentDto, isPull: boolean = false) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = null;
      if (dataUpdate._id) {
        let dataId = dataUpdate?._id;
        delete dataUpdate?._id;
        if (isPull) {
          dataReturn = await this.requestModel.findOneAndUpdate(
            { _id: dataId },
            {
              //@ts-ignore
              $pull: dataUpdate,
            },
            { new: true }
          );
        } else {
          dataReturn = await this.requestModel.findOneAndUpdate(
            { _id: dataId },

            {
              //@ts-ignore
              $addToSet: dataUpdate,
            },
            { new: true }
          );
        }
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
