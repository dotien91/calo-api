import { Injectable } from "@nestjs/common";
import { LivestreamComment, LivestreamCommentDocument } from "../schemas/livestream_comment.schema";
import { CreateLivestreamCommentWithMediaDto } from "../dto/create-livestream_comment.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UpdateLivestreamCommentDto } from "../dto/update-livestream_comment.dto";
import { FilterLivestreamCommentDto } from "../dto/filter-comment_livestream.dto";
import { ObjectId } from "mongodb";

@Injectable()
export class LivestreamCommentService {
  constructor(
    @InjectModel(LivestreamComment.name)
    private livestreamLikeModel: Model<LivestreamCommentDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateLivestreamCommentWithMediaDto) {
    const createdUser = new this.livestreamLikeModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: FilterLivestreamCommentDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.livestream_id) {
      condition = Object.assign(condition, { livestream_id: filter.livestream_id });
    }
    if (filter.from_id || filter.to_id) {
      let dataFilter = {};
      if (filter.from_id) {
        let objectIdFrom = new ObjectId(filter?.from_id);
        dataFilter = { ...dataFilter, ...{ $gt: objectIdFrom } };
      }
      if (filter.to_id) {
        let objectIdTo = new ObjectId(filter?.to_id);
        dataFilter = { ...dataFilter, ...{ $lt: objectIdTo } };
      }
      condition = Object.assign(condition, { _id: dataFilter });
    }

    if (filter.search) {
      condition = Object.assign(condition, { $text: { $search: filter.search } });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async removeOne(dataToSearch: any): Promise<LivestreamComment> {
    return await this.livestreamLikeModel.findOneAndRemove(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findById(id: string, projection: any): Promise<LivestreamComment> {
    if (!id) {
      return null;
    }
    let dataReturn = await this.livestreamLikeModel.findById(id, projection);
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<LivestreamComment[]> {
    return this.livestreamLikeModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<LivestreamComment> {
    if (isWithUser) {
      return await this.livestreamLikeModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.livestreamLikeModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async filterByUserId(userId: string, userPartners: string[]): Promise<LivestreamComment[]> {
    let condition = { user_id: userId, partner_id: { $in: userPartners } };
    return await this.livestreamLikeModel.find(condition, {}).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.livestreamLikeModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateLivestreamCommentDto) {
    try {
      if (!dataUpdate.user_id && !dataUpdate.livestream_id) {
        return null;
      }
      let dataReturn = await this.livestreamLikeModel.findOneAndUpdate(
        { user_id: dataUpdate.user_id, livestream_id: dataUpdate.livestream_id },
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
  async updateWithoutCreate(dataUpdate: UpdateLivestreamCommentDto) {
    try {
      if (!dataUpdate.user_id && !dataUpdate.livestream_id) {
        return null;
      }
      let dataReturn = await this.livestreamLikeModel.findOneAndUpdate(
        { user_id: dataUpdate.user_id, livestream_id: dataUpdate.livestream_id },
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
  public count = async (filter: FilterLivestreamCommentDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.livestreamLikeModel.estimatedDocumentCount();
      } else {
        return this.livestreamLikeModel.countDocuments(condition);
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
    filter: FilterLivestreamCommentDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<LivestreamComment[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    if (filter.search) {
      sortObject = { score: { $meta: "textScore" }, ...sortObject };
      projection = Object.assign(projection, { score: { $meta: "textScore" } });
    }

    let dataReturn = await this.livestreamLikeModel
      .find(condition, projection)
      .populate({
        path: "createBy",
        options: { strictPopulate: false },
        select:
          "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active",
      })
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  /**
   *
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filterWithId(filter: FilterLivestreamCommentDto, page: number, limit: number): Promise<LivestreamComment[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any = { _id: -1 };
    let dataReturn = await this.livestreamLikeModel
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
  async filterUser(filter: FilterLivestreamCommentDto, sortBy: any, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.livestreamLikeModel
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
