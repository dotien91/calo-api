import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { SearchSubscribeDto } from "../dto/search-subscribe.dto";
import { SortBySubscribeDto } from "../dto/sort_by-subscribe.dto";
import { Subscribe, SubscribeDocument } from "../schemas/subscribe.schema";
@Injectable()
export class SubscribeService {
  constructor(
    @InjectModel(Subscribe.name)
    private appSubscribeModel: Model<SubscribeDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchSubscribeDto) {
    let condition: any = {};
    if (!filter.is_admin && !filter.is_expired) {
      const dateToCompare = new Date();
      condition = Object.assign(condition, { end_at: { $gte: dateToCompare } });
    }

    if (filter.is_expired) {
      const dateToCompare = new Date();
      condition = Object.assign(condition, { end_at: { $lt: dateToCompare } });
    }

    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }

    if (filter.channel_id) {
      condition = Object.assign(condition, { channel_id: filter.channel_id });
    }

    if (filter.service_name) {
      condition = Object.assign(condition, { service_name: filter.service_name });
    }
    if (filter.service_id) {
      condition = Object.assign(condition, { service_id: filter.service_id });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortBySubscribeDto) {
    let sort = { priority: -1 };
    if (sortBy.createdAt) {
      sort = Object.assign(sort, { _id: sortBy.createdAt === "DESC" ? -1 : 1 });
    } else {
      sort = Object.assign(sort, { _id: -1 });
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
  async filter(filter: SearchSubscribeDto, sortBy: SortBySubscribeDto, page: number, limit: number) {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }

    const populateObject = {
      path: "plan_id",
      options: { strictPopulate: false },
      populate: {
        path: "ref_id",
        options: { strictPopulate: false },
        populate: {
          path: "avatar",
        },
      },
    };
    const populateObjectService = {
      path: "service_id",
      select: "title _id",
    };
    const dataReturn = await this.appSubscribeModel
      .find(condition)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate(populateObject)
      .populate(populateObjectService)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  public count = async (filter: SearchSubscribeDto) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.appSubscribeModel.estimatedDocumentCount();
      } else {
        return this.appSubscribeModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: any): Promise<Subscribe> {
    const createdUser = new this.appSubscribeModel(createUser);
    return await createdUser.save();
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<Subscribe[]> {
    return this.appSubscribeModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<Subscribe> {
    return await this.appSubscribeModel.findOne(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<Subscribe> {
    if (!id) {
      return null;
    }
    const objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    const populateObject = {
      path: "plan_id",
      populate: {
        path: "ref_id",
        populate: {
          path: "avatar",
        },
      },
    };
    return await this.appSubscribeModel
      .findById(objectId)
      .populate(
        "user_id",
        "_id user_login display_name user_role user_status user_avatar_thumbnail user_avatar last_active user_active"
      )
      .populate(populateObject)
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.appSubscribeModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: any) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      const dataReturn = await this.appSubscribeModel.findByIdAndUpdate(
        dataUpdate._id,
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
}
