import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateUserAnonymousDto } from "../dto/create-user_anonymous.dto";
import { SortByUserAnonymousDto } from "../dto/sort_by-user_anonymous.dto";
import { UserAnonymousFilterDto } from "../dto/user_anonymous_filter.dto";
import { UserAnonymous, UserAnonymousDocument } from "../schemas/user_anonymous.schema";

@Injectable()
export class UserAnonymousService {
  constructor(
    @InjectModel(UserAnonymous.name)
    private userAnonymousModel: Model<UserAnonymousDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateUserAnonymousDto): Promise<UserAnonymous> {
    const createdUser = new this.userAnonymousModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findById(id: string, projection: any): Promise<UserAnonymous> {
    if (!id) {
      return null;
    }
    const dataReturn = await this.userAnonymousModel.findById(id, projection);
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<UserAnonymous[]> {
    return this.userAnonymousModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<UserAnonymous> {
    if (isWithUser) {
      return await this.userAnonymousModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.userAnonymousModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: UserAnonymousFilterDto) {
    let condition: any = {};
    if (filter.device_id) {
      condition = Object.assign(condition, { device_id: filter.device_id });
    }
    if (filter?.user_id) {
      if (filter.user_id.indexOf(",") !== -1) {
        const dataUserArray = filter.user_id.split(",");
        condition = Object.assign(condition, { _id: { $in: dataUserArray } });
      } else {
        condition = Object.assign(condition, { _id: filter.user_id });
      }
    }
    if (filter.user_type) {
      if (filter.user_type === "none") {
        condition = Object.assign(condition, { user_type: { $exists: false } });
      } else {
        condition = Object.assign(condition, { user_type: filter.user_type });
      }
    }

    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByUserAnonymousDto) {
    const sort = { priority: -1 };
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
    filter: UserAnonymousFilterDto,
    sortBy: SortByUserAnonymousDto,
    page: number,
    limit: number
  ): Promise<UserAnonymous[]> {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.userAnonymousModel
      .find(condition)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.userAnonymousModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async removeByUserId(id: string): Promise<any> {
    return await this.userAnonymousModel.deleteMany({ user_id: id }).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: CreateUserAnonymousDto) {
    try {
      // if (!dataUpdate.device_id) {
      //   return null;
      // }
      let dataReturn = null;
      if (dataUpdate?._id) {
        dataReturn = await this.userAnonymousModel.findOneAndUpdate(
          { _id: dataUpdate._id },
          { $set: dataUpdate },
          { new: true }
        );
      } else {
        dataReturn = await this.userAnonymousModel.findOneAndUpdate(
          { device_id: dataUpdate.device_id },
          { $set: dataUpdate },
          { new: false }
        );
      }

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
   * @param id
   * @returns
   */
  async removeByAppleSignature(appleSignature: string, sessionId: string): Promise<any> {
    return await this.userAnonymousModel
      .deleteMany({ apple_signature: appleSignature, _id: { $ne: sessionId } })
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async removeByAppleNotification(appleNotification: string, sessionId: string): Promise<any> {
    return await this.userAnonymousModel
      .deleteMany({ apple_notification: appleNotification, _id: { $ne: sessionId } })
      .exec();
  }
}
