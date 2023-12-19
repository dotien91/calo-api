import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreatePostCrawlDto } from "../dto/create-post_crawl.dto";
import { SearchPostDto } from "../dto/search-post.dto";
import { SortByPostDto } from "../dto/sort_by-post.dto";
import { UpdatePostDto } from "../dto/update-post.dto";
import { PostCrawl, PostCrawlDocument } from "../schemas/post_crawl.schema";

@Injectable()
export class PostCrawlService {
  constructor(
    @InjectModel(PostCrawl.name)
    private postCrawlModel: Model<PostCrawlDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: any) {
    let condition: any = {};
    if (Number(filter.status) == 0) {
      condition = Object.assign(condition, { status: { $ne: "1" } });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByPostDto) {
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
  async filter(filter: any, sortBy: SortByPostDto, page: number, limit: number) {
    const condition = await this.getCondition(filter);
    console.log(condition, "condition");
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const projection = {};
    const dataReturn = await this.postCrawlModel
      .find(condition)
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
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const projection = {};
    const dataReturn = await this.postCrawlModel
      .find(condition, projection)
      .populate("user_id")
      .populate("post_category")
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
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.postCrawlModel.estimatedDocumentCount();
      } else {
        return this.postCrawlModel.countDocuments(condition);
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
  async create(createUser: CreatePostCrawlDto) {
    const createdPost = new this.postCrawlModel(createUser);
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
  async findAll(dataToSearch?: any): Promise<PostCrawl[]> {
    return this.postCrawlModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<PostCrawl> {
    return await this.postCrawlModel.findOne(dataToSearch).sort({ _id: -1 }).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<PostCrawl> {
    if (!id) {
      return null;
    }
    const objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.postCrawlModel
      .findById(objectId)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("post_category")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.postCrawlModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdatePostDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      const dataReturn = await this.postCrawlModel.findByIdAndUpdate(
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
}
