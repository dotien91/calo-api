import { Injectable } from "@nestjs/common";
import { CourseModule, CourseModuleDocument } from "../schemas/course_module.schema";
import { CreateCourseModuleDto } from "../dto/create-course_module.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UpdateCourseModuleDto } from "../dto/update-course_module.dto";
import { FilterModuleCourseDto } from "../dto/filter-module_course.dto";

@Injectable()
export class CourseModuleService {
  constructor(
    @InjectModel(CourseModule.name)
    private courseLikeModel: Model<CourseModuleDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateCourseModuleDto): Promise<CourseModule> {
    const createdUser = new this.courseLikeModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: FilterModuleCourseDto) {
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
    if (filter.parent_id) {
      condition = Object.assign(condition, { parent_id: filter.parent_id });
    }
    if (filter.is_child) {
      condition = Object.assign(condition, { parent_id: { $ne: null } });
    }
    if (filter.is_parent) {
      condition = Object.assign(condition, { parent_id: null });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async removeOne(dataToSearch: any): Promise<CourseModule> {
    return await this.courseLikeModel.findOneAndRemove(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findById(id: string, projection: any): Promise<CourseModule> {
    if (!id) {
      return null;
    }
    let dataReturn = await this.courseLikeModel
      .findById(id, projection)
      .populate(
        "user_id",
        "_id user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("course_id");
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findByIdPopulate(id: string, projection: any): Promise<CourseModule> {
    if (!id) {
      return null;
    }
    let dataReturn = await this.courseLikeModel
      .findById(id, projection)
      .populate("course_id")
      .populate(
        "user_id",
        "_id user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      );
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<CourseModule[]> {
    return this.courseLikeModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<CourseModule> {
    if (isWithUser) {
      return await this.courseLikeModel
        .findOne(dataToSearch)
        .populate(
          "user_id",
          "_id user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
        )
        .populate("media_id")
        .exec();
    } else {
      return await this.courseLikeModel
        .findOne(dataToSearch)
        .populate(
          "user_id",
          "_id user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
        )
        .populate("media_id")
        .exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async filterByUserId(userId: string, userPartners: string[]): Promise<CourseModule[]> {
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
  async update(dataUpdate: UpdateCourseModuleDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.courseLikeModel
        .findOneAndUpdate(
          { _id: dataUpdate._id },
          { $set: dataUpdate },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
        .populate(
          "user_id",
          "_id user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
        )
        .populate("media_id");
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
  async updateWithoutCreate(dataUpdate: UpdateCourseModuleDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.courseLikeModel.findOneAndUpdate({ _id: dataUpdate._id }, { $set: dataUpdate });
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
  public count = async (filter: FilterModuleCourseDto) => {
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
    filter: FilterModuleCourseDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<CourseModule[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.courseLikeModel
      .find(condition, projection)
      .populate(
        "user_id",
        "_id user_login display_name bio description user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("media_id")
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
    filter: FilterModuleCourseDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<CourseModule[]> {
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
          path: "ref_id",
        },
      ],
    };
    let dataReturn: any = await this.courseLikeModel
      .find(condition, projection)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate(dataPopulate)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    if (dataReturn && dataReturn?.length) {
      let dataFinalToReturn = [];
      for (let dataItem of dataReturn) {
        let dataItemToReturn = { ...dataItem?.toObject(), ...dataItem.course_id?.toObject() };
        delete dataItemToReturn.course_id;
        dataFinalToReturn.push(dataItemToReturn);
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
  async filterWithId(filter: FilterModuleCourseDto, page: number, limit: number): Promise<CourseModule[]> {
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
  async filterUser(filter: FilterModuleCourseDto, sortBy: any, page: number, limit: number) {
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
