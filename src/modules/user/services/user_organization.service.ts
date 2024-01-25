import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateUserOrganizationDto } from "../dto/create-user_organization.dto";
import { FilterUserOrganizationDto } from "../dto/filter-user_organization.dto";
import { UpdateUserOrganizationDto } from "../dto/update-user_organization.dto";
import { UserOrganization, UserOrganizationDocument } from "../schemas/user_organization.schema";

@Injectable()
export class UserOrganizationService {
  constructor(
    @InjectModel(UserOrganization.name)
    private userOrganizationModel: Model<UserOrganizationDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateUserOrganizationDto): Promise<UserOrganization> {
    const createdUser = new this.userOrganizationModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async remove(dataToSearch: any): Promise<any> {
    await this.userOrganizationModel.deleteMany(dataToSearch);
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<UserOrganization[]> {
    return this.userOrganizationModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<UserOrganization> {
    if (isWithUser) {
      return await this.userOrganizationModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.userOrganizationModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateUserOrganizationDto) {
    try {
      let dataReturn = await this.userOrganizationModel.findOneAndUpdate(
        { _id: dataUpdate._id },
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
  public count = async (filter: FilterUserOrganizationDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.userOrganizationModel.estimatedDocumentCount();
      } else {
        return this.userOrganizationModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: any) {
    let sort = { priority: -1 };
    if (sortBy.createdAt) {
      sort = Object.assign(sort, { _id: sortBy.createdAt === "DESC" ? -1 : 1 });
    }
    if (sortBy.updatedAt) {
      sort = Object.assign(sort, { updatedAt: sortBy.updatedAt === "DESC" ? -1 : 1 });
    }
    return sort;
  }

  getCondition(filter: FilterUserOrganizationDto) {
    let condition: any = {};

    if (filter.name) {
      condition = Object.assign(condition, { name: filter.name });
    }

    return condition;
  }

  async filter(
    filter: FilterUserOrganizationDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<UserOrganization[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.userOrganizationModel
      .find(condition, projection)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }
}

