import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateUserGiftDto } from "../dto/create-user_gift.dto";
import { SearchUserGiftDto } from "../dto/search-user_gift.dto";
import { SortByUserGiftDto } from "../dto/sort_by-user_gift.dto";
import { UpdateUserGiftDto } from "../dto/update-user_gift.dto";
import { UserGift, UserGiftDocument } from "../schemas/user_gift.schema";

@Injectable()
export class UserGiftService {
  constructor(
    @InjectModel(UserGift.name)
    private userUserGiftModel: Model<UserGiftDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchUserGiftDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.gift_id) {
      condition = Object.assign(condition, { gift_id: filter.gift_id });
    }

    if (filter.channel_id) {
      condition = Object.assign(condition, { channel_id: filter.channel_id });
    }
    if (filter.gift_status) {
      condition = Object.assign(condition, { gift_status: filter.gift_status });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByUserGiftDto) {
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
  async filter(filter: SearchUserGiftDto, sortBy: SortByUserGiftDto, page: number, limit: number) {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const populateObject = {
      path: "gift_id",
      populate: [
        {
          path: "media_id",
        },
      ],
    };
    const dataReturn = await this.userUserGiftModel
      .find(condition)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate(populateObject)
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
  public count = async (filter: SearchUserGiftDto) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.userUserGiftModel.estimatedDocumentCount();
      } else {
        return this.userUserGiftModel.countDocuments(condition);
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
  async create(createUser: CreateUserGiftDto): Promise<UserGift> {
    const createdUser = new this.userUserGiftModel(createUser);
    return await createdUser.save();
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<UserGift[]> {
    return this.userUserGiftModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<UserGift> {
    const populateObject = {
      path: "gift_id",
      populate: [
        {
          path: "media_id",
        },
      ],
    };
    return await this.userUserGiftModel.findOne(dataToSearch).sort({ _id: -1 }).populate(populateObject).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.userUserGiftModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateUserGiftDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      const populateObject = {
        path: "gift_id",
        populate: [
          {
            path: "media_id",
          },
        ],
      };
      const dataReturn = await this.userUserGiftModel
        .findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { upsert: true, new: true, setDefaultsOnInsert: true })
        .populate(populateObject)
        .populate(
          "user_id",
          "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
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
}
