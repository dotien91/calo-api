import { Injectable } from "@nestjs/common";
import { RequestLike, RequestLikeDocument } from "../schemas/request_like.schema";
import { CreateRequestLikeDto } from "../dto/create-request_like.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FilterRequestLikeDto } from "../dto/filter-request_like.dto";
import { UpdateRequestLikeDto } from "../dto/update-request_like.dto";

@Injectable()
export class RequestLikeService {
  constructor(
    @InjectModel(RequestLike.name)
    private requestLikeModel: Model<RequestLikeDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateRequestLikeDto): Promise<RequestLike> {
    const createdUser = new this.requestLikeModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: FilterRequestLikeDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.user_ids) {
      condition = Object.assign(condition, { user_id: { $in: filter.user_ids } });
    }
    if (filter.request_ids) {
      condition = Object.assign(condition, { request_id: { $in: filter.request_ids } });
    }
    if (filter.unset) {
      condition = Object.assign(condition, { request_id: { $nin: filter.unset } });
    }
    if (filter.request_id) {
      condition = Object.assign(condition, { request_id: filter.request_id });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async removeOne(dataToSearch: any): Promise<RequestLike> {
    return await this.requestLikeModel.findOneAndRemove(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findById(id: string, projection: any): Promise<RequestLike> {
    if (!id) {
      return null;
    }
    let dataReturn = await this.requestLikeModel.findById(id, projection);
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<RequestLike[]> {
    return this.requestLikeModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<RequestLike> {
    if (isWithUser) {
      return await this.requestLikeModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.requestLikeModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async filterByUserId(userId: string, userPartners: string[]): Promise<RequestLike[]> {
    let condition = { user_id: userId, partner_id: { $in: userPartners } };
    return await this.requestLikeModel.find(condition, {}).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.requestLikeModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateRequestLikeDto) {
    try {
      if (!dataUpdate.user_id && !dataUpdate.request_id) {
        return null;
      }
      let dataReturn = await this.requestLikeModel.findOneAndUpdate(
        { user_id: dataUpdate.user_id, request_id: dataUpdate.request_id },
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
  async updateWithoutCreate(dataUpdate: UpdateRequestLikeDto) {
    try {
      if (!dataUpdate.user_id && !dataUpdate.request_id) {
        return null;
      }
      let dataReturn = await this.requestLikeModel.findOneAndUpdate(
        { user_id: dataUpdate.user_id, request_id: dataUpdate.request_id },
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
  public count = async (filter: FilterRequestLikeDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.requestLikeModel.estimatedDocumentCount();
      } else {
        return this.requestLikeModel.countDocuments(condition);
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
    filter: FilterRequestLikeDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<RequestLike[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.requestLikeModel
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
    filter: FilterRequestLikeDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<RequestLike[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.requestLikeModel
      .find(condition, projection)
      .populate(
        "user_id",
        "_id user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
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
    filter: FilterRequestLikeDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<RequestLike[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataPopulate = {
      path: "request_id",
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
    let dataReturn: any = await this.requestLikeModel
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
        let dataItemToReturn = { ...dataItem?.toObject(), ...dataItem.request_id?.toObject() };
        delete dataItemToReturn.request_id;
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
  async filterWithId(filter: FilterRequestLikeDto, page: number, limit: number): Promise<RequestLike[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any = { _id: -1 };
    let dataReturn = await this.requestLikeModel
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
  async filterUser(filter: FilterRequestLikeDto, sortBy: any, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.requestLikeModel
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
