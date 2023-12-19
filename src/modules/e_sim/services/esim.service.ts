import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateEsimDto } from "../dto/create-esim.dto";
import { SearchEsimDto } from "../dto/search-esim.dto";
import { SortByEsimDto } from "../dto/sort_by-esim.dto";
import { UpdateEsimDto } from "../dto/update-esim.dto";
import { Esim, EsimDocument } from "../schemas/esim.schema";

@Injectable()
export class EsimService {
  constructor(
    @InjectModel(Esim.name)
    private requestModel: Model<EsimDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchEsimDto) {
    let condition: any = {};
    if (filter.country) {
      condition = Object.assign(condition, { country: filter.country });
    }

    if (filter.supported_countries) {
      condition = Object.assign(condition, { supported_countries: filter.supported_countries });
    }

    if (filter.search) {
      condition = Object.assign(condition, { $text: { $search: filter.search } });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByEsimDto) {
    let sort = { priority: -1 };
    if (sortBy.createdAt) {
      sort = Object.assign(sort, { _id: sortBy.createdAt === "DESC" ? -1 : 1 });
    }
    if (sortBy.post_view) {
      sort = Object.assign(sort, { post_view: sortBy.post_view === "DESC" ? -1 : 1 });
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
  async filter(filter: SearchEsimDto, sortBy: SortByEsimDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    // console.log(condition, "condition");
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};

    if (filter.search) {
      sortObject = { score: { $meta: "textScore" }, ...sortObject };
      projection = Object.assign(projection, { score: { $meta: "textScore" } });
    }

    let populateObject = {
      path: "country",
      populate: {
        path: "avatar",
      },
    };
    let populateSupportCountries = {
      path: "supported_countries",
      populate: {
        path: "avatar",
      },
    };

    let dataReturn = await this.requestModel
      .find(condition)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate(populateObject)
      .populate("avatar")
      .populate("plan_id")
      .populate(populateSupportCountries)
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
  async filterAdmin(filter: SearchEsimDto, sortBy: SortByEsimDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};

    let populateObject = {
      path: "country",
      populate: {
        path: "avatar",
      },
    };
    let populateSupportCountries = {
      path: "supported_countries",
      populate: {
        path: "avatar",
      },
    };
    let dataReturn = await this.requestModel
      .find(condition, projection)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate(populateObject)
      .populate("avatar")
      .populate("plan_id")
      .populate(populateSupportCountries)
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
  public count = async (filter: SearchEsimDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.requestModel.estimatedDocumentCount();
      } else {
        return this.requestModel.countDocuments(condition);
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
  async create(createUser: CreateEsimDto) {
    const createdPost = new this.requestModel(createUser);
    let dataCreate = await createdPost.save();
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
  async findAll(dataToSearch?: any): Promise<Esim[]> {
    return this.requestModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<Esim> {
    let populateObject = {
      path: "country",
      populate: {
        path: "avatar",
      },
    };
    let populateSupportCountries = {
      path: "supported_countries",
      populate: {
        path: "avatar",
      },
    };
    return await this.requestModel
      .findOne(dataToSearch)
      .sort({ _id: -1 })
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate(populateObject)
      .populate("avatar")
      .populate("plan_id")
      .populate(populateSupportCountries)
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<Esim> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }

    let populateObject = {
      path: "country",
      populate: {
        path: "avatar",
      },
    };
    let populateSupportCountries = {
      path: "supported_countries",
      populate: {
        path: "avatar",
      },
    };
    return await this.requestModel
      .findById(objectId)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate(populateObject)
      .populate("avatar")
      .populate("plan_id")
      .populate(populateSupportCountries)
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string): Promise<any> {
    return await this.requestModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateEsimDto) {
    // console.log(dataUpdate);
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = null;
      if (dataUpdate._id) {
        let populateObject = {
          path: "country",
          populate: {
            path: "avatar",
          },
        };
        let populateSupportCountries = {
          path: "supported_countries",
          populate: {
            path: "avatar",
          },
        };

        dataReturn = await this.requestModel
          .findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: false })
          .populate(
            "user_id",
            "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
          )
          .populate(populateObject)
          .populate("avatar")
          .populate("plan_id")
          .populate(populateSupportCountries);
      }
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
   * @param dataFilter
   * @returns
   */
  async updateCount(dataFilter: any, dataUpdate: any) {
    try {
      return this.requestModel.findByIdAndUpdate(dataFilter._id, { $inc: dataUpdate });
    } catch (e) {
      return null;
    }
  }
}
