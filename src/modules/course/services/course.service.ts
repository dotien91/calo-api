import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, Types } from "mongoose";
import { UserRoles } from "../../user/interfaces/user.interface";
import { User, UserDocument } from "../../user/schemas/user.schema";
import { CreateCourseDto } from "../dto/create-course.dto";
import { SearchCourseDto, SearchTutorDto } from "../dto/search-course.dto";
import { UpdateCourseDto } from "../dto/update-course.dto";
import { CourseOneOneRole, CourseSkill, CourseType } from "../interfaces/course.interface";
import { Course, CourseDocument } from "../schemas/course.schema";
import { CourseOneOne, CourseOneOneDocument } from "../schemas/course_one_one.schema";

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name)
    private courseModel: Model<CourseDocument>,

    @InjectModel(User.name)
    private userModel: Model<UserDocument>,

    @InjectModel(CourseOneOne.name)
    private courseOneOne: Model<CourseOneOneDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchCourseDto) {
    let condition: any = {};
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
      condition = Object.assign(condition, {
        title: {
          $regex: filter.search,
          $options: "i",
        },
      });
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

    const matchObject = {};
    if (filter.onlyEnglishNativeSpeakers) matchObject["is_native"] = filter.onlyEnglishNativeSpeakers;
    if (filter.user_id) matchObject["_id"] = new mongoose.Types.ObjectId(filter.user_id);

    let dataReturn = await this.courseModel
      .find(condition, projection)
      .populate({
        path: "user_id",
        select:
          "user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status",
        match: matchObject,
      })
      .populate("media_id")
      .populate("avatar")
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();

    dataReturn = dataReturn.filter((data) => data.user_id !== null);
    return dataReturn;
  }

  async filterTutor(filter: SearchTutorDto, sortObject: any, page: number, limit: number): Promise<any> {
    const matchObject = {};

    // search filter
    matchObject["user_role"] = UserRoles.TEACHER;
    if (filter.onlyEnglishNativeSpeakers) matchObject["is_native"] = filter.onlyEnglishNativeSpeakers;
    if (filter.levelOfTutor?.length)
      matchObject["tutor_level"] = {
        $in: filter.levelOfTutor,
      };
    if (filter.display_name)
      matchObject["display_name"] = {
        $regex: filter.display_name,
        $options: "i",
      };

    const matchCourseObject = {};
    if (filter.types?.length)
      matchCourseObject["courses.type"] = {
        $in: filter.types,
      };
    if (filter.skills?.length)
      matchCourseObject["courses.skills"] = {
        $in: filter.skills,
      };

    // matching
    var users = await this.userModel.aggregate([
      {
        $match: matchObject,
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "user_id",
          as: "courses",
        },
      },
      {
        $unwind: {
          path: "$courses",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: matchCourseObject,
      },
      {
        $group: {
          _id: "$_id",
          user_avatar_thumbnail: {
            $first: "$user_avatar_thumbnail",
          },
          display_name: {
            $first: "$display_name",
          },
          bio: {
            $first: "$bio",
          },
          description: {
            $first: "$description",
          },
          country: {
            $first: "$country",
          },
          educations: {
            $first: "$educations",
          },
          certificates: {
            $first: "$certificates",
          },
          rating: {
            $first: "$rating",
          },
          tutor_level: {
            $first: "$tutor_level",
          },
          createdAt: {
            $first: "$createdAt",
          },
          course_count: { $count: {} },
          student_count: { $sum: "$courses.join_number" },
        },
      },
    ]);

    if (filter.timeAvailable?.length) {
      const validUserIds = [];

      const userIds = users.map((user) => user._id);
      const timeAvailable = await this.courseOneOne.aggregate([
        {
          $match: { role: CourseOneOneRole.TEACHER, user_id: { $in: userIds } },
        },
        { $unwind: "$time_available" },
        {
          $lookup: {
            from: "coursecalendars",
            localField: "time_available",
            foreignField: "_id",
            as: "time",
          },
        },
      ]);

      for (const data of timeAvailable) {
        const user_id = data.user_id;
        const teacher_time = data.time[0]; // this always return 1 element

        for (const checkTime of filter.timeAvailable) {
          const array1 = [
            {
              day: 0,
              time_start: teacher_time.time_start,
              time_end: teacher_time.time_end,
            },
          ];
          const array2 = [
            {
              day: 0,
              time_start: checkTime.time_start,
              time_end: checkTime.time_end,
            },
          ];

          if (this.areAllInRanges(array1, array2)) validUserIds.push(user_id.toString());
        }
      }

      const finalUserIds = Array.from(new Set(validUserIds));
      users = users.filter((user) => finalUserIds.includes(user._id.toString()));
    }

    return {
      data: users.slice((page - 1) * limit, (page - 1) * limit + limit).sort((a, b) => {
        if (sortObject?.levelOfTutor)
          return (a.tutor_level - b.tutor_level) * (sortObject.levelOfTutor === "ASC" ? 1 : -1);
        if (sortObject?.createdAt) return (a.createdAt - b.createdAt) * (sortObject.createdAt === "ASC" ? 1 : -1);
      }),
      count: users.length,
    };
  }

  async getAllFilter(filter: SearchCourseDto): Promise<number> {
    let condition = await this.getCondition(filter);
    let projection = {};

    const matchObject = {};
    if (filter.onlyEnglishNativeSpeakers) matchObject["is_native"] = filter.onlyEnglishNativeSpeakers;

    let dataReturn = await this.courseModel
      .find(condition, projection)
      .populate({
        path: "user_id",
        select:
          "user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status",
        match: matchObject,
      })
      .populate("media_id")
      .populate("avatar")
      .exec();

    dataReturn = dataReturn.filter((data) => data.user_id !== null);
    return dataReturn.length;
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
  async findAll(pattern?: any): Promise<Course[]> {
    return this.courseModel.find(pattern).exec();
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
        "_id user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
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

  areAllInRanges(array1, array2) {
    for (const item1 of array1) {
      let isInRange = false;

      for (const item2 of array2) {
        if (item1.day === item2.day) {
          const start1 = new Date(`2022-01-01 ${item1.time_start}`);
          const end1 = new Date(`2022-01-01 ${item1.time_end}`);
          const start2 = new Date(`2022-01-01 ${item2.time_start}`);
          const end2 = new Date(`2022-01-01 ${item2.time_end}`);

          // Check if item1 is within the range of item2
          if (start1 >= start2 && end1 <= end2) {
            isInRange = true;
            break;
          }
        }
      }

      // If any item from array1 is not in range, return false
      if (!isInRange) {
        return false;
      }
    }

    return true; // All items from array1 are in range
  }

  async findAllCourseReviewOfUser(user_id: string): Promise<any[]> {
    return this.courseModel.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(user_id),
        },
      },
      {
        $lookup: {
          from: "coursereviews",
          localField: "_id",
          foreignField: "course_id",
          as: "reviews",
        },
      },
    ]);
  }
}
