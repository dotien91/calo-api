import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UpdateTopicJoinDto } from "../dto/update-topic_join.dto";
import { SearchTopicJoinDto } from "../dto/search-topic_join.dto";
import { SortByTopicJoinDto } from "../dto/sort_by-topic_join.dto";
import { TopicJoin, TopicJoinDocument } from "../schemas/topic_join.schema";

@Injectable()
export class TopicJoinService {
  constructor(
    @InjectModel(TopicJoin.name)
    private topicJoinModel: Model<TopicJoinDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchTopicJoinDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.topic_id) {
      condition = Object.assign(condition, { topic_id: filter.topic_id });
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
    if (filter.is_official) {
      condition = Object.assign(condition, { is_official: filter.is_official });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByTopicJoinDto) {
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
  async filter(filter: SearchTopicJoinDto, sortBy: SortByTopicJoinDto, page: number, limit: number) {
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

    let dataJoin = {
      path: "topic_id",
      options: { strictPopulate: false },
      populate: [{ path: "image" }, { path: "public_album" }, { path: "chat_room_id" }],
    };

    let dataReturn = await this.topicJoinModel
      .find(condition)
      .populate(
        "user_id",
        "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate(dataJoin)
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
  public count = async (filter: SearchTopicJoinDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.topicJoinModel.estimatedDocumentCount();
      } else {
        return this.topicJoinModel.countDocuments(condition);
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
    const createdTopic = new this.topicJoinModel(createUser);
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
  async findAll(): Promise<TopicJoin[]> {
    return this.topicJoinModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<TopicJoin> {
    return await this.topicJoinModel.findOne(dataToSearch).sort({ _id: -1 }).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<TopicJoin> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.topicJoinModel
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
    return await this.topicJoinModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async removeOne(dataRemove: any) {
    return await this.topicJoinModel.findOneAndDelete(dataRemove).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateTopicJoinDto) {
    try {
      console.log(dataUpdate, "dataUpdate");
      if (!dataUpdate.user_id && !dataUpdate.topic_id) {
        return null;
      }
      let dataReturn = await this.topicJoinModel.findOneAndUpdate(
        { user_id: dataUpdate.user_id, topic_id: dataUpdate.topic_id },
        { $set: dataUpdate },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (dataReturn._id) {
        return { ...dataReturn.toObject(), ...dataUpdate };
      } else {
        return dataReturn;
      }
    } catch (e) {
      console.log(e);
      return e;
    }
  }
}
