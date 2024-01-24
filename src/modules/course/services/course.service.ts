import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateCourseDto } from "../dto/create-course.dto";
import { SearchCourseDto } from "../dto/search-course.dto";
import { UpdateCourseDto } from "../dto/update-course.dto";
import { CourseSkill, CourseType } from "../interfaces/course.interface";
import { Course, CourseDocument } from "../schemas/course.schema";

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name)
    private courseModel: Model<CourseDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchCourseDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.language) {
      condition = Object.assign(condition, { language: filter.language });
    }

    if (filter.course_status) {
      condition = Object.assign(condition, { course_status: filter.course_status });
    }

    if (filter.max_price) {
      condition = Object.assign(condition, {
        price: {
          $lte: filter.max_price || Number.POSITIVE_INFINITY,
          $gte: filter.min_price || Number.NEGATIVE_INFINITY,
        },
      });
    }

    if (filter.ref_id) {
      if (filter.ref_id?.indexOf(",") !== -1) {
        let dataRefArray = filter.ref_id?.split(",");
        condition = Object.assign(condition, { ref_id: { $in: dataRefArray } });
      } else {
        condition = Object.assign(condition, { ref_id: filter.ref_id });
      }
    }

    if (filter.ids) {
      let dataIds = filter.ids.split(",");
      condition = Object.assign(condition, { _id: { $in: dataIds } });
    }

    if (filter.search) {
      let dataSearch = `${filter.search}`;
      let dataRegex = new RegExp("^" + dataSearch.toLowerCase(), "i");
      condition = Object.assign(condition, { $or: [{ title: dataRegex }, { description: dataRegex }] });
    }

    if (filter.levels && filter.levels.length) {
      let levels = filter.levels;
      condition = Object.assign(condition, { level: { $in: levels } });
    }

    if (filter.skills && filter.skills.length) {
      let skills = filter.skills;

      if (skills.includes(CourseSkill.ALL_SKILLS))
        skills = [CourseSkill.LISTENING, CourseSkill.READING, CourseSkill.SPEAKING, CourseSkill.WRITING];

      condition = Object.assign(condition, { skills: { $in: skills } });
    }

    if (filter.types && filter.types.length) {
      let types = filter.types;

      if (types.includes(CourseType.ALL_FORMS))
        types = [CourseType.CALL_GROUP, CourseType.CALL_ONE_ONE, CourseType.SELF_LEARNING];

      condition = Object.assign(condition, { type: { $in: types } });
    }

    return condition;
  }

  /**
   * @author Tony Vu
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filter(filter: SearchCourseDto, sortObject: any, page: number, limit: number): Promise<Course[]> {
    let condition = await this.getCondition(filter);
    let projection = {};

    // if (filter.search) {
    //   sortObject = { score: { $meta: "textScore" }, ...sortObject };
    //   projection = Object.assign(projection, { score: { $meta: "textScore" } });
    // }

    let dataReturn = await this.courseModel
      .find(condition, projection)
      .populate(
        "user_id",
        "user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
      )
      .populate("media_id")
      .populate("avatar")
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
  async filterAdmin(filter: SearchCourseDto, sortObject: any, page: number, limit: number): Promise<Course[]> {
    let condition = await this.getCondition(filter);
    let projection = {};
    let dataReturn = await this.courseModel
      .find(condition, projection)
      .populate(
        "user_id",
        "user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
      )
      .populate("media_id")
      .populate("avatar")
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
  public count = async (filter: SearchCourseDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.courseModel.estimatedDocumentCount();
      } else {
        return this.courseModel.countDocuments(condition);
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
  async create(createUser: CreateCourseDto) {
    const createdCourse = new this.courseModel(createUser);
    let dataCreate = await createdCourse.save();
    return dataCreate;
  }

  /**
   * @author Tony Vu
   * @param userId
   * @returns boolean
   */
  async isSuperAdmin(userId: string) {
    let superAdmin = process.env.SUPER_ADMIN;
    if (superAdmin) {
      let superAdminArray = superAdmin.split(",");
      if (superAdminArray.indexOf(userId) !== -1) {
        return true;
      }
    }
    return false;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<Course[]> {
    return this.courseModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<Course> {
    return await this.courseModel
      .findOne(dataToSearch)
      .sort({ _id: -1 })
      .populate(
        "user_id",
        "user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
      )
      .populate("media_id")
      .populate("avatar")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<Course> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.courseModel
      .findById(objectId)
      .populate(
        "user_id",
        "_id user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
      )
      .populate("media_id")
      .populate("avatar")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.courseModel
      .findByIdAndDelete(id)
      .populate(
        "user_id",
        "user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
      )
      .populate("media_id")
      .populate("avatar")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateCourseDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.courseModel
        .findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: true })
        .populate(
          "user_id",
          "user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
        )
        .populate("media_id")
        .populate("avatar");
      return dataReturn;
    } catch (e) {
      return e;
    }
  }

  /**
   * @author Tony Vu
   * @param dataFilter
   * @returns
   */
  async updateCount(dataFilter: any, dataUpdate: any) {
    try {
      return this.courseModel.findByIdAndUpdate(dataFilter._id, { $inc: dataUpdate });
    } catch (e) {
      return null;
    }
  }
}
