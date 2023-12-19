import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateUserBlockDto } from "../dto/create-user_block.dto";
import { FilterBlockDto } from "../dto/filter-block.dto";
import { UpdateUserBlockDto } from "../dto/update-user_block.dto";
import { UserBlock, UserBlockDocument } from "../schemas/user_block.schema";

@Injectable()
export class UserBlockService {
  constructor(
    @InjectModel(UserBlock.name)
    private userBlockModel: Model<UserBlockDocument>
  ) { }

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateUserBlockDto): Promise<UserBlock> {
    const createdUser = new this.userBlockModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: FilterBlockDto) {
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
  async findById(id: string, projection: any): Promise<UserBlock> {
    if (!id) {
      return null;
    }
    const dataReturn = await this.userBlockModel.findById(id, projection);
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<UserBlock[]> {
    return this.userBlockModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<UserBlock> {
    if (isWithUser) {
      return await this.userBlockModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.userBlockModel.findOne(dataToSearch).exec();
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
  async filter(filter: FilterBlockDto, sortBy: any, page: number, limit: number): Promise<UserBlock[]> {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.userBlockModel
      .find(condition)
      .populate({
        path: "partner_id",
        options: { strictPopulate: false },
        select:
          "_id bio description user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      })
      .sort(sortObject)
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
  async filterByUserId(userId: string, userPartners: string[]): Promise<UserBlock[]> {
    const condition = { user_id: userId, partner_id: { $in: userPartners } };
    return await this.userBlockModel.find(condition, {}).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.userBlockModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateUserBlockDto) {
    try {
      if (!dataUpdate.user_id && !dataUpdate.partner_id) {
        return null;
      }
      const dataReturn = await this.userBlockModel.findOneAndUpdate(
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
  public count = async (filter: FilterBlockDto) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.userBlockModel.estimatedDocumentCount();
      } else {
        return this.userBlockModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };
}
