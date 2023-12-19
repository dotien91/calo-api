import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateChallengePermissionDto } from "../dto/create-challenge_permission.dto";
import { FilterPermissionChallengeDto } from "../dto/filter-permission_challenge.dto";
import { UpdateChallengePermissionDto } from "../dto/update-challenge_permission.dto";
import { ChallengePermission, ChallengePermissionDocument } from "../schemas/challenge_permission.schema";

@Injectable()
export class ChallengePermissionService {
  constructor(
    @InjectModel(ChallengePermission.name)
    private challengePermissionModel: Model<ChallengePermissionDocument>
  ) {}

  private readonly logger = new Logger(ChallengePermissionService.name);

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateChallengePermissionDto): Promise<ChallengePermission> {
    const createdUser = new this.challengePermissionModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: FilterPermissionChallengeDto) {
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
    if (filter.channel_id) {
      condition = Object.assign(condition, { channel_id: filter.channel_id });
    }
    if (filter.max_point) {
      condition = Object.assign(condition, { total_point: { $gt: filter.max_point } });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async removeOne(dataToSearch: any): Promise<ChallengePermission> {
    return await this.challengePermissionModel.findOneAndRemove(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findById(id: string, projection: any): Promise<ChallengePermission> {
    if (!id) {
      return null;
    }
    let dataReturn = await this.challengePermissionModel.findById(id, projection);
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<ChallengePermission[]> {
    return this.challengePermissionModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<ChallengePermission> {
    if (isWithUser) {
      return await this.challengePermissionModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.challengePermissionModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @param isWithUser
   * @returns
   */
  async findOneWithPopulate(dataToSearch: any): Promise<ChallengePermission> {
    return await this.challengePermissionModel
      .findOne(dataToSearch)
      .populate("user_id")
      .populate("challenge_id")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async filterByUserId(userId: string, userPartners: string[]): Promise<ChallengePermission[]> {
    let condition = { user_id: userId, partner_id: { $in: userPartners } };
    return await this.challengePermissionModel.find(condition, {}).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.challengePermissionModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateChallengePermissionDto) {
    try {
      if (!dataUpdate.user_id && !dataUpdate.challenge_id) {
        return null;
      }
      let dataReturn = await this.challengePermissionModel
        .findOneAndUpdate(
          { user_id: dataUpdate.user_id, challenge_id: dataUpdate.challenge_id },
          { $set: dataUpdate },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
        .populate(
          "user_id",
          "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
        );
      return dataReturn;
    } catch (e) {
      return e;
    }
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async updateWithoutCreate(dataUpdate: UpdateChallengePermissionDto) {
    try {
      if (!dataUpdate.user_id && !dataUpdate.challenge_id) {
        return null;
      }
      let dataReturn = await this.challengePermissionModel.findOneAndUpdate(
        { user_id: dataUpdate.user_id, challenge_id: dataUpdate.challenge_id },
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
  public count = async (filter: FilterPermissionChallengeDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.challengePermissionModel.estimatedDocumentCount();
      } else {
        return this.challengePermissionModel.countDocuments(condition);
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
    let sort = {};
    if (sortBy.createdAt) {
      sort = Object.assign(sort, { _id: sortBy.createdAt === "DESC" ? -1 : 1 });
    }
    if (sortBy.updatedAt) {
      sort = Object.assign(sort, { updatedAt: sortBy.updatedAt === "DESC" ? -1 : 1 });
    }
    if (sortBy.total_point) {
      sort = Object.assign(sort, { total_point: sortBy.total_point === "DESC" ? -1 : 1 });
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
    filter: FilterPermissionChallengeDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<ChallengePermission[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.challengePermissionModel
      .find(condition, projection)
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
  async filterWithPopulate(
    filter: FilterPermissionChallengeDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<ChallengePermission[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.challengePermissionModel
      .find(condition, projection)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .populate("challenge_id")
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
    filter: FilterPermissionChallengeDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<ChallengePermission[]> {
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
          path: "media_id",
        },
        {
          path: "avatar",
        },
        {
          path: "game_id",
        },
        {
          path: "gift_data",
        },
        {
          path: "challenge_stage.gift_data",
          options: { strictPopulate: false },
          populate: [
            {
              path: "media_id",
            },
          ],
        },
      ],
    };
    let dataReturn: any = await this.challengePermissionModel
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
        let dataItemToReturn = { ...dataItem?.toObject(), ...dataItem.video_id?.toObject() };
        delete dataItemToReturn.video_id;
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
  async filterWithId(
    filter: FilterPermissionChallengeDto,
    page: number,
    limit: number
  ): Promise<ChallengePermission[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any = { _id: -1 };
    let dataReturn = await this.challengePermissionModel
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
  async filterUser(filter: FilterPermissionChallengeDto, sortBy: any, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.challengePermissionModel
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

  /**
   * @author Tony Vu
   * @param dataFilter
   * @returns
   */
  async updateCount(dataFilter: any, dataUpdate: any) {
    try {
      let dataReturn: any = this.challengePermissionModel.findOneAndUpdate(
        dataFilter,
        { $inc: dataUpdate },
        { new: true }
      );
      return dataReturn;
    } catch (e) {
      return null;
    }
  }
}
