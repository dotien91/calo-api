import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateShortDto } from "../dto/create-short.dto";
import { SearchShortDto } from "../dto/search-short.dto";
import { SortByShortDto } from "../dto/sort_by-short.dto";
import { UpdateShortDto } from "../dto/update-short.dto";
import { Short, ShortDocument } from "../schemas/short.schema";

@Injectable()
export class ShortService {
  constructor(
    @InjectModel(Short.name)
    private shortModel: Model<ShortDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchShortDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.language) {
      condition = Object.assign(condition, { language: filter.language });
    }

    if (filter.short_status) {
      condition = Object.assign(condition, { short_status: filter.short_status });
    }

    if (filter.short_category) {
      condition = Object.assign(condition, { short_category: filter.short_category });
    }

    if (filter.ref_id) {
      if (filter.ref_id?.indexOf(",") !== -1) {
        let dataRefArray = filter.ref_id?.split(",");
        condition = Object.assign(condition, { ref_id: { $in: dataRefArray } });
      } else {
        condition = Object.assign(condition, { ref_id: filter.ref_id });
      }
    }

    if (filter.ids) {
      let dataIds = filter.ids.split(",");
      condition = Object.assign(condition, { _id: { $in: dataIds } });
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
  getSort(sortBy: SortByShortDto) {
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
  async filter(filter: SearchShortDto, sortBy: SortByShortDto, page: number, limit: number): Promise<Short[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};

    if (Number(limit) == 1 && process.env.BRANCH_NAME === "live_video") {
      let countData = await this.count(filter);
      page = Math.floor(Math.random() * (countData - 1 + 1) + 1);
    }

    if (filter.search) {
      sortObject = { score: { $meta: "textScore" }, ...sortObject };
      projection = Object.assign(projection, { score: { $meta: "textScore" } });
    }

    let dataReturn = await this.shortModel
      .find(condition)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("media_id")
      .populate("ref_id")
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
  async filterAdmin(filter: SearchShortDto, sortBy: SortByShortDto, page: number, limit: number): Promise<Short[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};
    let dataReturn = await this.shortModel
      .find(condition, projection)
      .populate("user_id")
      .populate("media_id")
      .populate("ref_id")
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
  public count = async (filter: SearchShortDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.shortModel.estimatedDocumentCount();
      } else {
        return this.shortModel.countDocuments(condition);
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
  async create(createUser: CreateShortDto) {
    const createdShort = new this.shortModel(createUser);
    let dataCreate = await createdShort.save();
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
  async findAll(): Promise<Short[]> {
    return this.shortModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<Short> {
    return await this.shortModel
      .findOne(dataToSearch)
      .sort({ _id: -1 })
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("media_id")
      .populate("ref_id")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<Short> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.shortModel
      .findById(objectId)
      .populate(
        "user_id",
        "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("media_id")
      .populate("ref_id")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.shortModel
      .findByIdAndDelete(id)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("media_id")
      .populate("ref_id")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateShortDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.shortModel
        .findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: false })
        .populate(
          "user_id",
          "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
        )
        .populate("media_id")
        .populate("ref_id");
      return dataReturn;
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
      return this.shortModel.findByIdAndUpdate(dataFilter._id, { $inc: dataUpdate });
    } catch (e) {
      return null;
    }
  }
}
