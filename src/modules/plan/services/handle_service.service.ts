import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateHandleServiceDto } from "../dto/create-handle_service.dto";
import { SearchHandleServiceDto } from "../dto/search-handle_service.dto";
import { SortByHandleServiceDto } from "../dto/sort_by-handle_service.dto";
import { UpdateHandleServiceDto } from "../dto/update-handle_service.dto";
import { HandleService, HandleServiceDocument } from "../schemas/handle_service.schema";
@Injectable()
export class HandleServiceService {
  constructor(
    @InjectModel(HandleService.name)
    private handleServiceModel: Model<HandleServiceDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchHandleServiceDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.service_type) {
      if (filter?.service_type?.indexOf(",") !== -1) {
        const serviceTypeArray = filter?.service_type?.split(",");
        condition = Object.assign(condition, { service_type: { $in: serviceTypeArray } });
      } else {
        condition = Object.assign(condition, { service_type: filter.service_type });
      }
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByHandleServiceDto) {
    let sort = {};
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
  async filter(filter: SearchHandleServiceDto, sortBy: SortByHandleServiceDto, page: number, limit: number) {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.handleServiceModel
      .find(condition)
      .populate("public_album")
      .populate("avatar")
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
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
  public count = async (filter: SearchHandleServiceDto) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.handleServiceModel.estimatedDocumentCount();
      } else {
        return this.handleServiceModel.countDocuments(condition);
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
  async create(createUser: CreateHandleServiceDto): Promise<HandleService> {
    const createdUser = new this.handleServiceModel(createUser);
    return await createdUser.save();
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<HandleService[]> {
    return this.handleServiceModel
      .find()
      .populate("public_album")
      .populate("avatar")
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<HandleService> {
    return await this.handleServiceModel
      .findOne(dataToSearch)
      .populate("public_album")
      .populate("avatar")
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<HandleService> {
    if (!id) {
      return null;
    }
    const objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.handleServiceModel
      .findById(objectId)
      .populate("public_album")
      .populate("avatar")
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.handleServiceModel
      .findByIdAndDelete(id)
      .populate("public_album")
      .populate("avatar")
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateHandleServiceDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      const dataReturn = await this.handleServiceModel
        .findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: false })
        .populate("public_album")
        .populate("avatar")
        .populate(
          "user_id",
          "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
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
