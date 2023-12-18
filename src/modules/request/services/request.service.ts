import { Injectable, Logger } from "@nestjs/common";
import { CreateRequestDto } from "../dto/create-request.dto";
import { RequestDocument, Request } from "../schemas/request.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UpdateRequestDto } from "../dto/update-request.dto";
import { SearchPostDto } from "../dto/search-request.dto";
import { SortByPostDto } from "../dto/sort_by-request.dto";
import { SearchAdminFilterDto } from "../../../modules/user/dto/search-admin_filter.dto";
import HookExpress from '../../hook/hook_epress';
let initHook = false;

@Injectable()
export class RequestService {
  constructor(
    @InjectModel(Request.name)
    private requestModel: Model<RequestDocument>
  ) {
    if (initHook !== true) {
      this.initHook();
      initHook = true;
    }
  }
  private readonly logger = new Logger(RequestService.name);

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchPostDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.post_language) {
      condition = Object.assign(condition, { post_language: filter.post_language });
    }
    if (filter.post_type) {
      condition = Object.assign(condition, { post_type: filter.post_type });
    }

    if (!filter.post_status || filter.post_status.trim() === '') {
      condition = { ...condition, ...{ post_status: "publish" } };
    } else {
      condition = { ...condition, ...{ post_status: filter.post_status } };
    }

    if (filter.channel_id) {
      condition = Object.assign(condition, { channel_id: filter.channel_id });
    }

    if (filter.ref_id) {
      condition = Object.assign(condition, { ref_id: filter.ref_id });
    }

    if (filter.other_status) {
      condition = Object.assign(condition, { other_status: filter.other_status });
    }

    if (filter.data_json_type) {
      if (filter?.data_json_type?.indexOf(",") !== -1) {
        let dataFilterJsonTypeArray = filter?.data_json_type?.split(",");
        condition = Object.assign(condition, { data_json_type: { $in: dataFilterJsonTypeArray } });
      } else {
        condition = Object.assign(condition, { data_json_type: filter.data_json_type });
      }

    }
    if (filter.post_parent) {
      condition = Object.assign(condition, { post_parent: filter.post_parent });
    }

    if (filter.hasOwnProperty("is_pin")) {
      condition = Object.assign(condition, { is_pin: parseInt(filter.is_pin) });
    }

    if (filter.post_category) {
      if (filter.post_category?.indexOf(",") !== -1) {
        let dataRefArray = filter.post_category?.split(",");
        condition = Object.assign(condition, { post_category: { $in: dataRefArray } });
      } else {
        condition = Object.assign(condition, { post_category: filter.post_category });
      }
    }

    if (filter.country) {
      condition = Object.assign(condition, { country: filter.country });
    }

    if (filter.hasOwnProperty("is_pin")) {
      condition = Object.assign(condition, { is_pin: filter.is_pin });
    }

    if (filter.hasOwnProperty("comment_number")) {
      condition = Object.assign(condition, { comment_number: filter.comment_number });
    }

    if (filter.categories) {
      condition = Object.assign(condition, { post_category: { $in: filter.categories } });
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
  getSort(sortBy: SortByPostDto) {
    let sort = { is_pin: -1 };
    if (sortBy.updatedAt) {
      sort = Object.assign(sort, { updatedAt: sortBy.updatedAt === "DESC" ? -1 : 1 });
      delete sort.is_pin;
    }
    if (sortBy.createdAt) {
      sort = Object.assign(sort, { createdAt: sortBy.createdAt === "DESC" ? -1 : 1 });
    }
    if (sortBy.post_view) {
      sort = Object.assign(sort, { post_view: sortBy.post_view === "DESC" ? -1 : 1 });
    }
    if (sortBy.trending_number) {
      sort = Object.assign(sort, { trending_number: sortBy.trending_number === "DESC" ? -1 : 1 });
    }
    if (sortBy.like_number) {
      sort = Object.assign(sort, { like_number: sortBy.like_number === "DESC" ? -1 : 1 });
    }
    if (sortBy.dislike_number) {
      sort = Object.assign(sort, { dislike_number: sortBy.dislike_number === "DESC" ? -1 : 1 });
    }
    if (sortBy.vote_number) {
      sort = Object.assign(sort, { vote_number: sortBy.vote_number === "DESC" ? -1 : 1 });
    }
    if (sortBy.popular_number) {
      sort = Object.assign(sort, { popular_number: sortBy.popular_number === "DESC" ? -1 : 1 });
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
  async filter(filter: SearchPostDto, sortBy: SortByPostDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);

    let sortObject: any;
    if (sortBy) {
      if (filter.post_status === "cancel") {
        sortBy = Object.assign(sortBy, { updatedAt: "DESC" });
        delete sortBy?.createdAt
        sortObject = this.getSort(sortBy);
      } else {
        sortObject = this.getSort(sortBy);
      }
    }
    let projection = {};

    if (filter.search) {
      sortObject = { score: { $meta: "textScore" }, ...sortObject };
      projection = Object.assign(projection, { score: { $meta: "textScore" } });
    }
    let dataReturn = await this.requestModel
      .find(condition, projection)
      .populate(
        "user_id",
        "_id user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("post_avatar")
      .populate("post_category")
      .populate("attach_files")
      .populate("post_information")
      .populate(await this.handleGetDataPopulatePoll(page, limit, sortObject))
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
  async filterAdmin(filter: SearchPostDto, sortBy: SortByPostDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};
    let dataReturn = await this.requestModel
      .find(condition, projection)
      .populate(
        "user_id",
        "user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("post_avatar")
      .populate("post_category")
      .populate("attach_files")
      .populate("post_information")
      .populate(await this.handleGetDataPopulatePoll(page, limit, sortObject))
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
  public count = async (filter: SearchPostDto) => {
    try {
      let condition = await this.getCondition(filter);
      let sortObject = {};
      let projection = {};
      if (filter.search) {
        sortObject = { score: { $meta: "textScore" }, ...sortObject };
        projection = Object.assign(projection, { score: { $meta: "textScore" } });
      }
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.requestModel.estimatedDocumentCount();
      } else {
        return this.requestModel.countDocuments(condition, projection);
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
  async create(createUser: CreateRequestDto) {
    const createdPost = new this.requestModel(createUser);
    let dataCreate = await createdPost.save();
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
  async findAll(): Promise<Request[]> {
    return this.requestModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<Request> {
    return await this.requestModel
      .findOne(dataToSearch)
      .sort({ _id: -1 })
      .populate(
        "user_id",
        "user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("post_avatar")
      .populate("post_category")
      .populate("attach_files")
      .populate("post_information")
      .populate(await this.handleGetDataPopulatePoll(1, 10, { _id: -1 }))
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<Request> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.requestModel
      .findById(objectId)
      .populate(
        "user_id",
        "_id user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("post_avatar")
      .populate("post_category")
      .populate("attach_files")
      .populate("post_information")
      .populate(await this.handleGetDataPopulatePoll(1, 10, { _id: -1 }))
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.requestModel.findByIdAndDelete(id).exec();
  }

  async removeOne(dataRemove: any) {
    return await this.requestModel.deleteOne(dataRemove);
  }

  async handleGetDataPopulatePoll(page: number, limit: number, sortObject: any) {
    let dataSort = sortObject ? sortObject : { _id: -1 };
    delete dataSort.score;
    return {
      path: "poll_ids",
      populate: [
        {
          path: "users_choose",
          select:
            "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active",
          options: {
            limit: limit,
            sort: dataSort,
            skip: limit * (page - 1),
          },
        },
      ],
    };
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateRequestDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = null;

      if (dataUpdate._id) {
        dataReturn = await this.requestModel
          .findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: true })
          .populate(
            "user_id",
            "user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
          )
          .populate("post_avatar")
          .populate("post_category")
          .populate("post_information")
          .populate(await this.handleGetDataPopulatePoll(1, 10, { _id: -1 }))
          .populate("attach_files");
      }
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
      if (dataUpdate?.vote_number) {
        dataUpdate = {
          ...dataUpdate,
          ...{ trending_number: Math.abs(dataUpdate?.vote_number), popular_number: Math.abs(dataUpdate?.vote_number) },
        };
      }
      if (dataUpdate?.comment_number) {
        dataUpdate = {
          ...dataUpdate,
          ...{ popular_number: dataUpdate?.comment_number, trending_number: dataUpdate?.comment_number },
        };
      }
      return this.requestModel.findByIdAndUpdate(dataFilter._id, { $inc: dataUpdate }, { new: true });
    } catch (e) {
      return null;
    }
  }

  initHook() {
    console.log('Make sure you work once request %s', Math.random())
    HookExpress.add_action('request.delete-request-by-channel-permission', async (data: any) => {
      try {
        await this.deleteMultipleRequestByChannelPermission(data);
      } catch (error) {
        this.logger.log(error.message)
      }
    })
  }

  /**
     * @author SonLH
     * @param channel_permission
     * @returns
     */
  async deleteMultipleRequestByChannelPermission(channel_permission: any) {
    try {
      await this.requestModel.deleteMany({
        channel_id: channel_permission?.channel_id,
        user_id: channel_permission?.user_id
      })
    } catch (e) {
      return null;
    }
  }

}
