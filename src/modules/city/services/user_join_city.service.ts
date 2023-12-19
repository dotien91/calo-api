import { Injectable } from "@nestjs/common";
import { UserJoinCity, UserJoinCityDocument } from "../schemas/user_join_city.schema";
import { CreateUserJoinCityDto } from "../dto/create-user_join_city.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UpdateUserJoinCityDto } from "../dto/update-user_join_city.dto";
import { SearchUserJoinCityDto } from "../dto/search-user_join_city.dto";

@Injectable()
export class UserJoinCityService {
  constructor(
    @InjectModel(UserJoinCity.name)
    private userJoinCityModel: Model<UserJoinCityDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateUserJoinCityDto): Promise<UserJoinCity> {
    const createdUser = new this.userJoinCityModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchUserJoinCityDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.city_id) {
      condition = Object.assign(condition, { city_id: filter.city_id });
    }

    return condition;
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findById(id: string, projection: any): Promise<UserJoinCity> {
    if (!id) {
      return null;
    }
    let dataReturn = await this.userJoinCityModel.findById(id, projection);
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<UserJoinCity[]> {
    return this.userJoinCityModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<UserJoinCity> {
    if (isWithUser) {
      return await this.userJoinCityModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.userJoinCityModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async filterByUserId(userId: string, userPartners: string[]): Promise<UserJoinCity[]> {
    let condition = { user_id: userId, city_id: { $in: userPartners } };
    return await this.userJoinCityModel.find(condition, {}).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.userJoinCityModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: SearchUserJoinCityDto) {
    try {
      if (!dataUpdate.user_id && !dataUpdate.city_id) {
        return null;
      }
      let dataReturn = await this.userJoinCityModel.findOneAndUpdate(
        { user_id: dataUpdate.user_id, city_id: dataUpdate.city_id },
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
  public count = async (filter: SearchUserJoinCityDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.userJoinCityModel.estimatedDocumentCount();
      } else {
        return this.userJoinCityModel.countDocuments(condition);
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
  async filter(filter: SearchUserJoinCityDto, sortBy: any, page: number, limit: number): Promise<UserJoinCity[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.userJoinCityModel
      .find(condition)
      .populate({
        path: "city_id",
        options: { strictPopulate: false },
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
  async filterUser(filter: SearchUserJoinCityDto, sortBy: any, page: number, limit: number): Promise<UserJoinCity[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.userJoinCityModel
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
