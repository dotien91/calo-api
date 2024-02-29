import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FilterClassCourseDto } from "../dto/filter-class_course.dto";
import { CourseClassType } from "../interfaces/course.interface";
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
  async findOne(dataToSearch: any): Promise<CourseClass> {
    return await this.courseClassModel.findOne(dataToSearch).exec();
  }

  async findOneWithMembers(dataToSearch: any): Promise<CourseClass> {
    return await this.courseClassModel
      .findOne(dataToSearch)
      .populate({
        path: "members",
        select:
          "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail user_avatar_square last_active user_active official_status",
      })
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: any) {
    try {
      const dataReturn = await this.courseClassModel.findOneAndUpdate(
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
      const condition = await this.getCondition(filter);
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

    if (filter?._id) {
      condition = Object.assign(condition, { _id: filter._id });
    }

    if (filter?.course_id) {
      condition = Object.assign(condition, { course_id: filter.course_id });
    }

    return condition;
  }

  async filter(
    filter?: FilterClassCourseDto,
    sortBy?: any,
    page?: number,
    limit?: number,
    projection: any = {}
  ): Promise<CourseClass[]> {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.courseClassModel
      .find(condition, projection)
      .populate({
        path: "course_calendar_ids",
      })
      .populate({
        path: "members",
        select:
          "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status timezone",
      })
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  async getAllAssignedTimeInCourse(courseId: string, oldAssignedTime?: any[]): Promise<any[]> {
    const condition = {
      course_id: courseId,
    };

    const dataReturn = await this.courseClassModel.find(condition).populate({
      path: "course_calendar_ids",
      options: { strictPopulate: false },
      select: "day time_start time_end",
      match: { course_type: CourseClassType.CLASS, _id: { $nin: oldAssignedTime } },
    });
    return dataReturn;
  }
}
