import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateShortLikeDto } from "../dto/create-short_like.dto";
import { FilterLikeShortDto } from "../dto/filter-like_short.dto";
import { UpdateShortLikeDto } from "../dto/update-short_like.dto";
import { ShortLike, ShortLikeDocument } from "../schemas/short_like.schema";

@Injectable()
export class ShortLikeService {
  constructor(
    @InjectModel(ShortLike.name)
    private shortLikeModel: Model<ShortLikeDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateShortLikeDto): Promise<ShortLike> {
    const createdUser = new this.shortLikeModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: FilterLikeShortDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.user_ids) {
      condition = Object.assign(condition, { user_id: { $in: filter.user_ids } });
    }
    if (filter.video_ids) {
      condition = Object.assign(condition, { video_id: { $in: filter.video_ids } });
    }
    if (filter.unset) {
      condition = Object.assign(condition, { video_id: { $nin: filter.unset } });
    }
    if (filter.video_id) {
      condition = Object.assign(condition, { video_id: filter.video_id });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async removeOne(dataToSearch: any): Promise<ShortLike> {
    return await this.shortLikeModel.findOneAndRemove(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findById(id: string, projection: any): Promise<ShortLike> {
    if (!id) {
      return null;
    }
    let dataReturn = await this.shortLikeModel.findById(id, projection);
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<ShortLike[]> {
    return this.shortLikeModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<ShortLike> {
    if (isWithUser) {
      return await this.shortLikeModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.shortLikeModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async filterByUserId(userId: string, userPartners: string[]): Promise<ShortLike[]> {
    let condition = { user_id: userId, partner_id: { $in: userPartners } };
    return await this.shortLikeModel.find(condition, {}).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.shortLikeModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateShortLikeDto) {
    try {
      if (!dataUpdate.user_id && !dataUpdate.video_id) {
        return null;
      }
      let dataReturn = await this.shortLikeModel.findOneAndUpdate(
        { user_id: dataUpdate.user_id, video_id: dataUpdate.video_id },
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
  async updateWithoutCreate(dataUpdate: UpdateShortLikeDto) {
    try {
      if (!dataUpdate.user_id && !dataUpdate.video_id) {
        return null;
      }
      let dataReturn = await this.shortLikeModel.findOneAndUpdate(
        { user_id: dataUpdate.user_id, video_id: dataUpdate.video_id },
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
  public count = async (filter: FilterLikeShortDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.shortLikeModel.estimatedDocumentCount();
      } else {
        return this.shortLikeModel.countDocuments(condition);
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
    filter: FilterLikeShortDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<ShortLike[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.shortLikeModel
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
    filter: FilterLikeShortDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<ShortLike[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataPopulate = {
      path: "video_id",
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
    let dataReturn: any = await this.shortLikeModel
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
        let dataItemToReturn = { ...dataItem?.toObject(), ...dataItem.video_id?.toObject() };
        delete dataItemToReturn.video_id;
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
  async filterWithId(filter: FilterLikeShortDto, page: number, limit: number): Promise<ShortLike[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any = { _id: -1 };
    let dataReturn = await this.shortLikeModel
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
  async filterUser(filter: FilterLikeShortDto, sortBy: any, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.shortLikeModel
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
