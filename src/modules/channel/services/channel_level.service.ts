import { Injectable } from "@nestjs/common";
import { ChannelLevel, ChannelLevelDocument } from "../schemas/channel_level.schema";
import { CreateChannelLevelDto } from "../dto/create-channel_level.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UpdateChannelLevelDto } from "../dto/update-channel_level.dto";
import { FilterModuleChannelDto } from "../dto/filter-module_channel.dto";

@Injectable()
export class ChannelLevelService {
  constructor(
    @InjectModel(ChannelLevel.name)
    private channelLevelModel: Model<ChannelLevelDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateChannelLevelDto): Promise<ChannelLevel> {
    const createdUser = new this.channelLevelModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: FilterModuleChannelDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.channel_role) {
      condition = Object.assign(condition, { channel_role: filter.channel_role });
    }
    if (filter.user_ids) {
      condition = Object.assign(condition, { user_id: { $in: filter.user_ids } });
    }
    if (filter.channel_ids) {
      condition = Object.assign(condition, { channel_id: { $in: filter.channel_ids } });
    }
    if (filter.unset) {
      condition = Object.assign(condition, { channel_id: { $nin: filter.unset } });
    }
    if (filter.channel_id) {
      condition = Object.assign(condition, { channel_id: filter.channel_id });
    }
    if (filter.parent_id) {
      condition = Object.assign(condition, { parent_id: filter.parent_id });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async removeOne(dataToSearch: any): Promise<ChannelLevel> {
    return await this.channelLevelModel.findOneAndRemove(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findById(id: string, projection: any): Promise<ChannelLevel> {
    if (!id) {
      return null;
    }
    let dataReturn = await this.channelLevelModel.findById(id, projection);
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<ChannelLevel[]> {
    return this.channelLevelModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<ChannelLevel> {
    if (isWithUser) {
      return await this.channelLevelModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.channelLevelModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async filterByUserId(userId: string, userPartners: string[]): Promise<ChannelLevel[]> {
    let condition = { user_id: userId, partner_id: { $in: userPartners } };
    return await this.channelLevelModel.find(condition, {}).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.channelLevelModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateChannelLevelDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.channelLevelModel.findOneAndUpdate(
        { _id: dataUpdate._id },
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
  async updateWithoutCreate(dataUpdate: UpdateChannelLevelDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.channelLevelModel.findOneAndUpdate({ _id: dataUpdate._id }, { $set: dataUpdate });
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
  public count = async (filter: FilterModuleChannelDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.channelLevelModel.estimatedDocumentCount();
      } else {
        return this.channelLevelModel.countDocuments(condition);
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
  async filter(
    filter: FilterModuleChannelDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<ChannelLevel[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.channelLevelModel
      .find(condition, projection)
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
  async filterChannel(
    filter: FilterModuleChannelDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<ChannelLevel[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataPopulate = {
      path: "channel_id",
      options: { strictPopulate: false },
      populate: [
        {
          path: "media_id",
        },
        {
          path: "ref_id",
        },
      ],
    };
    let dataReturn: any = await this.channelLevelModel
      .find(condition, projection)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate(dataPopulate)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    if (dataReturn && dataReturn?.length) {
      let dataFinalToReturn = [];
      for (let dataItem of dataReturn) {
        let dataItemToReturn = { ...dataItem?.toObject(), ...dataItem.channel_id?.toObject() };
        delete dataItemToReturn.channel_id;
        dataFinalToReturn.push(dataItemToReturn);
      }
      return dataFinalToReturn;
    } else {
      return [];
    }
  }

  /**
   *
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filterWithId(filter: FilterModuleChannelDto, page: number, limit: number): Promise<ChannelLevel[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any = { _id: -1 };
    let dataReturn = await this.channelLevelModel
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
  async filterUser(filter: FilterModuleChannelDto, sortBy: any, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.channelLevelModel
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

  /**
   * @author Tony Vu
   * @param dataFilter
   * @returns
   */
  async updateCount(dataFilter: any, dataUpdate: any) {
    try {
      let dataReturn: any = this.channelLevelModel.findByIdAndUpdate(
        dataFilter._id,
        { $inc: dataUpdate },
        { new: true }
      );
      return dataReturn;
    } catch (e) {
      return null;
    }
  }
}
