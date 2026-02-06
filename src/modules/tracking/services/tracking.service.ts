import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateTrackingDto } from "../dto/create-tracking.dto";
import { SearchTrackingDto } from "../dto/search-tracking.dto";
import { SortByTrackingDto } from "../dto/sort_by-tracking.dto";
import { Tracking, TrackingDocument } from "../schemas/tracking.schema";

@Injectable()
export class TrackingService {
  constructor(
    @InjectModel(Tracking.name)
    private trackingModel: Model<TrackingDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchTrackingDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.type) {
      condition = Object.assign(condition, { type: filter.type });
    }
    if (filter.metric) {
      condition = Object.assign(condition, { metric: filter.metric });
    }
    if (filter.tracked_from || filter.tracked_to) {
      const trackedAtCond: any = {};
      if (filter.tracked_from) trackedAtCond.$gte = filter.tracked_from;
      if (filter.tracked_to) trackedAtCond.$lte = filter.tracked_to;
      condition = Object.assign(condition, { tracked_at: trackedAtCond });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByTrackingDto) {
    let sort = { _id: -1 };
    if (sortBy.createdAt) {
      sort = Object.assign(sort, { _id: sortBy.createdAt === "DESC" ? -1 : 1 });
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
  async filter(filter: SearchTrackingDto, sortBy: SortByTrackingDto, page: number, limit: number) {
    const condition = await this.getCondition(filter);
    let sortObject: any = { _id: -1 };
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.trackingModel
      .find(condition)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
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
   * @returns
   */
  public count = async (filter: SearchTrackingDto) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.trackingModel.estimatedDocumentCount();
      } else {
        return this.trackingModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };

  /**
   * @author Tony Vu
   * @param createData
   * @returns
   */
  async create(createData: CreateTrackingDto) {
    const createdTracking = new this.trackingModel(createData);
    return await createdTracking.save();
  }
}
