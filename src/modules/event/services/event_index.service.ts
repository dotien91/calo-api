import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateEventIndexDto } from "../dto/create.event_index.dto";
import { SearchEventIndexDto } from "../dto/search.event_index.dto";
import { SortByEventDto } from "../dto/sort_by-event.dto";
import { UpdateEventIndexDto } from "../dto/update.event_index.dto";
import { EventIndex, EventIndexDocument } from "../schemas/event_index.schema";

@Injectable()
export class EventIndexService {
  constructor(
    @InjectModel(EventIndex.name)
    private eventTypeModel: Model<EventIndexDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateEventIndexDto): Promise<EventIndex> {
    const createdUser = new this.eventTypeModel(createUser);
    return await createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchEventIndexDto) {
    let condition: any = {};
    if (filter?.event_id) {
      condition = Object.assign(condition, { event_id: filter?.event_id });
    }
    if (filter.date) {
      if (filter.date.indexOf(",") !== -1) {
        const dataObject = filter.date?.split(",");
        if (dataObject && dataObject[0] && dataObject[1]) {
          const startDateObject = new Date(dataObject[0]);
          const endDateObject = new Date(dataObject[1]);
          condition = Object.assign(condition, { event_date: { $gte: startDateObject, $lte: endDateObject } });
        }
      }
    }
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
  async filter(filter: SearchEventIndexDto, sortBy: SortByEventDto, page: number, limit: number) {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.eventTypeModel
      .find(condition, { event_date: true, event_id: true })
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
  public count = async (filter: SearchEventIndexDto) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.eventTypeModel.estimatedDocumentCount();
      } else {
        return this.eventTypeModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<EventIndex[]> {
    return this.eventTypeModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<EventIndex> {
    return await this.eventTypeModel.findOne(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async removeOne(dataToSearch: any): Promise<any> {
    return await this.eventTypeModel.findOneAndDelete(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<EventIndex> {
    if (!id) {
      return null;
    }
    const objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.eventTypeModel.findById(objectId).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.eventTypeModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateEventIndexDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      const dataReturn = await this.eventTypeModel.findByIdAndUpdate(
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
