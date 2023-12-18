import { Injectable } from "@nestjs/common";
import { CreateUserPermissionDto } from "../dto/create-user_permission.dto";
import { UserPermission, UserPermissionDocument } from "../schemas/user_permission.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UpdateUserPermissionDto } from "../dto/update-user_permission.dto";
import { SearchUserPermissionDto } from "../dto/search-user_permission.dto";
import { SortByUserPermissionDto } from "../dto/sort_by-user_permission.dto";
@Injectable()
export class UserPermissionService {
  constructor(
    @InjectModel(UserPermission.name)
    private userPermissionModel: Model<UserPermissionDocument>
  ) { }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchUserPermissionDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByUserPermissionDto) {
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
  async filter(filter: SearchUserPermissionDto, sortBy: SortByUserPermissionDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.userPermissionModel
      .find(condition)
      .populate("user_id", "user_login display_name user_role user_status user_avatar last_active user_active")
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
  public count = async (filter: SearchUserPermissionDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.userPermissionModel.estimatedDocumentCount();
      } else {
        return this.userPermissionModel.countDocuments(condition);
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
  async create(createUser: CreateUserPermissionDto): Promise<UserPermission> {
    const createdUser = new this.userPermissionModel(createUser);
    return await createdUser.save();
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
   * @param userId
   * @param permission
   * @returns
   */
  async isHavePermission(userId: string, permission: string) {
    if (!userId || !permission) {
      return false;
    }

    let superAdmin = process.env.SUPER_ADMIN;
    if (superAdmin) {
      let superAdminArray = superAdmin.split(",");
      if (superAdminArray.indexOf(userId) !== -1) {
        return true;
      }
    }

    let dataFilter = {
      user_id: userId,
      permission: permission,
    };
    let permissionObject = await this.findOne(dataFilter);
    if (permissionObject && permissionObject._id) {
      return true;
    }
    return false;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<UserPermission[]> {
    return this.userPermissionModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<UserPermission> {
    return await this.userPermissionModel.findOne(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.userPermissionModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateUserPermissionDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.userPermissionModel.findByIdAndUpdate(
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
