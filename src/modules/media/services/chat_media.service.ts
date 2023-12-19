import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateChatMediaDto } from "../dto/create-chat_media.dto";
import { FilterChatMediaDto } from "../dto/filter-chat_media.dto";
import { SortByChatMediaDto } from "../dto/sort_by-chat_media.dto";
import { ChatMedia, ChatMediaDocument } from "../schemas/chat_media.schema";

@Injectable()
export class ChatMediaService {
  constructor(
    @InjectModel(ChatMedia.name)
    private chatMediaService: Model<ChatMediaDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: FilterChatMediaDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.createBy) {
      condition = Object.assign(condition, { createBy: filter.createBy });
    }
    if (filter.chat_room_id) {
      condition = Object.assign(condition, {
        chat_room_id: filter.chat_room_id,
      });
    }
    if (filter.media_status) {
      condition = Object.assign(condition, {
        media_status: filter.media_status,
      });
    }
    if (filter.function_type) {
      condition = Object.assign(condition, {
        function_type: filter.function_type,
      });
    }
    if (filter.media_type) {
      if (filter.media_type.indexOf(",") === -1) {
        condition = Object.assign(condition, { media_type: filter.media_type });
      } else {
        const arrayMediaType = filter.media_type.split(",");
        condition = Object.assign(condition, { media_type: { $in: arrayMediaType } });
      }
    }
    if (filter.ids) {
      condition = Object.assign(condition, { _id: { $in: filter.ids } });
    }

    if (filter.from && filter.to) {
      const dateFrom = new Date(filter.from);
      const dateTo = new Date(filter.to);
      condition = Object.assign(condition, { createdAt: { $gte: dateFrom, $lte: dateTo } });
    }

    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByChatMediaDto) {
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
  async create(createChatRoom: CreateChatMediaDto): Promise<ChatMediaDocument> {
    const createChatRoomData = new this.chatMediaService(createChatRoom);
    return await createChatRoomData.save();
  }

  /**
   *
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<ChatMediaDocument[]> {
    return await this.chatMediaService.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<ChatMedia> {
    if (!id) {
      return null;
    }
    const objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.chatMediaService.findById(objectId).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<ChatMedia> {
    return await this.chatMediaService.findOne(dataToSearch).sort({ _id: -1 }).exec();
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
    filter: FilterChatMediaDto,
    sortBy: SortByChatMediaDto,
    page: number,
    limit: number,
    projection: object = {}
  ) {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }

    if (!filter.is_history) {
      const dataRoom = await this.chatMediaService
        .find(condition, projection)
        .populate({
          path: "createBy",
          options: { strictPopulate: false },
          select:
            "user_login display_name user_role user_status user_avatar user_avatar_thumbnail user_avatar_square last_active user_active",
        })
        .sort(sortObject)
        .skip(limit * (page - 1))
        .limit(limit)
        .exec();
      return dataRoom;
    } else {
      const dataRoom = await this.chatMediaService
        .find(condition, projection)
        .sort(sortObject)
        .skip(limit * (page - 1))
        .limit(limit)
        .exec();
      return dataRoom;
    }
  }

  /**
   *
   * @param dataToSearch
   * @returns
   */
  async findOneRoom(dataToSearch: FilterChatMediaDto): Promise<ChatMediaDocument> {
    return (await this.chatMediaService.findOne(dataToSearch).exec()).toObject();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  public count = async (filter: FilterChatMediaDto) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.chatMediaService.estimatedDocumentCount();
      } else {
        return this.chatMediaService.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };

  async update(dataUpdate: any) {
    try {
      return this.chatMediaService.findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: true });
    } catch (e) {
      return null;
    }
  }
}
