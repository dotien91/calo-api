import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateClockHistoryDto } from "../dto/create-clock_history.dto";
import { SearchClockHistoryDto } from "../dto/search-clock_history.dto";
import { SortByClockHistoryDto } from "../dto/sort_by-clock_history.dto";
import { UpdateClockHistoryDto } from "../dto/update-clock_history.dto";
import { ClockHistory, ClockHistoryDocument } from "../schemas/clock_history.schema";

@Injectable()
export class ClockHistoryService {
  constructor(
    @InjectModel(ClockHistory.name)
    private orderModel: Model<ClockHistoryDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchClockHistoryDto) {
    let condition: any = {};
    if (filter.clock_id) {
      condition = Object.assign(condition, { clock_id: filter.clock_id });
    }
    if (filter.from && filter.to) {
      const dateFrom = new Date(filter.from);
      const dateTo = new Date(filter.to);
      condition = Object.assign(condition, { createdAt: { $gte: dateFrom, $lte: dateTo } });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByClockHistoryDto) {
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
  async filter(filter: SearchClockHistoryDto, sortBy: SortByClockHistoryDto, page: number, limit: number) {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};

    if (filter.search) {
      sortObject = { score: { $meta: "textScore" }, ...sortObject };
      projection = Object.assign(projection, { score: { $meta: "textScore" } });
    }

    const dataReturn = await this.orderModel
      .find(condition)
      .populate("clock_id")
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
  async filterAdmin(filter: SearchClockHistoryDto, sortBy: SortByClockHistoryDto, page: number, limit: number) {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const projection = {};
    const dataReturn = await this.orderModel
      .find(condition, projection)
      .populate("clock_id")
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
  public count = async (filter: SearchClockHistoryDto) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.orderModel.estimatedDocumentCount();
      } else {
        return this.orderModel.countDocuments(condition);
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
  async create(createUser: CreateClockHistoryDto) {
    const createdClockHistory = new this.orderModel(createUser);
    const dataCreate = await createdClockHistory.save();
    return dataCreate;
  }

  /**
   * @author Tony Vu
   * @param userId
   * @returns boolean
   */
  async isSuperAdmin(userId: string) {
    const superAdmin = process.env.SUPER_ADMIN;
    if (superAdmin) {
      const superAdminArray = superAdmin.split(",");
      if (superAdminArray.indexOf(userId) !== -1) {
        return true;
      }
    }
    return false;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<ClockHistory[]> {
    return this.orderModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<ClockHistory> {
    return await this.orderModel.findOne(dataToSearch).sort({ _id: -1 }).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOneWithOutPopulate(dataToSearch: any): Promise<ClockHistory> {
    return await this.orderModel.findOne(dataToSearch).sort({ _id: -1 }).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<ClockHistory> {
    if (!id) {
      return null;
    }
    const objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.orderModel.findById(objectId).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.orderModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateClockHistoryDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      const dataReturn = await this.orderModel.findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: false });
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
