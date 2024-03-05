import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FilterCourseOneOneDto } from "../dto/filter-calendar_one_one.dto";
import { CourseClassType, CourseOneOneRole } from "../interfaces/course.interface";
import { CourseOneOne, CourseOneOneDocument } from "../schemas/course_one_one.schema";

@Injectable()
export class CourseOneOneService {
  constructor(
    @InjectModel(CourseOneOne.name)
    private courseOneOneModel: Model<CourseOneOneDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser): Promise<CourseOneOne> {
    const createdUser = new this.courseOneOneModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async remove(dataToSearch: any): Promise<any> {
    await this.courseOneOneModel.deleteMany(dataToSearch);
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(pattern?: any, isPopulate = false): Promise<CourseOneOne[]> {
    if (isPopulate) {
      return this.courseOneOneModel
        .find(pattern)
        .populate({
          path: "user_id",
          select:
            "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail user_avatar_square last_active user_active official_status",
        })
        .exec();
    } else return this.courseOneOneModel.find(pattern).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<CourseOneOne> {
    if (isWithUser) {
      return await this.courseOneOneModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.courseOneOneModel.findOne(dataToSearch).populate("time_available").exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: any) {
    try {
      const dataReturn = await this.courseOneOneModel.findOneAndUpdate(
        { _id: dataUpdate._id, role: dataUpdate.role },
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
  public count = async (filter: FilterCourseOneOneDto) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.courseOneOneModel.estimatedDocumentCount();
      } else {
        return this.courseOneOneModel.countDocuments(condition);
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

  getCondition(filter: FilterCourseOneOneDto) {
    let condition: any = {};

    if (filter.course_id) {
      condition = Object.assign(condition, { course_id: filter.course_id });
    }

    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }

    if (filter.role) {
      condition = Object.assign(condition, { role: filter.role });
    }

    return condition;
  }

  async filter(
    filter: FilterCourseOneOneDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<CourseOneOne[]> {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.courseOneOneModel
      .find(condition, projection)
      .populate({
        path: "time_available",
      })
      .populate({
        path: "time_pick",
      })
      .populate({
        path: "user_id",
        select:
          "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status",
      })
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  async getAllAssignedTimeInCourseOfStudent(courseId: string, oldAssignedTime?: any[]): Promise<any[]> {
    const condition = {
      course_id: courseId,
      role: CourseOneOneRole.STUDENT,
    };

    const dataReturn = await this.courseOneOneModel.find(condition).populate({
      path: "time_pick",
      options: { strictPopulate: false },
      select: "day time_start time_end",
      match: { course_type: CourseClassType.ONE_ONE, _id: { $nin: oldAssignedTime } },
    });

    // should filter the old assigned time

    return dataReturn;
  }

  async getAllAssignedTimeOfStudent(): Promise<any[]> {
    const condition = {
      role: CourseOneOneRole.STUDENT,
    };

    const dataReturn = await this.courseOneOneModel
      .find(condition)
      .populate({
        path: "time_pick",
        options: { strictPopulate: false },
        select: "day time_start time_end",
        match: { course_type: CourseClassType.ONE_ONE },
      })
      .populate({
        path: "user_id",
        select:
          "user_login display_name user_role user_status user_avatar user_avatar_thumbnail user_avatar_square last_active user_active official_status timezone",
      });

    // should filter the old assigned time

    return dataReturn;
  }

  async getAllAssignedTimeInCourseOfTeacher(teacherId: string): Promise<any[]> {
    const condition = {
      user_id: teacherId,
      role: CourseOneOneRole.TEACHER,
    };

    const dataReturn = await this.courseOneOneModel.find(condition).populate({
      path: "time_available",
      options: { strictPopulate: false },
      select: "day time_start time_end",
      match: { course_type: CourseClassType.ONE_ONE },
    });
    return dataReturn;
  }
}
