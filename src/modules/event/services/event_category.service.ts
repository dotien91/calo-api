import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateEventTypeDto } from "../dto/create.event_type.dto";
import { SearchEventTypeDto } from "../dto/search.event_type.dto";
import { SortByEventDto } from "../dto/sort_by-event.dto";
import { UpdateEventTypeDto } from "../dto/update.event_type.dto";
import { EventCategory, EventCategoryDocument } from "../schemas/event_category.schema";

@Injectable()
export class EventCategoryService {
  constructor(
    @InjectModel(EventCategory.name)
    private eventCategoryModel: Model<EventCategoryDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateEventTypeDto): Promise<EventCategory> {
    const createdUser = new this.eventCategoryModel(createUser);
    return await createdUser.save();
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<EventCategory[]> {
    return this.eventCategoryModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchEventTypeDto) {
    const condition: any = {};
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByEventDto) {
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
  async filter(filter: SearchEventTypeDto, sortBy: SortByEventDto, page: number, limit: number) {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.eventCategoryModel
      .find(condition)
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
  public count = async (filter: SearchEventTypeDto) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.eventCategoryModel.estimatedDocumentCount();
      } else {
        return this.eventCategoryModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<EventCategory> {
    return await this.eventCategoryModel.findOne(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<EventCategory> {
    if (!id) {
      return null;
    }
    const objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.eventCategoryModel.findById(objectId).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.eventCategoryModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateEventTypeDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      const dataReturn = await this.eventCategoryModel.findByIdAndUpdate(
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
