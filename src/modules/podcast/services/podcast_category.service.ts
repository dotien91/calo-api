import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreatePodcastCategoryDto } from "../dto/create-podcast_category.dto";
import { SearchPodcastCategoryDto } from "../dto/search-podcast_category.dto";
import { SortByPodcastCategoryDto } from "../dto/sort_by-podcast_category.dto";
import { UpdatePodcastCategoryDto } from "../dto/update-podcast_category.dto";
import { PodcastCategory, PodcastCategoryDocument } from "../schemas/podcast-category.schema";

@Injectable()
export class PodcastCategoryService {
  constructor(
    @InjectModel(PodcastCategory.name)
    private podcastModel: Model<PodcastCategoryDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchPodcastCategoryDto) {
    let condition: any = {};
    if (filter.search) {
      const dataSearch = `${filter.search}`;
      const dataRegex = new RegExp("^" + dataSearch.toLowerCase(), "i");
      // console.log(dataRegex);
      // condition = Object.assign(condition, { $text: { $search: dataRegex } });
      condition = Object.assign(condition, { $or: [{ category_title: dataRegex }, { category_content: dataRegex }] });
    }

    if (filter?.version) {
      condition = Object.assign(condition, { version: { $gte: parseInt(filter?.version) } });
    }

    if (filter.hasOwnProperty("public_status")) {
      condition = Object.assign(condition, { public_status: filter?.public_status });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByPodcastCategoryDto) {
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
  async filter(filter: SearchPodcastCategoryDto, sortBy: SortByPodcastCategoryDto, page: number, limit: number) {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }

    const dataReturn = await this.podcastModel
      .find(condition)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
      )
      .populate("category_avatar")
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
  async filterAdmin(filter: SearchPodcastCategoryDto, sortBy: SortByPodcastCategoryDto, page: number, limit: number) {
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
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
      )
      .populate("category_avatar")
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
  public count = async (filter: SearchPodcastCategoryDto) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.podcastModel.estimatedDocumentCount();
      } else {
        return this.podcastModel.countDocuments(condition);
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
  async create(createUser: CreatePodcastCategoryDto) {
    const createdPost = new this.podcastModel(createUser);
    const dataCreate = await createdPost.save();
    return dataCreate;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<PodcastCategory[]> {
    return this.podcastModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<PodcastCategory> {
    return await this.podcastModel
      .findOne(dataToSearch)
      .sort({ _id: -1 })
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
      )
      // .populate("category_avatar")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<PodcastCategory> {
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
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
      )
      .populate("category_avatar")
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
  async update(dataUpdate: UpdatePodcastCategoryDto) {
    try {
      let dataReturn = null;
      dataReturn = await this.podcastModel.findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: false });
      return { ...dataReturn.toObject(), ...dataUpdate };
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
      return this.podcastModel.findByIdAndUpdate(dataFilter._id, { $inc: dataUpdate });
    } catch (e) {
      return null;
    }
  }
}
