import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreatePodcastDto } from "../dto/create-podcast.dto";
import { SearchPostDto } from "../dto/search-podcast.dto";
import { SortByPodcastDto } from "../dto/sort_by-podcast.dto";
import { UpdatePodcastDto } from "../dto/update-podcast.dto";
import { Podcast, PodcastDocument } from "../schemas/podcast.schema";

@Injectable()
export class PodcastService {
  constructor(
    @InjectModel(Podcast.name)
    private podcastModel: Model<PodcastDocument>
  ) {}

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
    if (filter.podcast_language) {
      condition = Object.assign(condition, { podcast_language: filter.podcast_language });
    }
    if (filter.podcast_type) {
      condition = Object.assign(condition, { podcast_type: filter.podcast_type });
    }
    if (filter.podcast_status) {
      condition = Object.assign(condition, { podcast_status: filter.podcast_status });
    }

    if (filter.other_status) {
      condition = Object.assign(condition, { other_status: filter.other_status });
    }

    if (filter.post_parent) {
      condition = Object.assign(condition, { post_parent: filter.post_parent });
    }

    if (filter.podcast_category) {
      if (filter.podcast_category?.indexOf(",") !== -1) {
        const dataRefArray = filter.podcast_category?.split(",");
        condition = Object.assign(condition, { podcast_category: { $in: dataRefArray } });
      } else {
        condition = Object.assign(condition, { podcast_category: filter.podcast_category });
      }
    }

    if (filter.country) {
      condition = Object.assign(condition, { country: filter.country });
    }

    if (filter.hasOwnProperty("comment_number")) {
      condition = Object.assign(condition, { comment_number: filter.comment_number });
    }

    if (filter.categories) {
      condition = Object.assign(condition, { podcast_category: { $in: filter.categories } });
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
  getSort(sortBy: SortByPodcastDto) {
    let sort = {};
    if (sortBy.createdAt) {
      sort = Object.assign(sort, { createdAt: sortBy.createdAt === "DESC" ? -1 : 1 });
    }
    if (sortBy.post_view) {
      sort = Object.assign(sort, { post_view: sortBy.post_view === "DESC" ? -1 : 1 });
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
  async filter(filter: SearchPostDto, sortBy: SortByPodcastDto, page: number, limit: number) {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};

    if (filter.search) {
      sortObject = { score: { $meta: "textScore" }, ...sortObject };
      projection = Object.assign(projection, { score: { $meta: "textScore" } });
    }
    const dataReturn = await this.podcastModel
      .find(condition, projection)
      .populate(
        "user_id",
        "_id user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
      )
      .populate("post_avatar")
      .populate("podcast_category")
      .populate("attach_files")
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
  async filterAdmin(filter: SearchPostDto, sortBy: SortByPodcastDto, page: number, limit: number) {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const projection = {};
    const dataReturn = await this.podcastModel
      .find(condition, projection)
      .populate(
        "user_id",
        "user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
      )
      .populate("post_avatar")
      .populate("podcast_category")
      .populate("attach_files")
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
      const condition = await this.getCondition(filter);
      let sortObject = {};
      let projection = {};
      if (filter.search) {
        sortObject = { score: { $meta: "textScore" }, ...sortObject };
        projection = Object.assign(projection, { score: { $meta: "textScore" } });
      }
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.podcastModel.estimatedDocumentCount();
      } else {
        return this.podcastModel.countDocuments(condition, projection);
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
  async create(createUser: CreatePodcastDto) {
    const createdPost = new this.podcastModel(createUser);
    const dataCreate = await createdPost.save();
    return dataCreate;
  }

  /**
   * @author Tony Vu
   * @param userId
   * @returns boolean
   */
  async isSuperAdmin(userId: string) {
    const superAdmin = process.env.SUPER_ADMIN;
    if (superAdmin) {
      const superAdminArray = superAdmin.split(",");
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
  async findAll(): Promise<Podcast[]> {
    return this.podcastModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<Podcast> {
    return await this.podcastModel
      .findOne(dataToSearch)
      .sort({ _id: -1 })
      .populate(
        "user_id",
        "user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
      )
      .populate("post_avatar")
      .populate("podcast_category")
      .populate("attach_files")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<Podcast> {
    if (!id) {
      return null;
    }
    const objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.podcastModel
      .findById(objectId)
      .populate(
        "user_id",
        "_id user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
      )
      .populate("post_avatar")
      .populate("podcast_category")
      .populate("attach_files")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.podcastModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdatePodcastDto) {
    try {
      let dataReturn = null;

      if (dataUpdate._id) {
        dataReturn = await this.podcastModel
          .findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: true })
          .populate(
            "user_id",
            "user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
          )
          .populate("post_avatar")
          .populate("podcast_category")
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
      return this.podcastModel.findByIdAndUpdate(dataFilter._id, { $inc: dataUpdate }, { new: true });
    } catch (e) {
      return null;
    }
  }
}
