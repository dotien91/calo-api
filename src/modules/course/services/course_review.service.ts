import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateCourseReviewDto } from "../dto/create-course_review.dto";
import { FilterReviewCourseDto } from "../dto/filter-review_course.dto";
import { UpdateCourseReviewDto } from "../dto/update-course_review.dto";
import { CourseReview, CourseReviewDocument } from "../schemas/course_review.schema";

@Injectable()
export class CourseReviewService {
  constructor(
    @InjectModel(CourseReview.name)
    private courseReviewModel: Model<CourseReviewDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateCourseReviewDto): Promise<CourseReview> {
    const createdUser = new this.courseReviewModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async remove(dataToSearch: any): Promise<CourseReview> {
    return await this.courseReviewModel.findOneAndRemove(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<CourseReview[]> {
    return this.courseReviewModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<CourseReview> {
    if (isWithUser) {
      return await this.courseReviewModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.courseReviewModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateCourseReviewDto) {
    try {
      let dataReturn = await this.courseReviewModel.findOneAndUpdate(
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
  public count = async (filter: FilterReviewCourseDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.courseReviewModel.estimatedDocumentCount();
      } else {
        return this.courseReviewModel.countDocuments(condition);
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

  getCondition(filter: FilterReviewCourseDto) {
    let condition: any = {};

    if (filter.course_id) {
      condition = Object.assign(condition, { course_id: filter.course_id });
    }

    if (filter.rating) {
      condition = Object.assign(condition, { rating: filter.rating });
    }

    return condition;
  }

  async filter(
    filter: FilterReviewCourseDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<CourseReview[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.courseReviewModel
      .find(condition, projection)
      .populate({
        path: "user_id",
        select:
          "_id bio description user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status",
      })
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }
}

