import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateNeedHelpDto } from "../dto/create-need_help.dto";
import { SearchNeedHelpDto } from "../dto/search-need_help.dto";
import { SortByNeedHelpDto } from "../dto/sort_by-need_help.dto";
import { UpdateNeedHelpDto } from "../dto/update-need_help.dto";
import { NeedHelp, NeedHelpDocument } from "../schemas/need_help.schema";

@Injectable()
export class NeedHelpService {
  constructor(
    @InjectModel(NeedHelp.name)
    private needHelperModel: Model<NeedHelpDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchNeedHelpDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.language) {
      condition = Object.assign(condition, { language: filter.language });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByNeedHelpDto) {
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
  async filter(filter: SearchNeedHelpDto, sortBy: SortByNeedHelpDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.needHelperModel
      .find(condition)
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
  public count = async (filter: SearchNeedHelpDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.needHelperModel.estimatedDocumentCount();
      } else {
        return this.needHelperModel.countDocuments(condition);
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
  async create(createUser: CreateNeedHelpDto): Promise<NeedHelp> {
    const createdUser = new this.needHelperModel(createUser);
    return await createdUser.save();
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<NeedHelp[]> {
    return this.needHelperModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<NeedHelp> {
    return await this.needHelperModel.findOne(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.needHelperModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateNeedHelpDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.needHelperModel.findByIdAndUpdate(
        dataUpdate._id,
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
}
