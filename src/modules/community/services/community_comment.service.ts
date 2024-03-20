import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateCommunityCommentDto } from "../dto/create-community_comment.dto";
import { SearchCommunityCategoryDto } from "../dto/search-community_category.dto";
import { SearchCommunityCommentDto } from "../dto/search-community_comment.dto";
import { SortByCommunityCommentDto } from "../dto/sort_by-community_comment.dto";
import { UpdateCommunityCommentDto } from "../dto/update-community_comment.dto";
import { CommunityComment, CommunityCommentDocument } from "../schemas/community-comment.schema";

@Injectable()
export class CommunityCommentService {
  constructor(
    @InjectModel(CommunityComment.name)
    private communityModel: Model<CommunityCommentDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchCommunityCommentDto, isCounting = false) {
    let condition: any = {};

    if (filter?.parent_id) {
      condition = Object.assign(condition, { parent_id: filter.parent_id });
    } else if (!isCounting) {
      condition = Object.assign(condition, { parent_id: null });
    }

    if (filter?.community_id) {
      condition = Object.assign(condition, { community_id: filter?.community_id });
    }

    if (filter?.user_id) {
      condition = Object.assign(condition, { user_id: filter?.user_id });
    }

    if (filter.from_id || filter.to_id) {
      let dataFilter = {};
      if (filter.from_id) {
        const objectIdFrom = new Types.ObjectId(filter?.from_id);
        dataFilter = { ...dataFilter, ...{ $gt: objectIdFrom } };
      }
      if (filter.to_id) {
        const objectIdTo = new Types.ObjectId(filter?.to_id);
        dataFilter = { ...dataFilter, ...{ $lte: objectIdTo } };
      }
      condition = Object.assign(condition, { _id: dataFilter });
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
  getSort(sortBy: SortByCommunityCommentDto) {
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
  async filter(filter: SearchCommunityCommentDto, sortBy?: SortByCommunityCommentDto, page?: number, limit?: number) {
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

    const limitChild = filter.limit_child ? filter.limit_child : 1000;
    const pageChild = filter.page_child ? filter.page_child : 1;
    let orderByOBjectChild = { _id: 1 };

    if (filter.order_by_child) {
      orderByOBjectChild = { ...orderByOBjectChild, ...{ _id: filter.order_by_child === "DESC" ? -1 : 1 } };
    }

    const dataPopulateChild = {
      path: "child",
      options: {
        limit: limitChild,
        sort: orderByOBjectChild,
        skip: limitChild * (pageChild - 1),
      },
      populate: {
        path: "user_id",
        select:
          "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status level",
      },
    };
    const dataReturn = await this.communityModel
      .find(condition)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status level"
      )
      .populate(dataPopulateChild)
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
  async filterAdmin(filter: SearchCommunityCommentDto, sortBy: SortByCommunityCommentDto, page: number, limit: number) {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const projection = {};

    const dataPopulateChild = {
      path: "child",
      options: {
        limit: limit,
        sort: { sortObject },
        skip: 0,
      },
      populate: {
        path: "user_id",
        select:
          "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status",
      },
    };
    const dataReturn = await this.communityModel
      .find(condition, projection)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
      )
      .populate(dataPopulateChild)
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
  public count = async (filter: SearchCommunityCategoryDto) => {
    try {
      const condition = await this.getCondition(filter, true);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.communityModel.estimatedDocumentCount();
      } else {
        return this.communityModel.countDocuments(condition);
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
  async create(createUser: CreateCommunityCommentDto) {
    const createdPost = new this.communityModel(createUser);
    const dataCreate = await createdPost.save();
    return dataCreate;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(pattern: any): Promise<CommunityComment[]> {
    return this.communityModel.find(pattern).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<CommunityComment> {
    return await this.communityModel
      .findOne(dataToSearch)
      .sort({ _id: -1 })
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
      )
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<CommunityComment> {
    if (!id) {
      return null;
    }
    const objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.communityModel
      .findById(objectId)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
      )
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findByIdPopulate(id: string): Promise<CommunityComment> {
    if (!id) {
      return null;
    }
    const objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.communityModel
      .findById(objectId)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
      )
      .populate("community_id")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.communityModel.findByIdAndDelete(id).exec();
  }

  async deleteManyByIds(ids: string[]): Promise<any> {
    return await this.communityModel
      .deleteMany({
        _id: {
          $in: ids,
        },
      })
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateCommunityCommentDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = null;
      if (dataUpdate._id) {
        dataReturn = await this.communityModel.findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: false });
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
   *
   * @param dataUpdate
   * @returns
   */
  async updateArray(dataUpdate: UpdateCommunityCommentDto, isPull: boolean = false) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = null;
      if (dataUpdate._id) {
        const dataId = dataUpdate?._id;
        delete dataUpdate?._id;
        if (isPull) {
          dataReturn = await this.communityModel.findOneAndUpdate(
            { _id: dataId },
            {
              //@ts-ignore
              $pull: dataUpdate,
            },
            { new: true }
          );
        } else {
          dataReturn = await this.communityModel.findOneAndUpdate(
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
   * @param dataFilter
   * @returns
   */
  async updateCount(dataFilter: any, dataUpdate: any) {
    try {
      return this.communityModel.findByIdAndUpdate(dataFilter._id, { $inc: dataUpdate });
    } catch (e) {
      return null;
    }
  }
}
