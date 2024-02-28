import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateChatRoomUserOptionDto } from "../dto/create-chat_room_user_option.dto";
import { FilterChatRoomDto } from "../dto/filter-chat_room.dto";
import { SearchChatRoom } from "../dto/search-chat_room.dto";
import { SortByChatRoomDto } from "../dto/sort_by-chat_room.dto";
import { UpdateChatRoomDto } from "../dto/update-chat_room.dto";
import { UpdateChatRoomUserDto } from "../dto/update-chat_room_user.dto";
import { ChatRoom as ChatRoomMongoose, ChatRoomDocument } from "../schemas/chat_room.schema";

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectModel(ChatRoomMongoose.name)
    private chatRoomModel: Model<ChatRoomDocument>
  ) {}

  async create(createChatRoom: CreateChatRoomUserOptionDto) {
    const createChatRoomData = new this.chatRoomModel(createChatRoom);
    return await createChatRoomData.save();
  }

  async findAll(): Promise<ChatRoomMongoose[]> {
    return await this.chatRoomModel.find().exec();
  }

  async findOneRoom(dataToSearch: SearchChatRoom) {
    return (await this.chatRoomModel.findOne(dataToSearch).exec())?.toObject();
  }

  async update(dataUpdate: UpdateChatRoomDto, isUpdateCount: boolean = false) {
    try {
      if (isUpdateCount) {
        return this.chatRoomModel.findByIdAndUpdate(
          dataUpdate._id,
          { $set: dataUpdate, $inc: { chat_history_count: 1 } },
          { new: true }
        );
      } else {
        const populateObject = [
          {
            path: "group_partners",
            select:
              "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status",
            // options: {
            //   limit: 2,
            // },
          },
          {
            path: "room_image",
          },
        ];
        return this.chatRoomModel
          .findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: true })
          .populate(populateObject);
      }
    } catch (e) {
      return null;
    }
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async updateByUser(dataUpdate: UpdateChatRoomUserDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      const dataReturn = await this.chatRoomModel.findByIdAndUpdate(
        dataUpdate._id,
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
  async getCondition(filter: FilterChatRoomDto) {
    let condition: any = {};
    if (filter.room_type) {
      condition = Object.assign(condition, { room_type: filter.room_type });
    }
    if (filter.group_partners) {
      condition = Object.assign(condition, { group_partners: { $in: filter.group_partners } });
    }
    if (Number(filter.room_private) === 0 || Number(filter.room_private) === 1) {
      condition = Object.assign(condition, { room_private: filter.room_private });
    }
    if (filter.unset) {
      condition = Object.assign(condition, { group_partners: { $ne: filter.unset } });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByChatRoomDto) {
    let sort = { priority: -1 };
    if (sortBy.createdAt) {
      sort = Object.assign(sort, { _id: sortBy.createdAt === "DESC" ? -1 : 1 });
    }
    if (sortBy.updatedAt) {
      sort = Object.assign(sort, { last_updated: sortBy.updatedAt === "DESC" ? -1 : 1 });
    }
    if (sortBy.numberMember) {
      sort = Object.assign(sort, { partner_count: sortBy.numberMember === "DESC" ? -1 : 1 });
    }
    return sort;
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  public count = async (filter: FilterChatRoomDto) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.chatRoomModel.estimatedDocumentCount();
      } else {
        return this.chatRoomModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };

  /**
   * @author Tony Vu
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filter(filter: FilterChatRoomDto, sortBy: SortByChatRoomDto, page: number, limit: number) {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const populateObject = [
      {
        path: "group_partners",
        select:
          "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status",
        // options: {
        //   limit: 2,
        // },
      },
      {
        path: "room_image",
      },
    ];
    const dataRoom = await this.chatRoomModel
      .find(condition, {})
      .populate(populateObject)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataRoom;
  }
}
