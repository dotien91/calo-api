import { Injectable } from "@nestjs/common";
import { CreateRedeemHistoryDto } from "../dto/create-redeem_history.dto";
import { RedeemHistoryDocument, RedeemHistory } from "../schemas/redeem_history.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UpdateRedeemHistoryDto } from "../dto/update-redeem_history.dto";
import { SearchPostDto } from "../dto/search-redeem.dto";
import { SortByPostDto } from "../dto/sort_by-redeem.dto";
import { SearchAdminFilterDto } from "../../../modules/user/dto/search-admin_filter.dto";
import { SearchRedeemHistoryDto } from "../dto/search-redeem_history.dto";

@Injectable()
export class RedeemHistoryService {
  constructor(
    @InjectModel(RedeemHistory.name)
    private redeemModel: Model<RedeemHistoryDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchRedeemHistoryDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.channel_id) {
      condition = Object.assign(condition, { channel_id: filter.channel_id });
    }
    if (filter.redeem_mission_id) {
      condition = Object.assign(condition, { redeem_mission_id: filter.redeem_mission_id });
    }
    if (filter.redeem_id) {
      condition = Object.assign(condition, { redeem_id: filter.redeem_id });
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
  getSort(sortBy: SortByPostDto) {
    let sort = { is_pin: -1 };
    if (sortBy.createdAt) {
      sort = Object.assign(sort, { createdAt: sortBy.createdAt === "DESC" ? -1 : 1 });
    }
    if (sortBy.post_view) {
      sort = Object.assign(sort, { post_view: sortBy.post_view === "DESC" ? -1 : 1 });
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
  async filter(filter: SearchPostDto, sortBy: SortByPostDto, page: number, limit: number) {
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
    let dataReturn = await this.redeemModel
      .find(condition, projection)
      .populate(
        "user_id",
        "_id user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("post_avatar")
      .populate("attach_files")
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
  async filterAdmin(filter: SearchPostDto, sortBy: SortByPostDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};
    let dataReturn = await this.redeemModel
      .find(condition, projection)
      .populate(
        "user_id",
        "user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("post_avatar")
      .populate("attach_files")
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
  public count = async (filter: SearchPostDto) => {
    try {
      let condition = await this.getCondition(filter);
      let sortObject = {};
      let projection = {};
      if (filter.search) {
        sortObject = { score: { $meta: "textScore" }, ...sortObject };
        projection = Object.assign(projection, { score: { $meta: "textScore" } });
      }
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.redeemModel.estimatedDocumentCount();
      } else {
        return this.redeemModel.countDocuments(condition, projection);
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
  async create(createUser: CreateRedeemHistoryDto) {
    const createdPost = new this.redeemModel(createUser);
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
  async findAll(): Promise<RedeemHistory[]> {
    return this.redeemModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<RedeemHistory> {
    return await this.redeemModel
      .findOne(dataToSearch)
      .sort({ _id: -1 })
      .populate(
        "user_id",
        "user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("post_avatar")
      .populate("attach_files")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<RedeemHistory> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.redeemModel
      .findById(objectId)
      .populate(
        "user_id",
        "_id user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("post_avatar")
      .populate("attach_files")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.redeemModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateRedeemHistoryDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = null;

      if (dataUpdate._id) {
        dataReturn = await this.redeemModel
          .findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: true })
          .populate(
            "user_id",
            "user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
          )
          .populate("post_avatar")
          .populate("attach_files");
      }
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
      if (dataUpdate?.vote_number) {
        dataUpdate = {
          ...dataUpdate,
          ...{ trending_number: Math.abs(dataUpdate?.vote_number), popular_number: Math.abs(dataUpdate?.vote_number) },
        };
      }
      if (dataUpdate?.comment_number) {
        dataUpdate = {
          ...dataUpdate,
          ...{ popular_number: dataUpdate?.comment_number, trending_number: dataUpdate?.comment_number },
        };
      }
      return this.redeemModel.findByIdAndUpdate(dataFilter._id, { $inc: dataUpdate }, { new: true });
    } catch (e) {
      return null;
    }
  }
}
