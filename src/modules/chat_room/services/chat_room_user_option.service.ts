import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateChatRoomUserOptionDto } from "../dto/create-chat_room_user_option.dto";
import { FilterChatRoomDto } from "../dto/filter-chat_room.dto";
import { SearchChatRoomUserOption } from "../dto/search-chat_room_user_option.dto";
import { SortByChatRoomDto } from "../dto/sort_by-chat_room.dto";
import { ChatRoomUserOption, ChatRoomUserOptionDocument } from "../schemas/chat_room_user_option.schema";

@Injectable()
export class ChatRoomUserOptionService {
  constructor(
    @InjectModel(ChatRoomUserOption.name)
    private chatRoomUserOptionModel: Model<ChatRoomUserOptionDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: FilterChatRoomDto) {
    let condition: any = {};

    // should not get chat room with blocked user
    condition = Object.assign(condition, { partner_id: { $nin: filter.blocked_user || [] } });

    if (!filter.room_type || filter.room_type !== "group") {
      condition = Object.assign(condition, { chat_history_count: { $gt: 0 } });
    }
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.partner_id) {
      condition = Object.assign(condition, { partner_id: filter.partner_id });
    }
    if (["group", "personal", "anonymous"].includes(filter.room_type)) {
      condition = Object.assign(condition, { room_type: filter.room_type });
    }
    if (filter.chat_room_id) {
      condition = Object.assign(condition, { chat_room_id: filter.chat_room_id });
    }
    if (filter.is_reply) {
      condition = Object.assign(condition, { is_reply: filter.is_reply });
    }
    if (filter.ref_user) {
      condition = Object.assign(condition, { ref_user: filter.ref_user });
    }
    if (filter.room_private) {
      condition = Object.assign(condition, { "chat_room_id.room_private": filter.room_private });
    }

    if (filter.from && filter.to) {
      let dateFrom = new Date(filter.from);
      let dateTo = new Date(filter.to);
      condition = Object.assign(condition, { createdAt: { $gte: dateFrom, $lte: dateTo } });
    }

    if (filter.read_count) {
      if (filter.read_count === "read") {
        condition = Object.assign(condition, { read_count: 0 });
      }
      if (filter.read_count === "unread") {
        condition = Object.assign(condition, { read_count: { $gt: 0 } });
      }
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
    return sort;
  }

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateChatRoomUserOptionDto) {
    const createdUser = new this.chatRoomUserOptionModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll() {
    return this.chatRoomUserOptionModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: SearchChatRoomUserOption) {
    let populateObject = {
      path: "chat_room_id",
      populate: [
        {
          path: "group_partners",
          select:
            "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail user_avatar_square last_active user_active official_status",
          options: {
            limit: 2,
          },
        },
        {
          path: "room_image",
        },
        {
          path: "first_history",
          select: "createBy",
        },
      ],
    };
    return await this.chatRoomUserOptionModel
      .findOne(dataToSearch, {})
      .populate(populateObject)
      .populate({
        path: "partner_id",
        options: { strictPopulate: false },
        select:
          "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail user_avatar_square last_active user_active official_status",
      })
      .exec();
  }

  async findAllChatRoom(dataToSearch: any) {
    let populateObject = {
      path: "chat_room_id",
      populate: [
        {
          path: "group_partners",
          select:
            "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail user_avatar_square last_active user_active official_status",
          options: {
            limit: 2,
          },
        },
        {
          path: "room_image",
        },
        {
          path: "first_history",
          select: "createBy",
        },
      ],
    };
    return await this.chatRoomUserOptionModel
      .find(dataToSearch, {})
      .populate(populateObject)
      .populate({
        path: "partner_id",
        options: { strictPopulate: false },
        select:
          "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail user_avatar_square last_active user_active official_status",
      })
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOneWithId(dataToSearch: SearchChatRoomUserOption) {
    return await this.chatRoomUserOptionModel
      .findOne(dataToSearch, {})
      .populate({ path: "chat_room_id", options: { strictPopulate: false } })
      .exec();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filter(filter: FilterChatRoomDto, sortBy: SortByChatRoomDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }

    let populateObject = {
      path: "chat_room_id",
      populate: [
        {
          path: "group_partners",
          select:
            "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail user_avatar_square last_active user_active official_status",
          // options: {
          //   limit: 3,
          // },
        },
        {
          path: "room_image",
        },
        {
          path: "first_history",
          select: "createBy",
        },
      ],
    };
    let dataRoom = await this.chatRoomUserOptionModel
      .find(condition, { _id: false })
      .populate(
        "partner_id",
        "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail user_avatar_square last_active user_active official_status"
      )
      .populate(populateObject)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec()
      .then((rooms) => rooms.filter((room) => room.chat_room_id != null));
    return dataRoom;
  }

  /**
   * @author Tony Vu
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filterWithoutPage(filter: FilterChatRoomDto, sortBy: SortByChatRoomDto) {
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let populateObject = {
      path: "chat_room_id",
    };
    let dataRoom = await this.chatRoomUserOptionModel
      .find(filter)
      .populate(
        "partner_id",
        "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail user_avatar_square last_active user_active official_status"
      )
      .populate(populateObject)
      .sort(sortObject)
      .exec();
    return dataRoom;
  }

  /**
   * @author Tony Vu
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filterWithUserObject(filter: FilterChatRoomDto, sortBy: SortByChatRoomDto) {
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let populateObject = {
      path: "chat_room_id",
    };
    let dataRoom = await this.chatRoomUserOptionModel
      .find(filter)
      .populate(
        "user_id",
        "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail user_avatar_square last_active user_active official_status"
      )
      .populate(populateObject)
      .sort(sortObject)
      .exec();
    return dataRoom;
  }

  /**
   * @author Tony Vu
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filterMember(filter: FilterChatRoomDto, sortBy: SortByChatRoomDto, page: number, limit: number) {
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataRoom = await this.chatRoomUserOptionModel
      .find(filter, { _id: false })
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail user_avatar_square last_active user_active official_status"
      )
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataRoom;
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  public count = async (filter: FilterChatRoomDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.chatRoomUserOptionModel.estimatedDocumentCount();
      } else {
        return this.chatRoomUserOptionModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };

  /**
   * @author Tony Vu
   * @param dataFilter
   * @returns
   */
  async updateCount(dataFilter: any) {
    try {
      return this.chatRoomUserOptionModel.updateMany(
        dataFilter,
        { $inc: { chat_history_count: 1 }, last_updated: Date.now() },
        { new: true }
      );
    } catch (e) {
      return null;
    }
  }

  /**
   * @author Tony Vu
   * @param dataFilter
   * @returns
   */
  async updateMany(dataFilter: any, dataUpdate: any) {
    try {
      return this.chatRoomUserOptionModel.updateMany(dataFilter, { $set: dataUpdate }, { new: true });
    } catch (e) {
      return null;
    }
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: any) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.chatRoomUserOptionModel.findByIdAndUpdate(
        dataUpdate._id,
        { $set: dataUpdate },
        { new: false }
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
   * @param dataUpdate
   * @returns
   */
  async findOneAndUpdate(dataFind: any, dataUpdate: any) {
    try {
      let dataReturn = await this.chatRoomUserOptionModel.findOneAndUpdate(
        dataFind,
        { $set: dataUpdate },
        { new: true }
      );
      return dataReturn;
    } catch (e) {
      return e;
    }
  }

  async incCountView(filter: FilterChatRoomDto) {
    try {
      let condition = await this.getCondition(filter);
      return this.chatRoomUserOptionModel.findOneAndUpdate(condition, { $inc: { read_count: 1 } }, { new: true });
    } catch (e) {
      return null;
    }
  }

  async incCountVideo(filter: FilterChatRoomDto, numberCount: number) {
    try {
      return this.chatRoomUserOptionModel.findOneAndUpdate(
        filter,
        { $inc: { call_count: numberCount } },
        { new: true }
      );
    } catch (e) {
      return null;
    }
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async updateByCondition(filter: FilterChatRoomDto, dataUpdate: any) {
    try {
      let condition = await this.getCondition(filter);
      let dataReturn = await this.chatRoomUserOptionModel.findOneAndUpdate(
        condition,
        { $set: dataUpdate },
        { new: false }
      );
      if (dataReturn?._id) {
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
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.chatRoomUserOptionModel.findByIdAndDelete(id).exec();
  }
}
