import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateTicketDto } from "../dto/create-ticket.dto";
import { SearchPostDto } from "../dto/search-ticket.dto";
import { SortByPostDto } from "../dto/sort_by-ticket.dto";
import { UpdateTicketDto } from "../dto/update-ticket.dto";
import { Ticket, TicketDocument } from "../schemas/ticket.schema";

@Injectable()
export class TicketService {
  constructor(
    @InjectModel(Ticket.name)
    private ticketModel: Model<TicketDocument>
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

    if (filter.channel_id) {
      condition = Object.assign(condition, { channel_id: filter.channel_id });
    }

    if (filter.other_status) {
      condition = Object.assign(condition, { other_status: filter.other_status });
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
  async filter(filter: SearchPostDto, sortBy: SortByPostDto, page: number, limit: number) {
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
    let dataReturn = await this.ticketModel
      .find(condition, projection)
      .populate(
        "user_id",
        "_id user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("post_avatar")
      .populate("post_category")
      .populate("attach_files")
      .populate("data_id")
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
    let dataReturn = await this.ticketModel
      .find(condition, projection)
      .populate(
        "user_id",
        "user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("post_avatar")
      .populate("post_category")
      .populate("attach_files")
      .populate("data_id")
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
        return this.ticketModel.estimatedDocumentCount();
      } else {
        return this.ticketModel.countDocuments(condition, projection);
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
  async create(createUser: CreateTicketDto) {
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
  async findAll(dataToSearch?: any): Promise<Ticket[]> {
    return this.ticketModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<Ticket> {
    return await this.ticketModel
      .findOne(dataToSearch)
      .sort({ _id: -1 })
      .populate(
        "user_id",
        "user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("post_avatar")
      .populate("post_category")
      .populate("attach_files")
      .populate("data_id")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<Ticket> {
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
        "_id user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("post_avatar")
      .populate("post_category")
      .populate("attach_files")
      .populate("data_id")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.ticketModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateTicketDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = null;

      if (dataUpdate._id) {
        dataReturn = await this.ticketModel
          .findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: true })
          .populate(
            "user_id",
            "user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
          )
          .populate("post_avatar")
          .populate("post_category")
          .populate("attach_files")
          .populate("data_id");
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
      return this.ticketModel.findByIdAndUpdate(dataFilter._id, { $inc: dataUpdate }, { new: true });
    } catch (e) {
      return null;
    }
  }
}
