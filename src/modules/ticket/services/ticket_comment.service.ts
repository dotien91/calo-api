import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { TicketComment, TicketCommentDocument } from "../schemas/ticket-comment.schema";
import { SearchTicketCategoryDto } from "../dto/search-ticket_category.dto";
import { SearchTicketCommentDto } from "../dto/search-ticket_comment.dto";
import { UpdateTicketCommentDto } from "../dto/update-ticket_comment.dto";
import { CreateTicketCommentDto } from "../dto/create-ticket_comment.dto";
import { SortByTicketCommentDto } from "../dto/sort_by-ticket_comment.dto";
import { ObjectId } from "mongodb";

@Injectable()
export class TicketCommentService {
  constructor(
    @InjectModel(TicketComment.name)
    private ticketModel: Model<TicketCommentDocument>
  ) { }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchTicketCommentDto) {
    let condition: any = {};

    if (filter?.parent_id) {
      condition = Object.assign(condition, { parent_id: filter.parent_id });
    } else {
      condition = Object.assign(condition, { parent_id: null });
    }

    if (filter?.ticket_id) {
      condition = Object.assign(condition, { ticket_id: filter?.ticket_id });
    }

    if (filter?.user_id) {
      condition = Object.assign(condition, { user_id: filter?.user_id });
    }

    if (filter.from_id || filter.to_id) {
      let dataFilter = {};
      if (filter.from_id) {
        let objectIdFrom = new ObjectId(filter?.from_id);
        dataFilter = { ...dataFilter, ...{ $gt: objectIdFrom } };
      }
      if (filter.to_id) {
        let objectIdTo = new ObjectId(filter?.to_id);
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
  getSort(sortBy: SortByTicketCommentDto) {
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
  async filter(filter: SearchTicketCommentDto, sortBy: SortByTicketCommentDto, page: number, limit: number) {
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

    let limitChild = filter.limit_child ? filter.limit_child : 1000;
    let pageChild = filter.page_child ? filter.page_child : 1;
    let orderByOBjectChild = { _id: 1 };

    if (filter.order_by_child) {
      orderByOBjectChild = { ...orderByOBjectChild, ...{ _id: filter.order_by_child === "DESC" ? -1 : 1 } };
    }

    let dataPopulateChild = {
      path: "child",
      options: {
        limit: limitChild,
        sort: orderByOBjectChild,
        skip: limitChild * (pageChild - 1),
      },
      populate: {
        path: "user_id",
        select:
          "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active",
      },
    };
    let dataReturn = await this.ticketModel
      .find(condition)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate(dataPopulateChild)
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
  async filterAdmin(filter: SearchTicketCommentDto, sortBy: SortByTicketCommentDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};

    let dataPopulateChild = {
      path: "child",
      options: {
        limit: limit,
        sort: { sortObject },
        skip: 0,
      },
      populate: {
        path: "user_id",
        select:
          "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active",
      },
    };
    let dataReturn = await this.ticketModel
      .find(condition, projection)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("attach_files")
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
  public count = async (filter: SearchTicketCategoryDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.ticketModel.estimatedDocumentCount();
      } else {
        return this.ticketModel.countDocuments(condition);
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
  async create(createUser: CreateTicketCommentDto) {
    const createdPost = new this.ticketModel(createUser);
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
  async findAll(): Promise<TicketComment[]> {
    return this.ticketModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<TicketComment> {
    return await this.ticketModel
      .findOne(dataToSearch)
      .sort({ _id: -1 })
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("attach_files")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<TicketComment> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.ticketModel
      .findById(objectId)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("attach_files")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findByIdPopulate(id: string): Promise<TicketComment> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.ticketModel
      .findById(objectId)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("attach_files")
      .populate("ticket_id")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string): Promise<any> {
    return await this.ticketModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateTicketCommentDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = null;
      if (dataUpdate._id) {
        dataReturn = await this.ticketModel.findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: false });
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
  async updateArray(dataUpdate: UpdateTicketCommentDto, isPull: boolean = false) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = null;
      if (dataUpdate._id) {
        let dataId = dataUpdate?._id;
        delete dataUpdate?._id;
        if (isPull) {
          dataReturn = await this.ticketModel.findOneAndUpdate(
            { _id: dataId },
            {
              //@ts-ignore
              $pull: dataUpdate,
            },
            { new: true }
          );
        } else {
          dataReturn = await this.ticketModel.findOneAndUpdate(
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
      return this.ticketModel.findByIdAndUpdate(dataFilter._id, { $inc: dataUpdate });
    } catch (e) {
      return null;
    }
  }
}
