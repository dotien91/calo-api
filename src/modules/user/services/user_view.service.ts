import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateUserViewDto } from "../dto/create-user_view.dto";
import { FilterViewDto } from "../dto/filter-view.dto";
import { UpdateUserViewDto } from "../dto/update-user_view.dto";
import { UserView, UserViewDocument } from "../schemas/user_view.schema";

@Injectable()
export class UserViewService {
  constructor(
    @InjectModel(UserView.name)
    private userViewModel: Model<UserViewDocument>
  ) { }

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateUserViewDto): Promise<UserView> {
    const createdUser = new this.userViewModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: FilterViewDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.partner_id) {
      condition = Object.assign(condition, { partner_id: filter.partner_id });
    }
    if (filter.updatedAt) {
      const currentTime = Math.floor(Date.now() / 1);
      const timeToCompare = currentTime - 24 * 60 * 60 * 1000;
      const dateToCompare = new Date(timeToCompare);
      condition = Object.assign(condition, { updatedAt: { $gt: dateToCompare } });
    }

    return condition;
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findById(id: string, projection: any): Promise<UserView> {
    if (!id) {
      return null;
    }
    const dataReturn = await this.userViewModel.findById(id, projection);
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<UserView[]> {
    return this.userViewModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<UserView> {
    if (isWithUser) {
      return await this.userViewModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.userViewModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async filterByUserId(userId: string, userPartners: string[]): Promise<UserView[]> {
    const condition = { user_id: userId, partner_id: { $in: userPartners } };
    return await this.userViewModel.find(condition, {}).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.userViewModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateUserViewDto) {
    try {
      if (!dataUpdate.user_id && !dataUpdate.partner_id) {
        return null;
      }
      const dataReturn = await this.userViewModel.findOneAndUpdate(
        { user_id: dataUpdate.user_id, partner_id: dataUpdate.partner_id },
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
  public count = async (filter: FilterViewDto) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.userViewModel.estimatedDocumentCount();
      } else {
        return this.userViewModel.countDocuments(condition);
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
  /**
   * @author Tony Vu
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filter(filter: FilterViewDto, sortBy: any, page: number, limit: number): Promise<UserView[]> {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.userViewModel
      .find(condition)
      .populate({
        path: "user_id",
        options: { strictPopulate: false },
        select:
          "_id bio description user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      })
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }
}
