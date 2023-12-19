import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateLivestreamViewDto } from "../dto/create-livestream_view.dto";
import { FilterViewLivestreamDto } from "../dto/filter-view_livestream.dto";
import { UpdateLivestreamViewDto } from "../dto/update-livestream_view.dto";
import { LivestreamView, LivestreamViewDocument } from "../schemas/livestream_view.schema";

@Injectable()
export class LivestreamViewService {
  constructor(
    @InjectModel(LivestreamView.name)
    private livestreamViewModel: Model<LivestreamViewDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateLivestreamViewDto): Promise<LivestreamView> {
    const createdUser = new this.livestreamViewModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: FilterViewLivestreamDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.user_ids) {
      condition = Object.assign(condition, { user_id: { $in: filter.user_ids } });
    }
    if (filter.livestream_ids) {
      condition = Object.assign(condition, { livestream_id: { $in: filter.livestream_id } });
    }
    if (filter.livestream_id) {
      condition = Object.assign(condition, { livestream_id: filter.livestream_id });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async removeOne(dataToSearch: any): Promise<LivestreamView> {
    return await this.livestreamViewModel.findOneAndRemove(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findById(id: string, projection: any): Promise<LivestreamView> {
    if (!id) {
      return null;
    }
    const dataReturn = await this.livestreamViewModel.findById(id, projection);
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<LivestreamView[]> {
    return this.livestreamViewModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<LivestreamView> {
    if (isWithUser) {
      return await this.livestreamViewModel
        .findOne(dataToSearch)
        .populate("livestream_id")
        .populate(
          "user_id",
          "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
        )
        .exec();
    } else {
      return await this.livestreamViewModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async filterByUserId(userId: string, userPartners: string[]): Promise<LivestreamView[]> {
    const condition = { user_id: userId, partner_id: { $in: userPartners } };
    return await this.livestreamViewModel.find(condition, {}).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.livestreamViewModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateLivestreamViewDto) {
    try {
      if (!dataUpdate.user_id && !dataUpdate.livestream_id) {
        return null;
      }
      const dataReturn = await this.livestreamViewModel
        .findOneAndUpdate(
          { user_id: dataUpdate.user_id, livestream_id: dataUpdate.livestream_id },
          { $set: dataUpdate },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
        .populate("livestream_id")
        .populate(
          "user_id",
          "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
        );
      return dataReturn;
    } catch (e) {
      return e;
    }
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async updateWithoutCreate(dataUpdate: UpdateLivestreamViewDto) {
    try {
      if (!dataUpdate.user_id && !dataUpdate.livestream_id) {
        return null;
      }
      const dataReturn = await this.livestreamViewModel.findOneAndUpdate(
        { user_id: dataUpdate.user_id, livestream_id: dataUpdate.livestream_id },
        { $set: dataUpdate }
      );
      if (dataReturn._id) {
        return { ...dataReturn.toObject(), ...dataUpdate };
      } else {
        return null;
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
  public count = async (filter: FilterViewLivestreamDto) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.livestreamViewModel.estimatedDocumentCount();
      } else {
        return this.livestreamViewModel.countDocuments(condition);
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
  async filter(filter: FilterViewLivestreamDto, sortBy: any, page: number, limit: number): Promise<LivestreamView[]> {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.livestreamViewModel
      .find(condition)
      .populate("livestream_id")
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
   *
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filterWithId(filter: FilterViewLivestreamDto, page: number, limit: number): Promise<LivestreamView[]> {
    const condition = await this.getCondition(filter);
    const sortObject: any = { _id: -1 };
    const dataReturn = await this.livestreamViewModel
      .find(condition, { user_id: true })
      .sort(sortObject)
      .populate("livestream_id")
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
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
  async filterUser(filter: FilterViewLivestreamDto, sortBy: any, page: number, limit: number) {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.livestreamViewModel
      .find(condition)
      .populate({
        path: "user_id",
        options: { strictPopulate: false },
        select:
          "_id bio description user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active",
        populate: { path: "user_option_id" },
      })
      .populate("livestream_id")
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }
}
