import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Cron, CronExpression } from "@nestjs/schedule";
import axios from "axios";
import { Model, Types } from "mongoose";
import { CreateLivestreamDto } from "../dto/create-livestream.dto";
import { SearchLivestreamDto } from "../dto/search-livestream.dto";
import { SortByLivestreamDto } from "../dto/sort_by-livestream.dto";
import { UpdateLivestreamDto } from "../dto/update-livestream.dto";
import { Livestream, LivestreamDocument } from "../schemas/livestream.schema";

const dataPopulateProduct = {
  path: "product_id",
  options: { strictPopulate: false },
  populate: [
    {
      path: "avatar",
    },
  ],
};

@Injectable()
export class LivestreamService {
  constructor(
    @InjectModel(Livestream.name)
    private livestreamModel: Model<LivestreamDocument>
  ) {}

  private readonly logger = new Logger(LivestreamService.name);
  private readonly MAX_ATTEMPT_RETRIES = 5;
  private checkingStreamContainer = {};

  @Cron(CronExpression.EVERY_5_SECONDS)
  async checkingAliveLivestream() {
    const safe = this;
    const livestreams = await this.livestreamModel.find({
      livestream_status: "live",
    });

    for (const livestream of livestreams) {
      const checkingUrl = livestream.livestream_data.m3u8_url;

      await axios
        .get(checkingUrl, {})
        .then(function (response) {
          if (response.status === 200) safe.checkingStreamContainer[livestream._id.toString()] = 0;
        })
        .catch(function (error) {
          if (error.message.search("404") !== -1)
            if (safe.checkingStreamContainer[livestream._id.toString()])
              safe.checkingStreamContainer[livestream._id.toString()] =
                safe.checkingStreamContainer[livestream._id.toString()] + 1;
            else safe.checkingStreamContainer[livestream._id.toString()] = 1;
        })
        .finally(async () => {
          for (const livestreamId of Object.keys(safe.checkingStreamContainer)) {
            if (safe.checkingStreamContainer[livestreamId] === safe.MAX_ATTEMPT_RETRIES) {
              await this.livestreamModel.findByIdAndUpdate(livestreamId, {
                livestream_status: "end",
              });
              delete safe.checkingStreamContainer[livestreamId];
            }
          }
        });
    }
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchLivestreamDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.language) {
      condition = Object.assign(condition, { language: filter.language });
    }
    if (filter.country) {
      condition = Object.assign(condition, { country: filter.country });
    }

    if (filter.ref_id) {
      condition = Object.assign(condition, { ref_id: filter.ref_id });
    }

    if (filter.livestream_status) {
      condition = Object.assign(condition, { livestream_status: filter.livestream_status });
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
  getSort(sortBy: SortByLivestreamDto) {
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
    filter: SearchLivestreamDto,
    sortBy: SortByLivestreamDto,
    page: number,
    limit: number
  ): Promise<Livestream[]> {
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

    let dataReturn = await this.livestreamModel
      .find(condition)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
      )
      .populate("media_id")
      .populate("ref_id")
      .populate(dataPopulateProduct)
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
    filter: SearchLivestreamDto,
    sortBy: SortByLivestreamDto,
    page: number,
    limit: number
  ): Promise<Livestream[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};
    let dataReturn = await this.livestreamModel
      .find(condition, projection)
      .populate("user_id")
      .populate("media_id")
      .populate("ref_id")
      .populate(dataPopulateProduct)
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
  public count = async (filter: SearchLivestreamDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.livestreamModel.estimatedDocumentCount();
      } else {
        return this.livestreamModel.countDocuments(condition);
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
  async create(createUser: CreateLivestreamDto) {
    const createdLivestream = new this.livestreamModel(createUser);
    let dataCreate = await createdLivestream.save();
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
  async findAll(): Promise<Livestream[]> {
    return this.livestreamModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<Livestream> {
    return await this.livestreamModel
      .findOne(dataToSearch)
      .sort({ _id: -1 })
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
      )
      .populate("media_id")
      .populate("ref_id")
      .populate(dataPopulateProduct)
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<Livestream> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.livestreamModel
      .findById(objectId)
      .populate(
        "user_id",
        "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
      )
      .populate("media_id")
      .populate("ref_id")
      .populate(dataPopulateProduct)
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.livestreamModel
      .findByIdAndDelete(id)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
      )
      .populate("media_id")
      .populate("ref_id")
      .populate(dataPopulateProduct)
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateLivestreamDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.livestreamModel
        .findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: true })
        .populate(
          "user_id",
          "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
        )
        .populate("media_id")
        .populate("ref_id")
        .populate(dataPopulateProduct);
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
      return this.livestreamModel.findByIdAndUpdate(dataFilter._id, { $inc: dataUpdate });
    } catch (e) {
      return null;
    }
  }
}
