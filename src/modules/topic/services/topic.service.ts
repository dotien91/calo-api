import { Injectable } from "@nestjs/common";
import { CreateTopicDto } from "../dto/create-topic.dto";
import { TopicDocument, Topic } from "../schemas/topic.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UpdateTopicDto } from "../dto/update-topic.dto";
import { SearchTopicDto } from "../dto/search-topic.dto";
import { SortByTopicDto } from "../dto/sort_by-topic.dto";

@Injectable()
export class TopicService {
  constructor(
    @InjectModel(Topic.name)
    private topicModel: Model<TopicDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchTopicDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.is_official) {
      condition = Object.assign(condition, { is_official: filter.is_official });
    }
    if (filter.is_validate) {
      condition = Object.assign(condition, { is_validate: filter.is_validate });
    }
    if (filter.parent_id) {
      condition = Object.assign(condition, { parent_id: filter.parent_id });
    }
    if (filter.status) {
      condition = Object.assign(condition, { status: filter.status });
    }
    if (filter.is_parent) {
      condition = Object.assign(condition, { parent_id: null });
    }
    if (filter.is_child) {
      condition = Object.assign(condition, { parent_id: { $ne: null } });
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
  getSort(sortBy: SortByTopicDto) {
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
  async filter(filter: SearchTopicDto, sortBy: SortByTopicDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }

    let projection = {};

    if (filter.search) {
      sortObject = { score: { $meta: "textScore" }, ...sortObject };
      projection = Object.assign(projection, { score: { $meta: "textScore" } });
    }

    let dataReturn = await this.topicModel
      .find(condition)
      .populate(
        "user_id",
        "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("image")
      .populate("public_album")
      .populate("chat_room_id")
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
  public count = async (filter: SearchTopicDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.topicModel.estimatedDocumentCount();
      } else {
        return this.topicModel.countDocuments(condition);
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
  async create(createUser: any) {
    const createdTopic = new this.topicModel(createUser);
    let dataCreate = await createdTopic.save();
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
  async findAll(): Promise<Topic[]> {
    return this.topicModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<Topic> {
    return await this.topicModel.findOne(dataToSearch).sort({ _id: -1 }).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<Topic> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.topicModel
      .findById(objectId)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("image")
      .populate("public_album")
      .populate("chat_room_id")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.topicModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateTopicDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.topicModel.findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: false });
      if (dataReturn._id) {
        return { ...dataReturn.toObject(), ...dataUpdate };
      } else {
        return dataReturn;
      }
    } catch (e) {
      return e;
    }
  }
}
