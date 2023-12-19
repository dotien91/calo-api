import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateConfigDto } from "../dto/create-config.dto";
import { SearchConfigDto } from "../dto/search-config.dto";
import { SortByConfigDto } from "../dto/sort_by-config.dto";
import { UpdateConfigDto } from "../dto/update-config.dto";
import { Config, ConfigDocument } from "../schemas/config.schema";

@Injectable()
export class ConfigService {
  constructor(
    @InjectModel(Config.name)
    private configModel: Model<ConfigDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchConfigDto) {
    let condition: any = {};
    if (filter.type) {
      condition = Object.assign(condition, { type: filter.type });
    }

    if (filter.package_name) {
      condition = Object.assign(condition, { package_name: filter.package_name });
    }

    if (filter.search) {
      let dataSearch = `${filter.search}`;
      let dataRegex = new RegExp("^" + dataSearch.toLowerCase(), "i");
      condition = Object.assign(condition, { $or: [{ package_name: dataRegex }, { type: dataRegex }] });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByConfigDto) {
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
  async filter(filter: SearchConfigDto, sortBy: SortByConfigDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }

    let projection = {};

    // if (filter.search) {
    //   sortObject = { score: { $meta: "textScore" }, ...sortObject };
    //   projection = Object.assign(projection, { score: { $meta: "textScore" } });
    // }

    let dataReturn = await this.configModel
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
   * @returns
   */
  public count = async (filter: SearchConfigDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.configModel.estimatedDocumentCount();
      } else {
        return this.configModel.countDocuments(condition);
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
  async create(createUser: CreateConfigDto) {
    const createdConfig = new this.configModel(createUser);
    let dataCreate = await createdConfig.save();
    return dataCreate;
  }

  /**
   * @author Tony Vu
   * @param userId
   * @returns boolean
   */
  async isSuperAdmin(userId: string) {
    let superAdmin = process.env.SUPER_ADMIN;
    if (superAdmin) {
      let superAdminArray = superAdmin.split(",");
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
  async findAll(dataToSearch?: any): Promise<Config[]> {
    return this.configModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<Config> {
    return await this.configModel.findOne(dataToSearch).sort({ _id: -1 }).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<Config> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.configModel.findById(objectId).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.configModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataFilter
   * @returns
   */
  async updateCount(dataFilter: any, dataCount: any) {
    try {
      return this.configModel.updateMany(dataFilter, { $inc: dataCount }, { new: true });
    } catch (e) {
      return null;
    }
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateConfigDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.configModel.findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: false });
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
