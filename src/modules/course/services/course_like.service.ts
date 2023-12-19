import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateCourseLikeDto } from "../dto/create-course_like.dto";
import { FilterLikeCourseDto } from "../dto/filter-like_course.dto";
import { UpdateCourseLikeDto } from "../dto/update-course_like.dto";
import { CourseLike, CourseLikeDocument } from "../schemas/course_like.schema";

@Injectable()
export class CourseLikeService {
  constructor(
    @InjectModel(CourseLike.name)
    private courseLikeModel: Model<CourseLikeDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateCourseLikeDto): Promise<CourseLike> {
    const createdUser = new this.courseLikeModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: FilterLikeCourseDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.user_ids) {
      condition = Object.assign(condition, { user_id: { $in: filter.user_ids } });
    }
    if (filter.course_ids) {
      condition = Object.assign(condition, { course_id: { $in: filter.course_ids } });
    }
    if (filter.unset) {
      condition = Object.assign(condition, { course_id: { $nin: filter.unset } });
    }
    if (filter.course_id) {
      condition = Object.assign(condition, { course_id: filter.course_id });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async removeOne(dataToSearch: any): Promise<CourseLike> {
    return await this.courseLikeModel.findOneAndRemove(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findById(id: string, projection: any): Promise<CourseLike> {
    if (!id) {
      return null;
    }
    let dataReturn = await this.courseLikeModel.findById(id, projection);
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<CourseLike[]> {
    return this.courseLikeModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<CourseLike> {
    if (isWithUser) {
      return await this.courseLikeModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.courseLikeModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async filterByUserId(userId: string, userPartners: string[]): Promise<CourseLike[]> {
    let condition = { user_id: userId, partner_id: { $in: userPartners } };
    return await this.courseLikeModel.find(condition, {}).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.courseLikeModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateCourseLikeDto) {
    try {
      if (!dataUpdate.user_id && !dataUpdate.course_id) {
        return null;
      }
      let dataReturn = await this.courseLikeModel.findOneAndUpdate(
        { user_id: dataUpdate.user_id, course_id: dataUpdate.course_id },
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
   * @param dataUpdate
   * @returns
   */
  async updateWithoutCreate(dataUpdate: UpdateCourseLikeDto) {
    try {
      if (!dataUpdate.user_id && !dataUpdate.course_id) {
        return null;
      }
      let dataReturn = await this.courseLikeModel.findOneAndUpdate(
        { user_id: dataUpdate.user_id, course_id: dataUpdate.course_id },
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
  public count = async (filter: FilterLikeCourseDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.courseLikeModel.estimatedDocumentCount();
      } else {
        return this.courseLikeModel.countDocuments(condition);
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
  async filter(
    filter: FilterLikeCourseDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<CourseLike[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.courseLikeModel
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
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filterCourse(
    filter: FilterLikeCourseDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<CourseLike[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataPopulate = {
      path: "course_id",
      options: { strictPopulate: false },
      populate: [
        {
          path: "media_id",
        },
        {
          path: "avatar",
        },
      ],
    };
    let dataReturn: any = await this.courseLikeModel
      .find(condition, projection)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active _id user_phone user_email"
      )
      .populate(dataPopulate)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    if (dataReturn && dataReturn?.length) {
      let dataFinalToReturn = [];
      for (let dataItem of dataReturn) {
        delete dataItem.course_id?.user_id;
        if (dataItem.course_id?._id) {
          let dataItemToReturn = {
            ...dataItem.course_id?.toObject(),
            ...dataItem?.toObject(),
            ...{ _id: dataItem.course_id?._id?.toString() },
          };
          delete dataItemToReturn.course_id;
          dataFinalToReturn.push(dataItemToReturn);
        }
      }
      return dataFinalToReturn;
    } else {
      return [];
    }
  }

  /**
   *
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filterWithId(filter: FilterLikeCourseDto, page: number, limit: number): Promise<CourseLike[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any = { _id: -1 };
    let dataReturn = await this.courseLikeModel
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
  async filterUser(filter: FilterLikeCourseDto, sortBy: any, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.courseLikeModel
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
