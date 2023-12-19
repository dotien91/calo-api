import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateChannelDto } from "../dto/create-channel.dto";
import { SearchChannelDto } from "../dto/search-channel.dto";
import { SortByChannelDto } from "../dto/sort_by-channel.dto";
import { UpdateChannelDto } from "../dto/update-channel.dto";
import { Channel, ChannelDocument } from "../schemas/channel.schema";

@Injectable()
export class ChannelService {
  constructor(
    @InjectModel(Channel.name)
    private channelModel: Model<ChannelDocument>
  ) {}
  private readonly logger = new Logger(ChannelService.name);
  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchChannelDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.language) {
      condition = Object.assign(condition, { language: filter.language });
    }

    if (filter.public_status) {
      condition = Object.assign(condition, { public_status: filter.public_status });
    }

    if (filter.domain) {
      condition = Object.assign(condition, { domain: filter.domain });
    }

    if (filter.sub_domain) {
      condition = Object.assign(condition, { sub_domain: filter.sub_domain });
    }

    if (filter.hashtag_id) {
      condition = Object.assign(condition, { hashtag_id: filter.hashtag_id });
    }

    // if (filter.ref_id) {
    //   if (filter.ref_id?.indexOf(",") !== -1) {
    //     let dataRefArray = filter.ref_id?.split(",");
    //     condition = Object.assign(condition, { ref_id: { $in: dataRefArray } });
    //   } else {
    //     condition = Object.assign(condition, { ref_id: filter.ref_id });
    //   }
    // }

    if (filter.ids) {
      let dataIds = filter.ids.split(",");
      condition = Object.assign(condition, { _id: { $in: dataIds } });
    }

    if (filter.search && filter?.search?.indexOf("https") == -1) {
      condition = Object.assign(condition, { $text: { $search: filter.search } });
    }
    if (filter.search && filter?.search?.indexOf("https") != -1) {
      condition = Object.assign(condition, { domain: filter.search });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByChannelDto) {
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
  async filter(filter: SearchChannelDto, sortBy: SortByChannelDto, page: number, limit: number): Promise<Channel[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};

    if (Number(limit) == 1 && process.env.BRANCH_NAME === "live_video") {
      let countData = await this.count(filter);
      page = Math.floor(Math.random() * (countData - 1 + 1) + 1);
    }

    if (filter.search && filter.search?.indexOf("https") == -1) {
      sortObject = { score: { $meta: "textScore" }, ...sortObject };
      projection = Object.assign(projection, { score: { $meta: "textScore" } });
    }

    let dataReturn = await this.channelModel
      .find(condition)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("attach_files")
      .populate("avatar")
      .populate("bank_qr_code")
      .populate("service_id")
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filterAdmin(
    filter: SearchChannelDto,
    sortBy: SortByChannelDto,
    page: number,
    limit: number
  ): Promise<Channel[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};
    let dataReturn = await this.channelModel
      .find(condition, projection)
      .populate("user_id")
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
  public count = async (filter: SearchChannelDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.channelModel.estimatedDocumentCount();
      } else {
        return this.channelModel.countDocuments(condition);
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
  async create(createUser: CreateChannelDto) {
    const createdChannel = new this.channelModel(createUser);
    let dataCreate = await createdChannel.save();
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
  async findAll(dataToSearch?: any): Promise<Channel[]> {
    return this.channelModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<Channel> {
    return await this.channelModel
      .findOne(dataToSearch)
      .sort({ _id: -1 })
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("attach_files")
      .populate("avatar")
      .populate("bank_qr_code")
      .populate("service_id")
      .exec();
  }

  /**
   *
   * @param dataUpdate
   * @returns
   */
  async updateArray(dataUpdate: UpdateChannelDto, isPull: boolean = false) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = null;
      if (dataUpdate._id) {
        let dataId = dataUpdate?._id;
        delete dataUpdate?._id;
        if (isPull) {
          dataReturn = await this.channelModel.findOneAndUpdate(
            { _id: dataId },
            {
              //@ts-ignore
              $pull: dataUpdate,
            },
            { new: true }
          );
        } else {
          dataReturn = await this.channelModel.findOneAndUpdate(
            { _id: dataId },
            {
              //@ts-ignore
              $addToSet: dataUpdate,
            },
            { new: true }
          );
        }
      }
      //Update Version
      await this.updateCount({ _id: dataUpdate?._id }, { channel_version: 1 });
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
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<Channel> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.channelModel
      .findById(objectId)
      .populate(
        "user_id",
        "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("attach_files")
      .populate("avatar")
      .populate("bank_qr_code")
      .populate("service_id")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.channelModel
      .findByIdAndDelete(id)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("attach_files")
      .populate("avatar")
      .populate("bank_qr_code")
      .populate("service_id")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateChannelDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.channelModel
        .findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: true })
        .populate(
          "user_id",
          "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
        )
        .populate("attach_files")
        .populate("avatar")
        .populate("bank_qr_code")
        .populate("service_id");
      await this.updateCount({ _id: dataUpdate?._id }, { channel_version: 1 });
      return dataReturn;
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
      return this.channelModel.findByIdAndUpdate(dataFilter._id, { $inc: dataUpdate });
    } catch (e) {
      return null;
    }
  }

  /**
   * @author SonLH
   * @param channelId
   * @returns
   */
  async getTypeService(channelId: string): Promise<any> {
    try {
      const result = await this.channelModel.aggregate([
        {
          $match: { _id: new Types.ObjectId(channelId) },
        },
        {
          $lookup: {
            from: "subscribes",
            localField: "_id",
            foreignField: "channel_id",
            as: "subscriptions",
          },
        },
        {
          $lookup: {
            from: "handleservices",
            localField: "subscriptions.service_id",
            foreignField: "_id",
            as: "services",
          },
        },
        {
          $unwind: "$services",
        },
        {
          $project: {
            type: "$services.type",
          },
        },
      ]);
      if (result.length > 0) {
        return result[0].type;
      } else {
        return null;
      }
    } catch (error) {
      this.logger.log(error.message);
      return null;
    }
  }
}
