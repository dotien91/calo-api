import { Injectable } from "@nestjs/common";
import { CreateUserSessionDto } from "../dto/create-user_session.dto";
import { UserSession, UserSessionDocument } from "../schemas/user_session.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SortByUserSessionDto } from "../dto/sort_by-user_session.dto";
import { UserSessionFilterDto } from "../dto/user_session_filter.dto";
import { UpdateSessionDto } from "../dto/update-session.dto";

@Injectable()
export class UserSessionService {
  constructor(
    @InjectModel(UserSession.name)
    private userSessionModel: Model<UserSessionDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateUserSessionDto): Promise<UserSession> {
    const createdUser = new this.userSessionModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findById(id: string, projection: any): Promise<UserSession> {
    if (!id) {
      return null;
    }
    let dataReturn = await this.userSessionModel.findById(id, projection);
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<UserSession[]> {
    return this.userSessionModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<UserSession> {
    if (isWithUser) {
      return await this.userSessionModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.userSessionModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: UserSessionFilterDto) {
    let condition: any = {};
    if (filter.user_id) {
      if (filter.user_id.indexOf(",") !== -1) {
        let dataUserArray = filter.user_id.split(",");
        condition = Object.assign(condition, { user_id: { $in: dataUserArray } });
      } else {
        condition = Object.assign(condition, { user_id: filter.user_id });
      }
    }

    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByUserSessionDto) {
    let sort = { priority: -1 };
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
    filter: UserSessionFilterDto,
    sortBy: SortByUserSessionDto,
    page: number,
    limit: number
  ): Promise<UserSession[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.userSessionModel
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
    return await this.userSessionModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async removeByUserId(id: string) {
    return await this.userSessionModel.deleteMany({ user_id: id }).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateSessionDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.userSessionModel.findByIdAndUpdate(
        dataUpdate._id,
        { $set: dataUpdate },
        { new: false }
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
   * @param id
   * @returns
   */
  async removeByAppleSignature(appleSignature: string, sessionId: string) {
    return await this.userSessionModel.deleteMany({ apple_signature: appleSignature, _id: { $ne: sessionId } }).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async removeByAppleNotification(appleNotification: string, sessionId: string) {
    return await this.userSessionModel
      .deleteMany({ apple_notification: appleNotification, _id: { $ne: sessionId } })
      .exec();
  }
}
