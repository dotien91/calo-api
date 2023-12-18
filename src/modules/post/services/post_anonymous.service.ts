import { Injectable } from "@nestjs/common";
import { CreatePostDto } from "../dto/create-post.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UpdatePostDto } from "../dto/update-post.dto";
import { SearchPostDto } from "../dto/search-post.dto";
import { SortByPostDto } from "../dto/sort_by-post.dto";
import { PostAnonymous, PostAnonymousDocument } from "../schemas/post_anonymous.schema";
import { SearchPostAnonymousDto } from "../dto/search-post_anonymous.dto";
import { CreateUserPromptDto } from "../dto/create-user_prompt.dto";

@Injectable()
export class PostAnonymousService {
  constructor(
    @InjectModel(PostAnonymous.name)
    private postAnonymousModel: Model<PostAnonymousDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchPostAnonymousDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.prompt_id) {
      condition = Object.assign(condition, { prompt_id: filter.prompt_id });
    }
    if (filter.from) {
      let dateFrom = new Date(filter.from);
      condition = Object.assign(condition, { createdAt: { $gte: dateFrom } });
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
  async filter(filter: SearchPostAnonymousDto, sortBy: SortByPostDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};
    let populateObject = {
      path: "prompt_id",
      populate: [
        {
          path: "post_category",
          populate: [
            {
              path: 'category_avatar'
            }
          ]
        },
      ],
    };

    let dataReturn = await this.postAnonymousModel
      .find(condition)
      .populate("user_id")
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
    let populateObject = {
      path: "prompt_id",
      populate: [
        {
          path: "post_category",
          populate: [
            {
              path: 'category_avatar'
            }
          ]
        },
      ],
    };
    let dataReturn = await this.postAnonymousModel
      .find(condition, projection)
      .populate("user_id")
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
  public count = async (filter: SearchPostDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.postAnonymousModel.estimatedDocumentCount();
      } else {
        return this.postAnonymousModel.countDocuments(condition);
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
  async create(createUser: CreateUserPromptDto) {
    const createdPost = new this.postAnonymousModel(createUser);
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
  async findAll(): Promise<PostAnonymous[]> {
    return this.postAnonymousModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<PostAnonymous> {
    let populateObject = {
      path: "prompt_id",
      populate: [
        {
          path: "post_category",
          populate: [
            {
              path: 'category_avatar'
            }
          ]
        },
      ],
    };
    return await this.postAnonymousModel
      .findOne(dataToSearch)
      .sort({ _id: -1 })
      .populate("user_id")
      .populate(populateObject)
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<PostAnonymous> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    let populateObject = {
      path: "prompt_id",
      populate: [
        {
          path: "post_category",
          populate: [
            {
              path: 'category_avatar'
            }
          ]
        },
      ],
    };
    return await this.postAnonymousModel
      .findById(objectId)
      .populate("user_id")
      .populate(populateObject)
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.postAnonymousModel.findByIdAndDelete(id).exec();
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
      let dataReturn = null;
      if (dataUpdate._id) {
        dataReturn = await this.postAnonymousModel.findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: false });
      } else {
        return null;
      }
    } catch (e) {
      return e;
    }
  }
}
