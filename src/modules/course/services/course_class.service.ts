import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FilterClassCourseDto } from "../dto/filter-class_course.dto";
import { CourseClass, CourseClassDocument } from "../schemas/course_class.schema";

@Injectable()
export class CourseClassService {
  constructor(
    @InjectModel(CourseClass.name)
    private courseClassModel: Model<CourseClassDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser): Promise<CourseClass> {
    const createdUser = new this.courseClassModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async remove(dataToSearch: any): Promise<CourseClass> {
    return await this.courseClassModel.findOneAndRemove(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<CourseClass[]> {
    return this.courseClassModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<CourseClass> {
    if (isWithUser) {
      return await this.courseClassModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.courseClassModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: any) {
    try {
      let dataReturn = await this.courseClassModel.findOneAndUpdate(
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
  public count = async (filter: FilterClassCourseDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.courseClassModel.estimatedDocumentCount();
      } else {
        return this.courseClassModel.countDocuments(condition);
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

  getCondition(filter: FilterClassCourseDto) {
    let condition: any = {};

    return condition;
  }

  async filter(
    filter: FilterClassCourseDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<CourseClass[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.courseClassModel
      .find(condition, projection)
      .populate({
        path: "course_calendar_ids",
      })
      .populate({
        path: "members",
        select:
          "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status",
      })
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  async getAllAssignedTimeInCourse(courseId: string): Promise<any[]> {
    let condition = {
      course_id: courseId,
    };

    let dataReturn = await this.courseClassModel.find(condition).populate({
      path: "course_calendar_ids",
      options: { strictPopulate: false },
      select: "day time_start time_end",
    });
    return dataReturn;
  }
}

