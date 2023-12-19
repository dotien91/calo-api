import { Injectable } from "@nestjs/common";
import { CreatePlanDto } from "../dto/create-plan.dto";
import { Plan, PlanDocument } from "../schemas/plan.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UpdatePlanDto } from "../dto/update-plan.dto";
import { SearchPlanDto } from "../dto/search-plan.dto";
import { SortByPlanDto } from "../dto/sort_by-plan.dto";
@Injectable()
export class PlanService {
  constructor(
    @InjectModel(Plan.name)
    private planModel: Model<PlanDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchPlanDto) {
    let condition: any = {};
    if (filter.country) {
      condition = Object.assign(condition, { country: filter.country });
    }
    if (filter.version) {
      condition = Object.assign(condition, { version: filter.version });
    }

    if (filter.service_id) {
      condition = Object.assign(condition, { service_id: filter.service_id });
    }

    if (filter.service_name) {
      condition = Object.assign(condition, { handle: filter.service_name });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<Plan> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.planModel.findById(objectId).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findByIdPopulate(id: string): Promise<Plan> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.planModel.findById(objectId).populate("service_id").exec();
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByPlanDto) {
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
  async filter(filter: SearchPlanDto, sortBy: SortByPlanDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.planModel
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
  public count = async (filter: SearchPlanDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.planModel.estimatedDocumentCount();
      } else {
        return this.planModel.countDocuments(condition);
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
  async create(createUser: CreatePlanDto): Promise<Plan> {
    const createdUser = new this.planModel(createUser);
    return await createdUser.save();
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<Plan[]> {
    return this.planModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<Plan> {
    return await this.planModel.findOne(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.planModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdatePlanDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.planModel.findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: false });
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
