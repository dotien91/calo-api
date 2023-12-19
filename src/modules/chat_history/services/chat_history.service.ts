import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ObjectId } from "mongodb";
import { Model } from "mongoose";
import { CreateChatHistoryDto } from "../dto/create-chat_history.dto";
import { FilterChatHistoryDto } from "../dto/filter-chat_history.dto";
import { SortByChatHistoryDto } from "../dto/sort-by_chat_history.dto";
import { ChatHistory, ChatHistoryDocument } from "../schemas/chat_history.schema";

@Injectable()
export class ChatHistoryService {
  constructor(
    @InjectModel(ChatHistory.name)
    private chatHistoryModel: Model<ChatHistoryDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: FilterChatHistoryDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.chat_room_id) {
      condition = Object.assign(condition, { chat_room_id: filter.chat_room_id });
    }
    if (filter.topic_post_id) {
      condition = Object.assign(condition, { topic_post_id: filter.topic_post_id });
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
  getSort(sortBy: SortByChatHistoryDto) {
    let sort = { priority: -1 };

    if (sortBy.createdAt) {
      sort = Object.assign(sort, { _id: sortBy.createdAt === "DESC" ? -1 : 1 });
    }
    if (sortBy.updatedAt) {
      sort = Object.assign(sort, {
        updatedAt: sortBy.updatedAt === "DESC" ? -1 : 1,
      });
    }
    return sort;
  }

  /**
   * @author
   * @param createChatRoom
   * @returns
   */
  async create(createChatRoom: CreateChatHistoryDto): Promise<ChatHistoryDocument> {
    const createChatRoomData = new this.chatHistoryModel(createChatRoom);
    return await createChatRoomData.save();
  }

  /**
   *
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<ChatHistoryDocument[]> {
    return await this.chatHistoryModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filter(filter: FilterChatHistoryDto, sortBy: SortByChatHistoryDto, page: number, limit: number) {
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

    let dataRoom = await this.chatHistoryModel
      .find(condition, projection)
      .populate({
        path: "createBy",
        options: { strictPopulate: false },
        select:
          "user_login display_name user_role user_status user_avatar user_avatar_thumbnail user_avatar_square last_active user_active",
      })
      .populate({
        path: "media_ids",
        options: { strictPopulate: false },
        select: "media_url media_type media_thumbnail media_mime_type media_meta media_file_name createBy media_status",
      })
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataRoom;
  }

  /**
   *
   * @param dataToSearch
   * @returns
   */
  async findOneRoom(dataToSearch: FilterChatHistoryDto): Promise<ChatHistoryDocument> {
    return await this.chatHistoryModel.findOne(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  public count = async (filter: FilterChatHistoryDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.chatHistoryModel.estimatedDocumentCount();
      } else {
        return this.chatHistoryModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };
}
