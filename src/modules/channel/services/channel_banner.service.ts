import { Injectable } from "@nestjs/common";
import { CreateChannelBannerDto } from "../dto/create-channel_banner.dto";
import { ChannelBannerDocument, ChannelBanner } from "../schemas/channel_banner.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UpdateChannelBannerDto } from "../dto/update-channel_banner.dto";
import { SearchChannelBannerDto } from "../dto/search-channel_banner.dto";
import { SortByChannelBannerDto } from "../dto/sort_by-channel_banner.dto";
import { SearchAdminFilterDto } from "../../../modules/user/dto/search-admin_filter.dto";

@Injectable()
export class ChannelBannerService {
  constructor(
    @InjectModel(ChannelBanner.name)
    private channelBannerModel: Model<ChannelBannerDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchChannelBannerDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.channel_id) {
      condition = Object.assign(condition, { channel_id: filter.channel_id });
    }
    if (filter.banner_type) {
      condition = Object.assign(condition, { banner_type: filter.banner_type });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByChannelBannerDto) {
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
  async filter(
    filter: SearchChannelBannerDto,
    sortBy: SortByChannelBannerDto,
    page: number,
    limit: number
  ): Promise<ChannelBanner[]> {
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

    let dataReturn = await this.channelBannerModel
      .find(condition)
      .populate("media_id")
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
    filter: SearchChannelBannerDto,
    sortBy: SortByChannelBannerDto,
    page: number,
    limit: number
  ): Promise<ChannelBanner[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};
    let dataReturn = await this.channelBannerModel
      .find(condition, projection)
      .populate("media_id")
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
  public count = async (filter: SearchChannelBannerDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.channelBannerModel.estimatedDocumentCount();
      } else {
        return this.channelBannerModel.countDocuments(condition);
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
  async create(createUser: CreateChannelBannerDto) {
    const createdChannelBanner = new this.channelBannerModel(createUser);
    let dataCreate = await createdChannelBanner.save();
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
  async findAll(): Promise<ChannelBanner[]> {
    return this.channelBannerModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<ChannelBanner> {
    return await this.channelBannerModel.findOne(dataToSearch).sort({ _id: -1 }).populate("media_id").exec();
  }

  /**
   *
   * @param dataUpdate
   * @returns
   */
  async updateArray(dataUpdate: UpdateChannelBannerDto, isPull: boolean = false) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = null;
      if (dataUpdate._id) {
        let dataId = dataUpdate?._id;
        delete dataUpdate?._id;
        if (isPull) {
          dataReturn = await this.channelBannerModel.findOneAndUpdate(
            { _id: dataId },
            {
              //@ts-ignore
              $pull: dataUpdate,
            },
            { new: true }
          );
        } else {
          dataReturn = await this.channelBannerModel.findOneAndUpdate(
            { _id: dataId },
            {
              //@ts-ignore
              $addToSet: dataUpdate,
            },
            { new: true }
          );
        }
      }
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
  async findById(id: string): Promise<ChannelBanner> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.channelBannerModel.findById(objectId).populate("media_id").exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.channelBannerModel.findByIdAndDelete(id).populate("media_id").exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateChannelBannerDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.channelBannerModel
        .findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: true })
        .populate("media_id");
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
      return this.channelBannerModel.findByIdAndUpdate(dataFilter._id, { $inc: dataUpdate });
    } catch (e) {
      return null;
    }
  }
}
