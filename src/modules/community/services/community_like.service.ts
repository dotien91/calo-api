import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateCommunityLikeDto } from "../dto/create-community_like.dto";
import { FilterCommunityLikeDto } from "../dto/filter-community_like.dto";
import { UpdateCommunityLikeDto } from "../dto/update-community_like.dto";
import { CommunityLike, CommunityLikeDocument } from "../schemas/community_like.schema";

@Injectable()
export class CommunityLikeService {
  constructor(
    @InjectModel(CommunityLike.name)
    private communityLikeModel: Model<CommunityLikeDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateCommunityLikeDto): Promise<CommunityLike> {
    const createdUser = new this.communityLikeModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: FilterCommunityLikeDto) {
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
  async removeOne(dataToSearch: any): Promise<CommunityLike> {
    return await this.communityLikeModel.findOneAndRemove(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findById(id: string, projection: any): Promise<CommunityLike> {
    if (!id) {
      return null;
    }
    const dataReturn = await this.communityLikeModel.findById(id, projection);
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<CommunityLike[]> {
    return this.communityLikeModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<CommunityLike> {
    if (isWithUser) {
      return await this.communityLikeModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.communityLikeModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async filterByUserId(userId: string, userPartners: string[]): Promise<CommunityLike[]> {
    const condition = { user_id: userId, partner_id: { $in: userPartners } };
    return await this.communityLikeModel.find(condition, {}).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.communityLikeModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateCommunityLikeDto) {
    try {
      if (!dataUpdate.user_id && !dataUpdate.community_id) {
        return null;
      }
      const dataReturn = await this.communityLikeModel.findOneAndUpdate(
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
  async updateWithoutCreate(dataUpdate: UpdateCommunityLikeDto) {
    try {
      if (!dataUpdate.user_id && !dataUpdate.community_id) {
        return null;
      }
      const dataReturn = await this.communityLikeModel.findOneAndUpdate(
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
  public count = async (filter: FilterCommunityLikeDto) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.communityLikeModel.estimatedDocumentCount();
      } else {
        return this.communityLikeModel.countDocuments(condition);
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
    filter: FilterCommunityLikeDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<CommunityLike[]> {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.communityLikeModel
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
  async filterData(
    filter: FilterCommunityLikeDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<CommunityLike[]> {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.communityLikeModel
      .find(condition, projection)
      .populate(
        "user_id",
        "_id user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
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
  async filterShort(
    filter: FilterCommunityLikeDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<CommunityLike[]> {
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
    const dataReturn: any = await this.communityLikeModel
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
  async filterWithId(filter: FilterCommunityLikeDto, page: number, limit: number): Promise<CommunityLike[]> {
    const condition = await this.getCondition(filter);
    const sortObject: any = { _id: -1 };
    const dataReturn = await this.communityLikeModel
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
  async filterUser(filter: FilterCommunityLikeDto, sortBy: any, page: number, limit: number) {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.communityLikeModel
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
}
