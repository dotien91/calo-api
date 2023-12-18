import { Injectable } from "@nestjs/common";
import { ChallengeActivity, ChallengeActivityDocument } from "../schemas/challenge_activity.schema";
import { CreateChallengeActivityDto } from "../dto/create-challenge_activity.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UpdateChallengeActivityDto } from "../dto/update-challenge_activity.dto";
import { FilterModuleChallengeDto } from "../dto/filter-module_challenge.dto";

@Injectable()
export class ChallengeActivityService {
  constructor(
    @InjectModel(ChallengeActivity.name)
    private challengeActivityModel: Model<ChallengeActivityDocument>
  ) { }

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateChallengeActivityDto) {
    let dataReturn = await this.challengeActivityModel
      .create(createUser);
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: FilterModuleChallengeDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.user_ids) {
      condition = Object.assign(condition, { user_id: { $in: filter.user_ids } });
    }
    if (filter.challenge_ids) {
      condition = Object.assign(condition, { challenge_id: { $in: filter.challenge_ids } });
    }
    if (filter.unset) {
      condition = Object.assign(condition, { challenge_id: { $nin: filter.unset } });
    }
    if (filter.challenge_id) {
      condition = Object.assign(condition, { challenge_id: filter.challenge_id });
    }
    if (filter.official_status) {
      condition = Object.assign(condition, { official_status: filter.official_status });
    }
    if (filter.game_type) {
      condition = Object.assign(condition, { game_type: filter.game_type });
    }
    if (filter.parent_id) {
      condition = Object.assign(condition, { parent_id: filter.parent_id });
    }
    if (filter.is_child) {
      condition = Object.assign(condition, { parent_id: { $ne: null } });
    }
    if (filter.is_parent) {
      condition = Object.assign(condition, { parent_id: null });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async removeOne(dataToSearch: any): Promise<ChallengeActivity> {
    return await this.challengeActivityModel.findOneAndRemove(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findById(id: string, projection: any): Promise<ChallengeActivity> {
    if (!id) {
      return null;
    }
    let dataReturn = await this.challengeActivityModel
      .findById(id, projection)
      .populate(
        "user_id",
        "_id user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("challenge_id");
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findByIdPopulate(id: string, projection: any): Promise<ChallengeActivity> {
    if (!id) {
      return null;
    }
    let dataReturn = await this.challengeActivityModel
      .findById(id, projection)
      .populate("challenge_id")
      .populate(
        "user_id",
        "_id user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      );
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<ChallengeActivity[]> {
    return this.challengeActivityModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<ChallengeActivity> {
    if (isWithUser) {
      return await this.challengeActivityModel
        .findOne(dataToSearch)
        .populate(
          "user_id",
          "_id user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
        )
        .populate("public_album")
        .exec();
    } else {
      return await this.challengeActivityModel
        .findOne(dataToSearch)
        .populate(
          "user_id",
          "_id user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
        )
        .populate("public_album")
        .exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async filterByUserId(userId: string, userPartners: string[]): Promise<ChallengeActivity[]> {
    let condition = { user_id: userId, partner_id: { $in: userPartners } };
    return await this.challengeActivityModel.find(condition, {}).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.challengeActivityModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateChallengeActivityDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.challengeActivityModel
        .findOneAndUpdate(
          { _id: dataUpdate._id },
          { $set: dataUpdate },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
        .populate(
          "user_id",
          "_id user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
        )
        .populate("public_album");
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
   * @param dataUpdate
   * @returns
   */
  async updateWithoutCreate(dataUpdate: UpdateChallengeActivityDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.challengeActivityModel.findOneAndUpdate(
        { _id: dataUpdate._id },
        { $set: dataUpdate }
      );
      if (dataReturn._id) {
        return { ...dataReturn.toObject(), ...dataUpdate };
      } else {
        return null;
      }
    } catch (e) {
      return e;
    }
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  public count = async (filter: FilterModuleChallengeDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.challengeActivityModel.estimatedDocumentCount();
      } else {
        return this.challengeActivityModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: any) {
    let sort = { priority: -1 };
    if (sortBy.createdAt) {
      sort = Object.assign(sort, { _id: sortBy.createdAt === "DESC" ? -1 : 1 });
    }
    if (sortBy.updatedAt) {
      sort = Object.assign(sort, { updatedAt: sortBy.updatedAt === "DESC" ? -1 : 1 });
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
    filter: FilterModuleChallengeDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<ChallengeActivity[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.challengeActivityModel
      .find(condition, projection)
      .populate(
        "user_id",
        "_id user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("public_album")
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
  async filterChallenge(
    filter: FilterModuleChallengeDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<ChallengeActivity[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataPopulate = {
      path: "challenge_id",
      options: { strictPopulate: false },
      populate: [
        {
          path: "public_album",
        },
        {
          path: "ref_id",
        },
      ],
    };
    let dataReturn: any = await this.challengeActivityModel
      .find(condition, projection)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate(dataPopulate)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    if (dataReturn && dataReturn?.length) {
      let dataFinalToReturn = [];
      for (let dataItem of dataReturn) {
        let dataItemToReturn = { ...dataItem?.toObject(), ...dataItem.challenge_id?.toObject() };
        delete dataItemToReturn.challenge_id;
        dataFinalToReturn.push(dataItemToReturn);
      }
      return dataFinalToReturn;
    } else {
      return [];
    }
  }

  /**
   *
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filterWithId(filter: FilterModuleChallengeDto, page: number, limit: number): Promise<ChallengeActivity[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any = { _id: -1 };
    let dataReturn = await this.challengeActivityModel
      .find(condition, { user_id: true })
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
  async filterUser(filter: FilterModuleChallengeDto, sortBy: any, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.challengeActivityModel
      .find(condition)
      .populate({
        path: "user_id",
        options: { strictPopulate: false },
        select:
          "_id bio description user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active",
        populate: { path: "user_option_id" },
      })
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }
}
