import { Injectable } from "@nestjs/common";
import { UserDisagree, UserDisagreeDocument } from "../schemas/user_disagree.schema";
import { CreateUserFollowDto } from "../dto/create-user_follow.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UpdateUserFollowDto } from "../dto/update-user_follow.dto";
import { FilterFollowDto } from "../dto/filter-follow.dto";

@Injectable()
export class UserDisagreeService {
  constructor(
    @InjectModel(UserDisagree.name)
    private userDisagreeModel: Model<UserDisagreeDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateUserFollowDto): Promise<UserDisagree> {
    const createdUser = new this.userDisagreeModel(createUser);
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
    if (filter.partner_id) {
      condition = Object.assign(condition, { partner_id: filter.partner_id });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findById(id: string, projection: any): Promise<UserDisagree> {
    if (!id) {
      return null;
    }
    let dataReturn = await this.userDisagreeModel.findById(id, projection);
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<UserDisagree[]> {
    return this.userDisagreeModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<UserDisagree> {
    if (isWithUser) {
      return await this.userDisagreeModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.userDisagreeModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
   async removeOne(dataToSearch: any): Promise<UserDisagree> {
    return await this.userDisagreeModel.findOneAndRemove(dataToSearch).exec();
  }


  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
   async filterByUserId(userId: string, userPartners: string[]): Promise<UserDisagree[]> {
    let condition = { user_id: userId, partner_id: { $in: userPartners }};
    return await this.userDisagreeModel.find(condition, {}).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.userDisagreeModel.findByIdAndDelete(id).exec();
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
      let dataReturn = await this.userDisagreeModel.findOneAndUpdate(
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
   * @param filter
   * @returns
   */
  public count = async (filter: FilterFollowDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.userDisagreeModel.estimatedDocumentCount();
      } else {
        return this.userDisagreeModel.countDocuments(condition);
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
  async filter(filter: FilterFollowDto, sortBy: any, page: number, limit: number): Promise<UserDisagree[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.userDisagreeModel
      .find(condition)
      .populate({
        path: "partner_id",
        options: { strictPopulate: false },
        select: "_id bio description user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active",
        populate: { path: 'user_option_id' }
      })
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
   async filterUser(filter: FilterFollowDto, sortBy: any, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.userDisagreeModel
      .find(condition)
      .populate({
        path: "user_id",
        options: { strictPopulate: false },
        select: "_id bio description user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active",
        populate: { path: 'user_option_id' }
      })
      .populate({
        path: "partner_id",
        options: { strictPopulate: false },
        select: "_id bio description user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active",
        populate: { path: 'user_option_id' }
      })
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }
}

