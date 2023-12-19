import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateRedeemDto } from "../dto/create-redeem.dto";
import { CreateRedeemMissionDto } from "../dto/create-redeem_mission.dto";
import { SearchPostDto } from "../dto/search-redeem.dto";
import { SortByPostDto } from "../dto/sort_by-redeem.dto";
import { UpdateRedeemDto } from "../dto/update-redeem.dto";
import { Redeem, RedeemDocument } from "../schemas/redeem.schema";
import { RedeemMission, RedeemMissionDocument } from "../schemas/redeem_mission.schema";

@Injectable()
export class RedeemService {
  constructor(
    @InjectModel(Redeem.name)
    private redeemModel: Model<RedeemDocument>,
    @InjectModel(RedeemMission.name)
    private redeemMissionModel: Model<RedeemMissionDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchPostDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }

    if (filter.channel_id) {
      condition = Object.assign(condition, { channel_id: filter.channel_id });
    }

    if (filter.search) {
      condition = Object.assign(condition, { $text: { $search: filter.search } });
    }
    if (filter?.to_level) {
      condition = Object.assign(condition, { redeem_level: { $lte: Number(filter?.to_level) } });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getConditionMission(filter: SearchPostDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.redeem_id) {
      condition = Object.assign(condition, { redeem_id: filter.redeem_id });
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
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};

    if (filter.search) {
      sortObject = { score: { $meta: "textScore" }, ...sortObject };
      projection = Object.assign(projection, { score: { $meta: "textScore" } });
    }
    const dataPopulate = {
      path: "gift_data",
      options: { strictPopulate: false },
      populate: [
        {
          path: "media_id",
        },
      ],
    };
    const dataPopulateMission = {
      path: "mission_data",
      options: { strictPopulate: false },
      populate: [
        {
          path: "gift_data",
          populate: [
            {
              path: "media_id",
            },
          ],
        },
      ],
    };
    const dataReturn = await this.redeemModel
      .find(condition, projection)
      .populate(
        "user_id",
        "_id user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("post_avatar")
      .populate("attach_files")
      .populate(dataPopulateMission)
      .populate(dataPopulate)
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
  async filterRedeemMission(filter: SearchPostDto, sortBy: SortByPostDto, page: number, limit: number) {
    const condition = await this.getConditionMission(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const projection = {};
    const dataReturn = await this.redeemMissionModel
      .find(condition, projection)
      .populate(
        "user_id",
        "_id user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
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
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const projection = {};
    const dataReturn = await this.redeemModel
      .find(condition, projection)
      .populate(
        "user_id",
        "user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("post_avatar")
      .populate("attach_files")
      .populate("mission_data")
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
      const condition = await this.getCondition(filter);
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
  async create(createUser: CreateRedeemDto) {
    const createdPost = new this.redeemModel(createUser);
    const dataCreate = await createdPost.save();
    return dataCreate;
  }

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async createMisionData(createUser: CreateRedeemMissionDto[]) {
    const createdMissionData = this.redeemMissionModel.insertMany(createUser);
    return createdMissionData;
  }

  /**
   * @author Tony Vu
   * @param userId
   * @returns boolean
   */
  async isSuperAdmin(userId: string) {
    const superAdmin = process.env.SUPER_ADMIN;
    if (superAdmin) {
      const superAdminArray = superAdmin.split(",");
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
  async findAll(dataToSearch?: any): Promise<Redeem[]> {
    return this.redeemModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<Redeem> {
    const dataPopulate = {
      path: "gift_data",
      options: { strictPopulate: false },
      populate: [
        {
          path: "media_id",
        },
      ],
    };
    const dataMissionData = {
      path: "mission_data",
      options: { strictPopulate: false },
      populate: [
        {
          path: "gift_data",
          populate: [
            {
              path: "media_id",
            },
          ],
        },
      ],
    };
    return await this.redeemModel
      .findOne(dataToSearch)
      .sort({ _id: -1 })
      .populate(
        "user_id",
        "user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("post_avatar")
      .populate("attach_files")
      .populate(dataMissionData)
      .populate(dataPopulate)
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<Redeem> {
    if (!id) {
      return null;
    }
    const objectId = new Types.ObjectId(id);
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
      .populate("mission_data")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    await this.redeemMissionModel.deleteMany({ redeem_id: id }).exec();
    return await this.redeemModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async removeMisionMany(dataFilter: any) {
    await this.redeemMissionModel.deleteMany(dataFilter).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateRedeemDto) {
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
          .populate("attach_files")
          .populate("mission_data");
      }
      return dataReturn;
    } catch (e) {
      return e;
    }
  }

  /**
   *
   * @param dataUpdate
   * @returns
   */
  async updateMissionArray(dataFilter: any, dataUpdate: any) {
    try {
      if (!dataFilter?.ids) {
        return null;
      }
      let dataReturn = null;

      if (dataFilter && dataFilter?.ids) {
        dataFilter = {
          ...dataFilter,
          ...{ _id: { $in: dataFilter.ids } },
        };
        delete dataFilter?.ids;
        console.log(dataFilter, "dataFilter");
        console.log(dataUpdate, "dataUpdate");
        dataReturn = await this.redeemMissionModel.updateMany(dataFilter, { $set: dataUpdate }, { new: true });
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
