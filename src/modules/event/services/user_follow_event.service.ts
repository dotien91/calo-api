import { Injectable } from "@nestjs/common";
import { UserFollowEvent, UserFollowEventDocument } from "../schemas/user_follow_event.schema";
import { CreateUserFollowEventDto } from "../dto/create-user_follow_event.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UpdateUserFollowEventDto } from "../dto/update-user_follow_event.dto";
import { FilterFollowEventDto } from "../dto/filter-follow_event.dto";

@Injectable()
export class UserFollowEventService {
  constructor(
    @InjectModel(UserFollowEvent.name)
    private userFollowModel: Model<UserFollowEventDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateUserFollowEventDto): Promise<UserFollowEvent> {
    const createdUser = new this.userFollowModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: FilterFollowEventDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.event_id) {
      condition = Object.assign(condition, { event_id: filter.event_id });
    }

    if (filter.event_ids) {
      condition = Object.assign(condition, { event_id: {$in: filter.event_ids} });
    }

    return condition;
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findById(id: string, projection: any): Promise<UserFollowEvent> {
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
  async findAll(): Promise<UserFollowEvent[]> {
    return this.userFollowModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<UserFollowEvent> {
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
   async filterByUserId(userId: string, userPartners: string[]): Promise<UserFollowEvent[]> {
    let condition = { user_id: userId, event_id: { $in: userPartners }};
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
  async update(dataUpdate: UpdateUserFollowEventDto) {
    try {
      if (!dataUpdate.user_id && !dataUpdate.event_id) {
        return null;
      }
      let dataReturn = await this.userFollowModel.findOneAndUpdate(
        { user_id: dataUpdate.user_id, event_id: dataUpdate.event_id },
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
  public count = async (filter: FilterFollowEventDto) => {
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
  async filter(filter: FilterFollowEventDto, sortBy: any, page: number, limit: number): Promise<UserFollowEvent[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.userFollowModel
      .find(condition)
      .populate({
        path: "event_id",
        options: { strictPopulate: false },
        populate: [
          {
            path:"public_album"
          }
        ]
      })
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
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
   async filterUser(filter: FilterFollowEventDto, sortBy: any, page: number, limit: number): Promise<UserFollowEvent[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.userFollowModel
      .find(condition)
      .populate({
        path: "user_id",
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

