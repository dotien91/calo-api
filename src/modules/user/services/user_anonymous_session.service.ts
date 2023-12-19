import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateUserAnonymousSessionDto } from "../dto/create-user_anonymous_session.dto";
import { SortByUserAnonymousSessionDto } from "../dto/sort_by-user_anonymous_session.dto";
import { UserAnonymousSessionFilterDto } from "../dto/user_anonymous_session_filter.dto";
import { UserAnonymousSession, UserAnonymousSessionDocument } from "../schemas/user_anonymous_session.schema";

@Injectable()
export class UserAnonymousSessionService {
  constructor(
    @InjectModel(UserAnonymousSession.name)
    private userAnonymousSession: Model<UserAnonymousSessionDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateUserAnonymousSessionDto): Promise<UserAnonymousSession> {
    const createdUser = new this.userAnonymousSession(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findById(id: string, projection: any): Promise<UserAnonymousSession> {
    if (!id) {
      return null;
    }
    const dataReturn = await this.userAnonymousSession.findById(id, projection);
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<UserAnonymousSession[]> {
    return this.userAnonymousSession.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<UserAnonymousSession> {
    if (isWithUser) {
      return await this.userAnonymousSession.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.userAnonymousSession.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: UserAnonymousSessionFilterDto) {
    let condition: any = {};
    if (filter.device_id) {
      condition = Object.assign(condition, { device_id: filter.device_id });
    }

    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByUserAnonymousSessionDto) {
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
    filter: UserAnonymousSessionFilterDto,
    sortBy: SortByUserAnonymousSessionDto,
    page: number,
    limit: number
  ): Promise<UserAnonymousSession[]> {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.userAnonymousSession
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
    return await this.userAnonymousSession.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async removeByUserId(id: string) {
    return await this.userAnonymousSession.deleteMany({ user_id: id }).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: CreateUserAnonymousSessionDto) {
    try {
      if (!dataUpdate.device_id) {
        return null;
      }
      const dataReturn = await this.userAnonymousSession.findOneAndUpdate(
        { device_id: dataUpdate.device_id },
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
    return await this.userAnonymousSession
      .deleteMany({ apple_signature: appleSignature, _id: { $ne: sessionId } })
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async removeByAppleNotification(appleNotification: string, sessionId: string) {
    return await this.userAnonymousSession
      .deleteMany({ apple_notification: appleNotification, _id: { $ne: sessionId } })
      .exec();
  }
}
