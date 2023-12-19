import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateEventRatingDto } from "../dto/create.event_rating.dto";
import { SearchMyEventRatingDto } from "../dto/search.my_event_rating.dto";
import { SortByMyEventRatingDto } from "../dto/sort_by-my_event_rating.dto";
import { UpdateEventRatingDto } from "../dto/update.event_rating.dto";
import { EventRating, EventRatingDocument } from "../schemas/event_rating.schema";

@Injectable()
export class EventRatingService {
  constructor(
    @InjectModel(EventRating.name)
    private eventRatingModel: Model<EventRatingDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateEventRatingDto): Promise<EventRating> {
    const createdUser = new this.eventRatingModel(createUser);
    return await createdUser.save();
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<EventRating[]> {
    return this.eventRatingModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<EventRating> {
    return await this.eventRatingModel.findOne(dataToSearch).populate("rating_media").exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<EventRating> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.eventRatingModel.findById(objectId).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.eventRatingModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateEventRatingDto) {
    try {
      if (!dataUpdate.event_id || !dataUpdate.user_id) {
        return null;
      }
      let dataReturn = await this.eventRatingModel.findOneAndUpdate(
        {
          event_id: dataUpdate.event_id,
          user_id: dataUpdate.user_id,
        },
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
  async getCondition(filter: SearchMyEventRatingDto) {
    let condition: any = {};
    if (filter.event_id) {
      condition = Object.assign(condition, { event_id: filter.event_id });
    }
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByMyEventRatingDto) {
    let sort = { priority: -1 };
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
  async filter(filter: SearchMyEventRatingDto, sortBy: SortByMyEventRatingDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.eventRatingModel
      .find(condition)
      .populate("rating_media")
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
  public count = async (filter: SearchMyEventRatingDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.eventRatingModel.estimatedDocumentCount();
      } else {
        return this.eventRatingModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };
}
