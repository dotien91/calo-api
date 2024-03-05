import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateCallkitDto } from "../dto/create-callkit.dto";
import { SearchCallkitDto } from "../dto/search-callkit.dto";
import { SortByCallkitDto } from "../dto/sort_by-callkit.dto";
import { UpdateCallkitDto } from "../dto/update-callkit.dto";
import { Callkit, CallkitDocument } from "../schemas/callkit.schema";

@Injectable()
export class CallkitService {
  constructor(
    @InjectModel(Callkit.name)
    private CallkitModel: Model<CallkitDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchCallkitDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.partner_id) {
      condition = Object.assign(condition, { partner_id: filter.partner_id });
    }
    if (filter.room_name) {
      condition = Object.assign(condition, { room_name: filter.room_name });
    }
    if (filter.from_id) {
      condition = Object.assign(condition, { $or: [{ partner_id: filter.from_id }, { user_id: filter.from_id }] });
    }
    if (filter.from_time) {
      const dateFrom = new Date(filter.from_time);
      condition = Object.assign(condition, { createdAt: { $gte: dateFrom } });
    }
    if (filter.start_time) {
      condition = Object.assign(condition, { start_time: filter.start_time });
    }
    if (filter.call_time) {
      condition = Object.assign(condition, { call_time: filter.call_time });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByCallkitDto) {
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
  async filter(filter: SearchCallkitDto, sortBy: SortByCallkitDto, page: number, limit: number) {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.CallkitModel.find(condition)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail user_avatar_square last_active user_active"
      )
      .populate(
        "partner_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail user_avatar_square last_active user_active"
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
  public count = async (filter: SearchCallkitDto) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.CallkitModel.estimatedDocumentCount();
      } else {
        return this.CallkitModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateCallkitDto) {
    const createdCallkit = new this.CallkitModel(createUser);
    const dataCreate = await createdCallkit.save();
    return dataCreate;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<Callkit[]> {
    return this.CallkitModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<Callkit> {
    return await this.CallkitModel.findOne(dataToSearch).sort({ _id: -1 }).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<Callkit> {
    if (!id) {
      return null;
    }
    const objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.CallkitModel.findById(objectId)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail user_avatar_square last_active user_active"
      )
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.CallkitModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateCallkitDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      const dataReturn = await this.CallkitModel.findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: true });
      return dataReturn;
    } catch (e) {
      return e;
    }
  }
}
