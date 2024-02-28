import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FilterThreadCommentDTO } from "../dtos/thread_comment.dto";
import { ThreadComment, ThreadCommentDocument } from "../schemas/thread_comment.schema";

@Injectable()
export class ThreadCommentService {
  constructor(
    @InjectModel(ThreadComment.name)
    private threadCommentModel: Model<ThreadCommentDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser): Promise<ThreadComment> {
    const createdUser = new this.threadCommentModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async remove(dataToSearch: any): Promise<any> {
    await this.threadCommentModel.deleteMany(dataToSearch);
  }

  async findByIdAndDelete(id: string): Promise<any> {
    return await this.threadCommentModel.findByIdAndDelete(id);
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(pattern?: any): Promise<ThreadComment[]> {
    return this.threadCommentModel.find(pattern).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<ThreadComment> {
    if (isWithUser) {
      return await this.threadCommentModel.findOne(dataToSearch).exec();
    } else {
      return await this.threadCommentModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: any) {
    try {
      let dataReturn = await this.threadCommentModel.findOneAndUpdate(
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
  public count = async (filter: FilterThreadCommentDTO) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.threadCommentModel.estimatedDocumentCount();
      } else {
        return this.threadCommentModel.countDocuments(condition);
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

  getCondition(filter: FilterThreadCommentDTO) {
    let condition: any = {};

    if (filter.content) {
      condition = Object.assign(condition, {
        content: {
          $regex: filter.content,
          $options: "i",
        },
      });
    }

    if (filter.thread_id) {
      condition = Object.assign(condition, { thread_id: filter.thread_id });
    }

    if (filter.type) {
      condition = Object.assign(condition, { type: filter.type });
    }

    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }

    return condition;
  }

  async filter(
    filter: FilterThreadCommentDTO,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<ThreadComment[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.threadCommentModel
      .find(condition, projection)
      .populate({
        path: "user_id",
        select:
          "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail user_avatar_square last_active user_active official_status",
      })
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  async upsert(query: any, updateData: any) {
    const update = {
      $set: {
        ...updateData,
      },
    };
    const options = {
      upsert: true,
      new: true,
    };

    await this.threadCommentModel.findOneAndUpdate(query, update, options);
  }
}

