import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { FilterThreadDTO } from "../dtos/thread.dto";
import { Thread, ThreadDocument } from "../schemas/thread.schema";

@Injectable()
export class ThreadService {
  constructor(
    @InjectModel(Thread.name)
    private threadModel: Model<ThreadDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser): Promise<Thread> {
    const createdUser = new this.threadModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async remove(dataToSearch: any): Promise<any> {
    await this.threadModel.deleteMany(dataToSearch);
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(pattern?: any): Promise<Thread[]> {
    return this.threadModel.find(pattern).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<Thread> {
    return await this.threadModel.findOne(dataToSearch).exec();
  }

  async findById(id: string): Promise<any> {
    return await this.threadModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "media",
          localField: "attach_files",
          foreignField: "_id",
          as: "attach_files",
        },
      },
      {
        $lookup: {
          from: "threadcomments",
          localField: "_id",
          foreignField: "thread_id",
          as: "thread_comments",
        },
      },
      {
        $unwind: "$thread_comments",
      },
      {
        $lookup: {
          from: "media",
          localField: "thread_comments.attach_files",
          foreignField: "_id",
          as: "thread_comments.attach_files",
        },
      },
      {
        $group: {
          _id: "$_id",
          thread_comments: { $addToSet: "$thread_comments" },
          class_id: {
            $first: "$class_id",
          },
          user_id: {
            $first: "$user_id",
          },
          thread_content: {
            $first: "$thread_content",
          },
          thread_type: {
            $first: "$thread_type",
          },
          comment_count: {
            $first: "$comment_count",
          },
          createdAt: {
            $first: "$createdAt",
          },
          updatedAt: {
            $first: "$updatedAt",
          },
          attach_files: {
            $first: "$attach_files",
          },
        },
      },
    ]);
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: any) {
    try {
      let dataReturn = await this.threadModel.findOneAndUpdate(
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

  async updateCount(dataFilter: any, dataUpdate: any) {
    try {
      return this.threadModel.findByIdAndUpdate(dataFilter._id, { $inc: dataUpdate });
    } catch (e) {
      return null;
    }
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  public count = async (filter: FilterThreadDTO) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.threadModel.estimatedDocumentCount();
      } else {
        return this.threadModel.countDocuments(condition);
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

  getCondition(filter: FilterThreadDTO) {
    let condition: any = {};

    if (filter.search) {
      condition = Object.assign(condition, {
        thread_content: {
          $regex: filter.search,
          $options: "i",
        },
      });
    }

    if (filter.class_id) {
      condition = Object.assign(condition, { class_id: filter.class_id });
    }

    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }

    if (filter.thread_type) {
      condition = Object.assign(condition, { thread_type: filter.thread_type });
    }

    return condition;
  }

  async filter(
    filter: FilterThreadDTO,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<Thread[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.threadModel
      .find(condition, projection)
      .sort(sortObject)
      .populate(
        "user_id",
        "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail user_avatar_square last_active user_active official_status"
      )
      .populate("attach_files")
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }
}

