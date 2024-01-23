import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateCourseCalendarDto } from "../dto/create-course_calendar.dto";
import { FilterCalendarCourseDto } from "../dto/filter-calendar_course.dto";
import { UpdateCourseCalendarDto } from "../dto/update-course_calendar.dto";
import { CourseCalendar, CourseCalendarDocument } from "../schemas/course_calendar.schema";

@Injectable()
export class CourseCalendarService {
  constructor(
    @InjectModel(CourseCalendar.name)
    private courseCalendarModel: Model<CourseCalendarDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateCourseCalendarDto): Promise<CourseCalendar> {
    const createdUser = new this.courseCalendarModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async remove(dataToSearch: any): Promise<CourseCalendar> {
    return await this.courseCalendarModel.findOneAndRemove(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<CourseCalendar[]> {
    return this.courseCalendarModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<CourseCalendar> {
    if (isWithUser) {
      return await this.courseCalendarModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.courseCalendarModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateCourseCalendarDto) {
    try {
      let dataReturn = await this.courseCalendarModel.findOneAndUpdate(
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
  public count = async (filter: FilterCalendarCourseDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.courseCalendarModel.estimatedDocumentCount();
      } else {
        return this.courseCalendarModel.countDocuments(condition);
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

  getCondition(filter: FilterCalendarCourseDto) {
    let condition: any = {};

    return condition;
  }

  async filter(
    filter: FilterCalendarCourseDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<CourseCalendar[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.courseCalendarModel
      .find(condition, projection)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }
}

