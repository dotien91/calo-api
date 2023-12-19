import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { CreateGiftDto } from "../dto/create-gift.dto";
import { Gift, GiftDocument } from "../schemas/gift.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UpdateGiftDto } from "../dto/update-gift.dto";
import { SearchGiftDto } from "../dto/search-gift.dto";
import { SortByGiftDto } from "../dto/sort_by-gift.dto";
import { CheckGiftPointLevelDto } from "../dto/check-gift-point-level.dto";
import {
  ChannelPermission,
  ChannelPermissionDocument,
} from "../../../modules/channel/schemas/channel_permission.schema";

@Injectable()
export class GiftService {
  constructor(
    @InjectModel(Gift.name)
    private giftModel: Model<GiftDocument>,
    @InjectModel(ChannelPermission.name)
    private channelPermission: Model<ChannelPermissionDocument>
  ) {}
  private readonly logger = new Logger(GiftService.name);

  /**
   * @author SonLH
   * @returns
   */
  async checkGiftUserDelivered(req: CheckGiftPointLevelDto) {
    let condition: any = {
      channel_id: req.channel_id,
      gift_type: "gift",
      $and: [
        { $or: [{ "gift_conditions.point": { $lte: req.point } }, { "gift_conditions.point": { $exists: false } }] },
        { $or: [{ "gift_conditions.level": { $lte: req.level } }, { "gift_conditions.level": { $exists: false } }] },
        { $or: [{ "gift_conditions.like": { $lte: req.total_like } }, { "gift_conditions.like": { $exists: false } }] },
        {
          $or: [
            { "gift_conditions.comment": { $lte: req.total_comment } },
            { "gift_conditions.comment": { $exists: false } },
          ],
        },
        {
          $or: [
            { "gift_conditions.course": { $lte: req.total_view_course } },
            { "gift_conditions.course": { $exists: false } },
          ],
        },
        { $or: [{ "gift_conditions.birth": 0 }, { "gift_conditions.birth": { $exists: false } }] },
      ],
    };
    let dataReturn = await this.giftModel.find(condition).exec();
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchGiftDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.gift_type) {
      condition = Object.assign(condition, { gift_type: filter.gift_type });
    }

    if (filter.channel_id) {
      condition = Object.assign(condition, { channel_id: filter.channel_id });
    }

    if (filter.course) {
      condition = Object.assign(condition, { "gift_conditions.course": { $gte: Number(filter.course) } });
    }
    if (filter.comment) {
      condition = Object.assign(condition, { "gift_conditions.comment": { $gte: Number(filter.comment) } });
    }
    if (filter.like) {
      condition = Object.assign(condition, { "gift_conditions.like": { $gte: Number(filter.like) } });
    }
    if (filter.level) {
      condition = Object.assign(condition, { "gift_conditions.level": { $gte: Number(filter.level) } });
    }
    if (filter.point) {
      condition = Object.assign(condition, { "gift_conditions.point": { $gte: Number(filter.point) } });
    }

    if (filter.coin) {
      condition = Object.assign(condition, { "gift_conditions.coin": { $gte: Number(filter.coin) } });
    }
    if (filter.birth) {
      condition = Object.assign(condition, { "gift_conditions.birth": { $gte: filter.birth } });
    }

    if (filter.hasOwnProperty("stock_qty")) {
      if (Number(filter.hasOwnProperty("stock_qty"))) {
        condition = Object.assign(condition, { stock_qty: { $gte: filter.stock_qty } });
      } else {
        condition = Object.assign(condition, { stock_qty: 0 });
      }
    }

    if (filter.date_time) {
      let dataDate = new Date(filter.date_time);
      condition = Object.assign(condition, {
        "gift_conditions.start_time": { $lte: dataDate },
        "gift_conditions.end_time": { $gte: dataDate },
      });
    }

    if (filter.date) {
      const now = new Date();
      const newDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
      condition = Object.assign(condition, {
        createdAt: { $gte: newDate },
      });
    }
    if (filter.search) {
      condition = Object.assign(condition, { $text: { $search: filter.search } });
    }
    console.log(condition, "condition");
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByGiftDto) {
    let sort = {};
    if (sortBy.createdAt) {
      sort = Object.assign(sort, { _id: sortBy.createdAt === "DESC" ? -1 : 1 });
    }
    if (sortBy.price) {
      sort = Object.assign(sort, { price: sortBy.price === "DESC" ? -1 : 1 });
    }
    if (sortBy.stock_qty) {
      sort = Object.assign(sort, { stock_qty: sortBy.stock_qty === "DESC" ? -1 : 1 });
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
  async filter(filter: SearchGiftDto, sortBy: SortByGiftDto, page: number, limit: number) {
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

    let dataReturn = await this.giftModel
      .find(condition, projection)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("media_id")
      .populate("gift_digital_media")
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
  public count = async (filter: SearchGiftDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.giftModel.estimatedDocumentCount();
      } else {
        return this.giftModel.countDocuments(condition);
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
  async create(createUser: CreateGiftDto): Promise<Gift> {
    const createdUser = new this.giftModel(createUser);
    return await createdUser.save();
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<Gift[]> {
    return this.giftModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<Gift> {
    return await this.giftModel
      .findOne(dataToSearch)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("media_id")
      .populate("gift_digital_media")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.giftModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateGiftDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.giftModel
        .findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { upsert: true, new: true, setDefaultsOnInsert: true })
        .populate(
          "user_id",
          "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
        )
        .populate("media_id")
        .populate("gift_digital_media");
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
   * @param dataFilter
   * @returns
   */
  async updateCount(dataFilter: any, dataUpdate: any) {
    try {
      console.log("running");
      return this.giftModel.findByIdAndUpdate(dataFilter, { $inc: dataUpdate });
    } catch (e) {
      return null;
    }
  }
}
