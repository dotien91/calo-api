import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateCommunityPollDto } from "../dto/create-community_poll.dto";
import { FilterCommunityPollDto } from "../dto/filter-community_poll.dto";
import { UpdateCommunityPollDto } from "../dto/update-community_poll.dto";
import { CommunityPoll, CommunityPollDocument } from "../schemas/community_poll.schema";

@Injectable()
export class CommunityPollService {
  constructor(
    @InjectModel(CommunityPoll.name)
    private communityPollModel: Model<CommunityPollDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateCommunityPollDto): Promise<CommunityPoll> {
    const createdUser = new this.communityPollModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: FilterCommunityPollDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.user_ids) {
      condition = Object.assign(condition, { user_id: { $in: filter.user_ids } });
    }
    if (filter.community_ids) {
      condition = Object.assign(condition, { community_id: { $in: filter.community_ids } });
    }
    if (filter.unset) {
      condition = Object.assign(condition, { community_id: { $nin: filter.unset } });
    }
    if (filter.community_id) {
      condition = Object.assign(condition, { community_id: filter.community_id });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async removeOne(dataToSearch: any): Promise<CommunityPoll> {
    return await this.communityPollModel.findOneAndRemove(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findById(id: string, projection: any): Promise<CommunityPoll> {
    if (!id) {
      return null;
    }
    const dataReturn = await this.communityPollModel.findById(id, projection);
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<CommunityPoll[]> {
    return this.communityPollModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<CommunityPoll> {
    if (isWithUser) {
      return await this.communityPollModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.communityPollModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOneWithLimit(query: any, limit: number, page: number, orderBy: any): Promise<CommunityPoll> {
    try {
      let sortObject: any;
      if (orderBy) {
        sortObject = this.getSort(orderBy);
      }

      const dataPopulate = {
        path: "users_choose",
        select:
          "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status",
        options: {
          limit: limit,
          sort: sortObject,
          skip: limit * (page - 1),
        },
      };
      return await this.communityPollModel.findById(query.poll_id).populate(dataPopulate).exec();
    } catch (error) {
      return null;
    }
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async filterByUserId(userId: string, userPartners: string[]): Promise<CommunityPoll[]> {
    const condition = { user_id: userId, partner_id: { $in: userPartners } };
    return await this.communityPollModel.find(condition, {}).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.communityPollModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateCommunityPollDto) {
    try {
      if (!dataUpdate.user_id && !dataUpdate.community_id) {
        return null;
      }
      const dataReturn = await this.communityPollModel.findOneAndUpdate(
        { user_id: dataUpdate.user_id, community_id: dataUpdate.community_id },
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
  async updateWithoutCreate(dataUpdate: UpdateCommunityPollDto) {
    try {
      if (!dataUpdate.user_id && !dataUpdate.community_id) {
        return null;
      }
      const dataReturn = await this.communityPollModel.findOneAndUpdate(
        { user_id: dataUpdate.user_id, community_id: dataUpdate.community_id },
        { $set: dataUpdate }
      );
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
  public count = async (filter: FilterCommunityPollDto) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.communityPollModel.estimatedDocumentCount();
      } else {
        return this.communityPollModel.countDocuments(condition);
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
    filter: FilterCommunityPollDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<CommunityPoll[]> {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.communityPollModel
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
  async filterShort(
    filter: FilterCommunityPollDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<CommunityPoll[]> {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataPopulate = {
      path: "community_id",
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
    const dataReturn: any = await this.communityPollModel
      .find(condition, projection)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
      )
      .populate(dataPopulate)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    if (dataReturn && dataReturn?.length) {
      const dataFinalToReturn = [];
      for (const dataItem of dataReturn) {
        const dataItemToReturn = { ...dataItem?.toObject(), ...dataItem.community_id?.toObject() };
        delete dataItemToReturn.community_id;
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
  async filterWithId(filter: FilterCommunityPollDto, page: number, limit: number): Promise<CommunityPoll[]> {
    const condition = await this.getCondition(filter);
    const sortObject: any = { _id: -1 };
    const dataReturn = await this.communityPollModel
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
  async filterUser(filter: FilterCommunityPollDto, sortBy: any, page: number, limit: number) {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.communityPollModel
      .find(condition)
      .populate({
        path: "user_id",
        options: { strictPopulate: false },
        select:
          "_id bio description user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status",
        populate: { path: "user_option_id" },
      })
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  /**
   *
   * @param dataUpdate
   * @returns
   */
  async updateArray(dataUpdate: UpdateCommunityPollDto, isPull: boolean = false) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = null;
      if (dataUpdate._id) {
        const dataId = dataUpdate?._id;
        delete dataUpdate?._id;
        if (isPull) {
          dataReturn = await this.communityPollModel.findOneAndUpdate(
            { _id: dataId },
            {
              //@ts-ignore
              $pull: dataUpdate,
            },
            { new: true }
          );
        } else {
          dataReturn = await this.communityPollModel.findOneAndUpdate(
            { _id: dataId },
            {
              //@ts-ignore
              $addToSet: dataUpdate,
            },
            { new: true }
          );
        }
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
   * @param dataFilter
   * @returns
   */
  async updateCount(dataFilter: any, dataUpdate: any) {
    try {
      return this.communityPollModel.findOneAndUpdate(dataFilter, { $inc: dataUpdate });
    } catch (e) {
      return null;
    }
  }
}
