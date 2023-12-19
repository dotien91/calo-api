import { Injectable } from "@nestjs/common";
import { CreatePostDto } from "../dto/create-post.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UpdatePostDto } from "../dto/update-post.dto";
import { SortByPostDto } from "../dto/sort_by-post.dto";
import { PromptHistory, PromptHistoryDocument } from "../schemas/prompt_history.schema";
import { SearchPromptHistoryDto } from "../dto/search-prompt_history.dto";
import { ObjectId } from "mongodb";
import { CreatePromptHistoryDto } from "../dto/create-prompt_history.dto";

@Injectable()
export class PromptHistoryService {
  constructor(
    @InjectModel(PromptHistory.name)
    private promptHistoryModel: Model<PromptHistoryDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchPromptHistoryDto) {
    let condition: any = {};
    if (filter.chat_status) {
      condition = Object.assign(condition, { chat_status: filter.chat_status });
    }
    if (filter.chat_type) {
      condition = Object.assign(condition, { chat_type: filter.chat_type });
    }
    if (filter.createBy) {
      condition = Object.assign(condition, { createBy: filter.createBy });
    }
    if (filter.parent_id) {
      condition = Object.assign(condition, { parent_id: filter.parent_id });
    }
    if (filter.prompt_user) {
      condition = Object.assign(condition, { prompt_user: filter.prompt_user });
    }

    if (filter.from_id || filter.to_id) {
      let dataFilter = {};
      if (filter.from_id) {
        let objectIdFrom = new ObjectId(filter?.from_id);
        dataFilter = { ...dataFilter, ...{ $gt: objectIdFrom } };
      }
      if (filter.to_id) {
        let objectIdTo = new ObjectId(filter?.to_id);
        dataFilter = { ...dataFilter, ...{ $lte: objectIdTo } };
      }
      condition = Object.assign(condition, { _id: dataFilter });
    }

    if (filter.search) {
      condition = Object.assign(condition, { $text: { $search: filter.search } });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByPostDto) {
    let sort = { priority: -1 };
    if (sortBy.createdAt) {
      sort = Object.assign(sort, { _id: sortBy.createdAt === "DESC" ? -1 : 1 });
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
  async filter(filter: SearchPromptHistoryDto, sortBy: SortByPostDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }

    let populateObject = {
      path: "prompt_user",
      populate: [
        {
          path: "prompt_id",
        },
      ],
    };

    let dataReturn = await this.promptHistoryModel
      .find(condition)
      .populate("createBy")
      .populate("parent_id")
      .populate(populateObject)
      .populate("media_ids")
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
  public count = async (filter: SearchPromptHistoryDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.promptHistoryModel.estimatedDocumentCount();
      } else {
        return this.promptHistoryModel.countDocuments(condition);
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
  async create(createUser: CreatePromptHistoryDto) {
    try {
      const createdPost = new this.promptHistoryModel(createUser);
      let dataCreate = await createdPost.save();
      return dataCreate;
    } catch (error) {
      console.log(error);
      return null;
    }
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
  async findAll(): Promise<PromptHistory[]> {
    return this.promptHistoryModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<PromptHistory> {
    return await this.promptHistoryModel
      .findOne(dataToSearch)
      .sort({ _id: -1 })
      .populate("createBy")
      .populate("parent_id")
      .populate("prompt_user")
      .populate("media_ids")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<PromptHistory> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.promptHistoryModel
      .findById(objectId)
      .populate("createBy")
      .populate("parent_id")
      .populate("prompt_user")
      .populate("media_ids")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.promptHistoryModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataFilter
   * @returns
   */
  async updateCount(dataFilter: any, dataUpdate: any) {
    try {
      return this.promptHistoryModel.findByIdAndUpdate(dataFilter._id, { $inc: dataUpdate });
    } catch (e) {
      return null;
    }
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdatePostDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = null;
      if (dataUpdate._id) {
        dataReturn = await this.promptHistoryModel.findByIdAndUpdate(
          dataUpdate._id,
          { $set: dataUpdate },
          { new: false }
        );
      } else {
        return null;
      }
    } catch (e) {
      return e;
    }
  }
}
