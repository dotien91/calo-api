import { Injectable } from "@nestjs/common";
import { UserQuestion, UserQuestionDocument } from "../schemas/user_question.schema";
import { CreateUserQuestionDto } from "../dto/create-user_question.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UpdateUserQuestionDto } from "../dto/update-user_question.dto";
import { FilterFollowDto } from "../dto/filter-follow.dto";

@Injectable()
export class UserQuestionService {
  constructor(
    @InjectModel(UserQuestion.name)
    private userQuestionModel: Model<UserQuestionDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateUserQuestionDto): Promise<UserQuestion> {
    const createdUser = new this.userQuestionModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: FilterFollowDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async removeOne(dataToSearch: any): Promise<UserQuestion> {
    return await this.userQuestionModel.findOneAndRemove(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findById(id: string, projection: any): Promise<UserQuestion> {
    if (!id) {
      return null;
    }
    let dataReturn = await this.userQuestionModel.findById(id, projection);
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<UserQuestion[]> {
    return this.userQuestionModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<UserQuestion> {
    if (isWithUser) {
      return await this.userQuestionModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.userQuestionModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async filterByUserId(userId: string, userPartners: string[]): Promise<UserQuestion[]> {
    let condition = { user_id: userId, partner_id: { $in: userPartners } };
    return await this.userQuestionModel.find(condition, {}).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.userQuestionModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateUserQuestionDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.userQuestionModel.findOneAndUpdate(
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
  public count = async (filter: FilterFollowDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.userQuestionModel.estimatedDocumentCount();
      } else {
        return this.userQuestionModel.countDocuments(condition);
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
  async filter(filter: FilterFollowDto, sortBy: any, page: number, limit: number): Promise<UserQuestion[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.userQuestionModel
      .find(condition)
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
  async filterWithId(filter: FilterFollowDto, page: number, limit: number): Promise<UserQuestion[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any = { _id: -1 };
    let dataReturn = await this.userQuestionModel
      .find(condition, { user_id: true })
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
  async filterUser(filter: FilterFollowDto, sortBy: any, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.userQuestionModel
      .find(condition)
      .populate({
        path: "user_id",
        options: { strictPopulate: false },
        select:
          "_id bio description user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active",
        populate: { path: "user_option_id" },
      })
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }
}
