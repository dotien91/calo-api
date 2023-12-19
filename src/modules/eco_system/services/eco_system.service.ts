import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateEcoSystemDto } from "../dto/create-eco_system.dto";
import { SearchEcoSystemDto } from "../dto/search-eco_system.dto";
import { SortByEcoSystemDto } from "../dto/sort_by-eco_system.dto";
import { UpdateEcoSystemDto } from "../dto/update-eco_system.dto";
import { EcoSystem, EcoSystemDocument } from "../schemas/eco_system.schema";

@Injectable()
export class EcoSystemService {
  constructor(
    @InjectModel(EcoSystem.name)
    private ecoSystemModel: Model<EcoSystemDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchEcoSystemDto) {
    let condition: any = {};
    if (filter.id) {
      condition = Object.assign(condition, { id: filter.id });
    }
    if (filter.ids) {
      condition = Object.assign(condition, { id: { $in: filter.ids } });
    }
    if (filter.name) {
      condition = Object.assign(condition, { name: filter.name });
    }
    // if (filter.white_list) {
    //   condition = Object.assign(condition, { white_list: filter.white_list });
    // }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByEcoSystemDto) {
    let sort = { view_count: 1 };
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
  async filter(filter: SearchEcoSystemDto, sortBy: SortByEcoSystemDto, page: number, limit: number) {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.ecoSystemModel
      .find(condition)
      .sort(sortObject)
      .populate("public_album")
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
  public count = async (filter: SearchEcoSystemDto) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.ecoSystemModel.estimatedDocumentCount();
      } else {
        return this.ecoSystemModel.countDocuments(condition);
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
  async create(createUser: CreateEcoSystemDto) {
    const createdEcoSystem = new this.ecoSystemModel(createUser);
    const dataCreate = await createdEcoSystem.save();
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
  async findAll(dataToSearch?: any): Promise<EcoSystem[]> {
    return this.ecoSystemModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<EcoSystem> {
    return await this.ecoSystemModel.findOne(dataToSearch).sort({ _id: -1 }).populate("public_album").exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<EcoSystem> {
    if (!id) {
      return null;
    }
    const objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.ecoSystemModel.findById(objectId).populate("public_album").exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.ecoSystemModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataFilter
   * @returns
   */
  async updateCount(dataFilter: any, dataUpdate: any) {
    try {
      return this.ecoSystemModel.updateMany(dataFilter, { $inc: dataUpdate });
    } catch (e) {
      return null;
    }
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateEcoSystemDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      const dataReturn = await this.ecoSystemModel.findByIdAndUpdate(
        dataUpdate._id,
        { $set: dataUpdate },
        { new: false }
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
