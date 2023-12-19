import { Injectable, Logger } from "@nestjs/common";
import { CreateChallengeDto } from "../dto/create-challenge.dto";
import { ChallengeDocument, Challenge } from "../schemas/challenge.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UpdateChallengeDto } from "../dto/update-challenge.dto";
import { SearchChallengeDto } from "../dto/search-challenge.dto";
import { SortByChallengeDto } from "../dto/sort_by-challenge.dto";
import { SearchAdminFilterDto } from "../../../modules/user/dto/search-admin_filter.dto";

@Injectable()
export class ChallengeService {
  constructor(
    @InjectModel(Challenge.name)
    private challengeModel: Model<ChallengeDocument>
  ) {}

  private readonly logger = new Logger(ChallengeService.name);

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchChallengeDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.language) {
      condition = Object.assign(condition, { language: filter.language });
    }

    // if (filter.challenge_status) {
    //   condition = Object.assign(condition, { challenge_status: filter.challenge_status });
    // }

    if (filter.channel_id) {
      condition = Object.assign(condition, { channel_id: filter.channel_id });
    }

    if (filter.level_value) {
      condition = Object.assign(condition, { level_value: { $gte: filter.level_value } });
    }

    if (filter.coin_value) {
      condition = Object.assign(condition, { coin_value: { $gte: filter.coin_value } });
    }

    if (filter.post_category) {
      condition = Object.assign(condition, { post_category: filter.post_category });
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
      let dataSearch = `${filter.search}`;
      let dataRegex = new RegExp("^" + dataSearch.toLowerCase(), "i");
      condition = Object.assign(condition, { $or: [{ title: dataRegex }, { description: dataRegex }] });
    }

    if (filter?.challenge_status) {
      if (filter?.challenge_status == "past") {
        condition = Object.assign(condition, { end_time: { $lt: new Date() } });
      }
      if (filter?.challenge_status == "present") {
        condition = Object.assign(condition, { end_time: { $gte: new Date() }, start_time: { $lte: new Date() } });
      }
      if (filter?.challenge_status == "future") {
        condition = Object.assign(condition, { start_time: { $gt: new Date() } });
      }
    }

    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByChallengeDto) {
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
  async filter(
    filter: SearchChallengeDto,
    sortBy: SortByChallengeDto,
    page: number,
    limit: number
  ): Promise<Challenge[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};

    // if (filter.search) {
    //   sortObject = { score: { $meta: "textScore" }, ...sortObject };
    //   projection = Object.assign(projection, { score: { $meta: "textScore" } });
    // }

    let dataPopulate = {
      path: "gift_data",
      options: { strictPopulate: false },
      populate: [
        {
          path: "media_id",
        },
      ],
    };
    let dataPopulateStage = {
      path: "challenge_stage.gift_data",
      options: { strictPopulate: false },
      populate: [
        {
          path: "media_id",
        },
      ],
    };

    let dataReturn = await this.challengeModel
      .find(condition, projection)
      .populate(
        "user_id",
        "user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("media_id")
      .populate("game_id")
      .populate(dataPopulate)
      .populate(dataPopulateStage)
      .populate("avatar")
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
  async filterAdmin(
    filter: SearchChallengeDto,
    sortBy: SortByChallengeDto,
    page: number,
    limit: number
  ): Promise<Challenge[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};
    let dataPopulate = {
      path: "gift_data",
      options: { strictPopulate: false },
      populate: [
        {
          path: "media_id",
        },
      ],
    };
    let dataPopulateStage = {
      path: "challenge_stage.gift_data",
      options: { strictPopulate: false },
      populate: [
        {
          path: "media_id",
        },
      ],
    };
    let dataReturn = await this.challengeModel
      .find(condition, projection)
      .populate(
        "user_id",
        "user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("media_id")
      .populate("avatar")
      .populate("game_id")
      .populate(dataPopulate)
      .populate(dataPopulateStage)
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
  public count = async (filter: SearchChallengeDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.challengeModel.estimatedDocumentCount();
      } else {
        return this.challengeModel.countDocuments(condition);
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
  async create(createUser: CreateChallengeDto) {
    const createdChallenge = new this.challengeModel(createUser);
    let dataCreate = await createdChallenge.save();
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
  async findAll(): Promise<Challenge[]> {
    return this.challengeModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<Challenge> {
    let dataPopulate = {
      path: "gift_data",
      options: { strictPopulate: false },
      populate: [
        {
          path: "media_id",
        },
      ],
    };

    let dataPopulateStage = {
      path: "challenge_stage.gift_data",
      options: { strictPopulate: false },
      populate: [
        {
          path: "media_id",
        },
      ],
    };
    return await this.challengeModel
      .findOne(dataToSearch)
      .sort({ _id: -1 })
      .populate(
        "user_id",
        "user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("media_id")
      .populate("avatar")
      .populate("game_id")
      .populate(dataPopulate)
      .populate(dataPopulateStage)
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<Challenge> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    let dataPopulate = {
      path: "gift_data",
      options: { strictPopulate: false },
      populate: [
        {
          path: "media_id",
        },
      ],
    };

    let dataPopulateStage = {
      path: "challenge_stage.gift_data",
      options: { strictPopulate: false },
      populate: [
        {
          path: "media_id",
        },
      ],
    };
    return await this.challengeModel
      .findById(objectId)
      .populate(
        "user_id",
        "_id user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("media_id")
      .populate("avatar")
      .populate("game_id")
      .populate(dataPopulate)
      .populate(dataPopulateStage)
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    let dataPopulate = {
      path: "gift_data",
      options: { strictPopulate: false },
      populate: [
        {
          path: "media_id",
        },
      ],
    };

    let dataPopulateStage = {
      path: "challenge_stage.gift_data",
      options: { strictPopulate: false },
      populate: [
        {
          path: "media_id",
        },
      ],
    };
    return await this.challengeModel
      .findByIdAndDelete(id)
      .populate(
        "user_id",
        "user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("media_id")
      .populate("avatar")
      .populate("game_id")
      .populate(dataPopulate)
      .populate(dataPopulateStage)
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateChallengeDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }

      let dataPopulate = {
        path: "gift_data",
        options: { strictPopulate: false },
        populate: [
          {
            path: "media_id",
          },
        ],
      };

      let dataPopulateStage = {
        path: "challenge_stage.gift_data",
        options: { strictPopulate: false },
        populate: [
          {
            path: "media_id",
          },
        ],
      };
      let dataReturn = await this.challengeModel
        .findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: true })
        .populate(
          "user_id",
          "user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
        )
        .populate("media_id")
        .populate("avatar")
        .populate("game_id")
        .populate(dataPopulate)
        .populate(dataPopulateStage);
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
      return this.challengeModel.findByIdAndUpdate(dataFilter._id, { $inc: dataUpdate });
    } catch (e) {
      return null;
    }
  }
}
