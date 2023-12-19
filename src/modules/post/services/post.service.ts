import { Injectable } from "@nestjs/common";
import { CreatePostDto } from "../dto/create-post.dto";
import { PostDocument, Post } from "../schemas/post.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UpdatePostDto } from "../dto/update-post.dto";
import { SearchPostDto } from "../dto/search-post.dto";
import { SortByPostDto } from "../dto/sort_by-post.dto";
import { SearchAdminFilterDto } from "../../../modules/user/dto/search-admin_filter.dto";

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name)
    private orderModel: Model<PostDocument>
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
    if (filter.post_language) {
      condition = Object.assign(condition, { post_language: filter.post_language });
    }
    if (filter.post_type) {
      condition = Object.assign(condition, { post_type: filter.post_type });
    }
    if (filter.post_status) {
      condition = Object.assign(condition, { post_status: filter.post_status });
    }

    if (filter.other_status) {
      condition = Object.assign(condition, { other_status: filter.other_status });
    }

    if (filter.post_parent) {
      condition = Object.assign(condition, { post_parent: filter.post_parent });
    }

    if (filter.post_category) {
      condition = Object.assign(condition, { post_category: filter.post_category });
    }

    if (filter.categories) {
      condition = Object.assign(condition, { post_category: { $in: filter.categories } });
    }

    if (filter.search) {
      condition = Object.assign(condition, { $text: { $search: filter.search } });
    }
    if (filter.not_image) {
      condition = Object.assign(condition, { public_album: { $eq: [] } });
    }
    if (filter.not_download) {
      condition = Object.assign(condition, { downloads: { $eq: [] } });
    } else {
      //condition = Object.assign(condition, { downloads:  {$exists: true, $ne: []}});
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
  async filter(filter: SearchPostDto, sortBy: SortByPostDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    console.log(condition, "condition");
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};

    if (filter.search) {
      sortObject = { score: { $meta: "textScore" }, ...sortObject };
      projection = Object.assign(projection, { score: { $meta: "textScore" } });
    }

    let dataReturn = await this.orderModel
      .find(condition)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("post_avatar")
      .populate("post_category")
      .populate("public_album")
      .populate("downloads")
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
    let dataReturn = await this.orderModel
      .find(condition, projection)
      .populate("user_id")
      .populate("post_category")
      .populate("downloads")
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
        return this.orderModel.estimatedDocumentCount();
      } else {
        return this.orderModel.countDocuments(condition);
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
  async create(createUser: CreatePostDto) {
    const createdPost = new this.orderModel(createUser);
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
  async findAll(): Promise<Post[]> {
    return this.orderModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<Post> {
    return await this.orderModel
      .findOne(dataToSearch)
      .sort({ _id: -1 })
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("post_avatar")
      .populate("post_category")
      .populate("public_album")
      .populate("downloads")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<Post> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.orderModel
      .findById(objectId)
      .populate(
        "user_id",
        "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("post_category")
      .populate("downloads")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.orderModel.findByIdAndDelete(id).exec();
  }

  async updateUserEntity(dataUpdate: UpdatePostDto) {
    if (!dataUpdate._id) {
      return null;
    }
    if (dataUpdate._id && dataUpdate?.user_entity) {
      let dataReturn = await this.orderModel.findOneAndUpdate(
        { _id: dataUpdate?._id },
        {
          $addToSet: {
            //@ts-ignore
            user_entity: dataUpdate?.user_entity,
          },
        },
        { new: true }
      );
      return dataReturn;
    } else {
      return null;
    }
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdatePostDto) {
    console.log(dataUpdate);
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = null;
      if (dataUpdate._id) {
        dataReturn = await this.orderModel.findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: false });
      } else {
        if (dataUpdate?.download) {
          dataReturn = await this.orderModel.findOneAndUpdate(
            { post_slug: dataUpdate?.post_slug },
            {
              $addToSet: {
                //@ts-ignore
                downloads: dataUpdate?.download,
              },
            },
            { new: true }
          );
        } else if (dataUpdate?.image_public) {
          dataReturn = await this.orderModel.findOneAndUpdate(
            { post_slug: dataUpdate?.post_slug },
            {
              $addToSet: {
                //@ts-ignore
                public_album: dataUpdate?.image_public,
              },
            },
            { new: true }
          );
        } else {
          dataReturn = await this.orderModel.findOneAndUpdate(
            { post_slug: dataUpdate?.post_slug },
            { $set: dataUpdate },
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
   * @param dataFilter
   * @returns
   */
  async updateCount(dataFilter: any, dataUpdate: any) {
    try {
      return this.orderModel.findByIdAndUpdate(dataFilter._id, { $inc: dataUpdate });
    } catch (e) {
      return null;
    }
  }
}
