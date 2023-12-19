import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateUserFollowDto } from "../dto/create-user_follow.dto";
import { FilterFollowDto } from "../dto/filter-follow.dto";
import { UpdateUserFollowDto } from "../dto/update-user_follow.dto";
import { UserFollow, UserFollowDocument } from "../schemas/user_follow.schema";

@Injectable()
export class UserFollowService {
  constructor(
    @InjectModel(UserFollow.name)
    private userFollowModel: Model<UserFollowDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateUserFollowDto): Promise<UserFollow> {
    const createdUser = new this.userFollowModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: FilterFollowDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.user_ids) {
      condition = Object.assign(condition, { user_id: { $in: filter.user_ids } });
    }

    if (filter.partner_ids) {
      condition = Object.assign(condition, { partner_id: { $in: filter.partner_ids } });
    }
    if (filter.partner_id) {
      condition = Object.assign(condition, { partner_id: filter.partner_id });
    }
    if (Number(filter.match_status) === 0 || Number(filter.match_status) === 1) {
      condition = Object.assign(condition, { match_status: Number(filter.match_status) });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async removeOne(dataToSearch: any): Promise<UserFollow> {
    return await this.userFollowModel.findOneAndRemove(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findById(id: string, projection: any): Promise<UserFollow> {
    if (!id) {
      return null;
    }
    let dataReturn = await this.userFollowModel.findById(id, projection);
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<UserFollow[]> {
    return this.userFollowModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<UserFollow> {
    if (isWithUser) {
      return await this.userFollowModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.userFollowModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async filterByUserId(userId: string, userPartners: string[]): Promise<UserFollow[]> {
    let condition = { user_id: userId, partner_id: { $in: userPartners } };
    return await this.userFollowModel.find(condition, {}).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.userFollowModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateUserFollowDto) {
    try {
      if (!dataUpdate.user_id && !dataUpdate.partner_id) {
        return null;
      }
      let dataReturn = await this.userFollowModel.findOneAndUpdate(
        { user_id: dataUpdate.user_id, partner_id: dataUpdate.partner_id },
        { $set: dataUpdate },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
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
  async updateWithoutCreate(dataUpdate: UpdateUserFollowDto) {
    try {
      if (!dataUpdate.user_id && !dataUpdate.partner_id) {
        return null;
      }
      let dataReturn = await this.userFollowModel.findOneAndUpdate(
        { user_id: dataUpdate.user_id, partner_id: dataUpdate.partner_id },
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
  public count = async (filter: FilterFollowDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.userFollowModel.estimatedDocumentCount();
      } else {
        return this.userFollowModel.countDocuments(condition);
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
  async filter(filter: FilterFollowDto, sortBy: any, page: number, limit: number): Promise<UserFollow[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.userFollowModel
      .find(condition)
      .populate({
        path: "partner_id",
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
   *
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filterWithId(filter: FilterFollowDto, page: number, limit: number): Promise<UserFollow[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any = { _id: -1 };
    let dataReturn = await this.userFollowModel
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
  async filterUser(filter: FilterFollowDto, sortBy: any, page: number, limit: number, isPopulate: boolean = true) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataPopulate: any = {
      path: "user_id",
    };

    let dataPopulatePartner: any = {
      path: "user_id",
    };
    if (isPopulate) {
      dataPopulate = {
        path: "user_id",
        options: { strictPopulate: false },
        select:
          "_id bio description user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active",
        populate: { path: "user_option_id" },
      };

      dataPopulatePartner = {
        path: "partner_id",
        options: { strictPopulate: false },
        select:
          "_id bio description user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active",
        populate: { path: "user_option_id" },
      };
    }
    let dataReturn = await this.userFollowModel
      .find(condition)
      .populate(dataPopulate)
      .populate(dataPopulatePartner)
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
  async filterLocation(filter: FilterFollowDto, sortBy: any, page: number, limit: number, isPopulate: boolean = true) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataPopulate: any = {
      path: "user_id",
    };
    if (isPopulate) {
      dataPopulate = {
        path: "user_id",
        options: { strictPopulate: false },
        select:
          "_id bio description user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active",
        populate: [
          {
            path: "user_option_id",
          },
          {
            path: "last_user_location",
          },
        ],
      };
    }
    let dataReturn = await this.userFollowModel
      .find(condition)
      .populate(dataPopulate)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }
}
