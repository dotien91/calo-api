import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateCourseCalendarTeacherDto } from "../dto/create-course_calendar_teacher.dto";
import { FilterCalendarTeacherCourseDto } from "../dto/filter-calendar_teacher_course.dto";
import { CourseCalendarTeacher, CourseCalendarTeacherDocument } from "../schemas/course_calendar_teacher.schema";

@Injectable()
export class CourseCalendarTeacherService {
  constructor(
    @InjectModel(CourseCalendarTeacher.name)
    private courseCalendarTeacherModel: Model<CourseCalendarTeacherDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateCourseCalendarTeacherDto): Promise<CourseCalendarTeacher> {
    const createdUser = new this.courseCalendarTeacherModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async remove(dataToSearch: any): Promise<any> {
    await this.courseCalendarTeacherModel.deleteMany(dataToSearch);
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<CourseCalendarTeacher[]> {
    return this.courseCalendarTeacherModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<CourseCalendarTeacher> {
    if (isWithUser) {
      return await this.courseCalendarTeacherModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.courseCalendarTeacherModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: any) {
    try {
      let dataReturn = await this.courseCalendarTeacherModel.findOneAndUpdate(
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
  public count = async (filter: FilterCalendarTeacherCourseDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.courseCalendarTeacherModel.estimatedDocumentCount();
      } else {
        return this.courseCalendarTeacherModel.countDocuments(condition);
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

  getCondition(filter: FilterCalendarTeacherCourseDto) {
    let condition: any = {};

    if (filter.course_id) {
      condition = Object.assign(condition, { course_id: filter.course_id });
    }

    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }

    return condition;
  }

  async filter(
    filter: FilterCalendarTeacherCourseDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<CourseCalendarTeacher[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.courseCalendarTeacherModel
      .find(condition, projection)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }
}

