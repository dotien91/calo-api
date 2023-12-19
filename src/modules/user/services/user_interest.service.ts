import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateUserInterestDto } from "../dto/create-user_interest.dto";
import { SearchUserInterestDto } from "../dto/search-user_interest.dto";
import { UpdateUserInterestDto } from "../dto/update-user_interest.dto";
import { UserInterest, UserInterestDocument } from "../schemas/user_interest.schema";

@Injectable()
export class UserInterestService {
  constructor(
    @InjectModel(UserInterest.name)
    private userInterestModel: Model<UserInterestDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateUserInterestDto): Promise<UserInterest> {
    const createdUser = new this.userInterestModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchUserInterestDto) {
    let condition: any = {};
    if (filter.parent_id) {
      condition = Object.assign(condition, { parent_id: filter.parent_id });
    }
    if (filter.is_parent) {
      condition = Object.assign(condition, { parent_id: null });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findById(id: string, projection: any): Promise<UserInterest> {
    if (!id) {
      return null;
    }
    const dataReturn = await this.userInterestModel.findById(id, projection);
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<UserInterest[]> {
    return this.userInterestModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: SearchUserInterestDto, isWithUser: boolean = false): Promise<UserInterest> {
    if (isWithUser) {
      return await this.userInterestModel
        .findOne(dataToSearch)
        .populate("parent_id")
        .populate("cover")
        .populate("cover")
        .exec();
    } else {
      return await this.userInterestModel.findOne(dataToSearch).exec();
    }
  }

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
  async filter(filter: SearchUserInterestDto, sortBy: any, page: number, limit: number): Promise<UserInterest[]> {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
      sortObject = Object.assign(sortObject, { priority: -1 });
    }
    const dataReturn = await this.userInterestModel
      .find(condition)
      .sort(sortObject)
      .populate("parent_id")
      .populate("cover")
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async filterByUserId(userId: string, userPartners: string[]): Promise<UserInterest[]> {
    const condition = { user_id: userId, partner_id: { $in: userPartners } };
    return await this.userInterestModel.find(condition, {}).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.userInterestModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateUserInterestDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      const dataReturn = await this.userInterestModel.findOneAndUpdate(
        { _id: dataUpdate._id },
        { $set: dataUpdate },
        { new: true, setDefaultsOnInsert: true }
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
   * @param dataFilter
   * @returns
   */
  async updatePriority(ids: any[]) {
    try {
      return this.userInterestModel.updateMany({ _id: { $in: ids } }, { $inc: { priority: 1 } }, { new: true });
    } catch (e) {
      return null;
    }
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  public count = async (filter: SearchUserInterestDto) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.userInterestModel.estimatedDocumentCount();
      } else {
        return this.userInterestModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };
}
