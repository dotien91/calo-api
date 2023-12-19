import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateLawyerRatingDto } from "../dto/create.lawyer_rating.dto";
import { SearchMyLawyerRatingDto } from "../dto/search.my_lawyer_rating.dto";
import { SortByMyLawyerRatingDto } from "../dto/sort_by-my_lawyer_rating.dto";
import { UpdateLawyerRatingDto } from "../dto/update.lawyer_rating.dto";
import { LawyerRating, LawyerRatingDocument } from "../schemas/lawyer_rating.schema";

@Injectable()
export class LawyerRatingService {
  constructor(
    @InjectModel(LawyerRating.name)
    private lawyerRatingModel: Model<LawyerRatingDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateLawyerRatingDto): Promise<LawyerRating> {
    const createdUser = new this.lawyerRatingModel(createUser);
    return await createdUser.save();
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<LawyerRating[]> {
    return this.lawyerRatingModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<LawyerRating> {
    return await this.lawyerRatingModel.findOne(dataToSearch).populate("rating_media").exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<LawyerRating> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.lawyerRatingModel.findById(objectId).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.lawyerRatingModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateLawyerRatingDto) {
    try {
      if (!dataUpdate.lawyer_id || !dataUpdate.createBy) {
        return null;
      }
      let dataReturn = await this.lawyerRatingModel.findOneAndUpdate(
        {
          lawyer_id: dataUpdate.lawyer_id,
          createBy: dataUpdate.createBy,
        },
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
  async getCondition(filter: SearchMyLawyerRatingDto) {
    let condition: any = {};
    if (filter.lawyer_id) {
      condition = Object.assign(condition, { lawyer_id: filter.lawyer_id });
    }
    if (filter.createBy) {
      condition = Object.assign(condition, { createBy: filter.createBy });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByMyLawyerRatingDto) {
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
  async filter(filter: SearchMyLawyerRatingDto, sortBy: SortByMyLawyerRatingDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.lawyerRatingModel
      .find(condition)
      .populate("rating_media")
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
  public count = async (filter: SearchMyLawyerRatingDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.lawyerRatingModel.estimatedDocumentCount();
      } else {
        return this.lawyerRatingModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };
}
