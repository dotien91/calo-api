import { Injectable } from "@nestjs/common";
import { CreateOrderDto } from "../dto/create-order.dto";
import { OrderDocument, Order } from "../schemas/order.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UpdateOrderDto } from "../dto/update-order.dto";
import { SearchOrderDto } from "../dto/search-order.dto";
import { SortByOrderDto } from "../dto/sort_by-order.dto";
import { SearchAdminFilterDto } from "../../../modules/user/dto/search-admin_filter.dto";
import { VnpayLog, VnpayLogDocument } from "../schemas/vnpay_log.schema";

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectModel(VnpayLog.name)
    private vnpayModel: Model<VnpayLogDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchOrderDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.payment_method) {
      condition = Object.assign(condition, { payment_method: filter.payment_method });
    }
    if (filter.plan_id) {
      condition = Object.assign(condition, { plan_id: filter.plan_id });
    }

    if (filter.channel_id) {
      condition = Object.assign(condition, { channel_id: filter.channel_id });
    }

    if (filter.trans_id) {
      condition = Object.assign(condition, { trans_id: filter.trans_id });
    }

    if (filter.plan_type) {
      condition = Object.assign(condition, { plan_type: filter.plan_type });
    }
    if (filter.service_id) {
      condition = Object.assign(condition, { service_id: filter.service_id });
    }
    if (filter.service_not_in) {
      condition = Object.assign(condition, { service_not_in: { $nin: filter.service_not_in } });
    }

    if (filter.status) {
      condition = Object.assign(condition, { status: filter.status });
    }
    if (filter.status_array) {
      condition = Object.assign(condition, { status: { $in: filter.status_array } });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getConditionAdmin(filter: SearchAdminFilterDto) {
    let condition: any = {};

    if (filter.payment_method) {
      condition = Object.assign(condition, { payment_method: filter.payment_method });
    }
    if (filter.plan_id) {
      condition = Object.assign(condition, { plan_id: filter.plan_id });
    }
    if (filter.service_id) {
      condition = Object.assign(condition, { service_id: filter.service_id });
    }
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.status) {
      condition = Object.assign(condition, { status: filter.status });
    }
    if (filter.from && filter.to) {
      let dateFrom = new Date(filter.from);
      let dateTo = new Date(filter.to);
      condition = Object.assign(condition, { createdAt: { $gte: dateFrom, $lte: dateTo } });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByOrderDto) {
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
  async filter(filter: SearchOrderDto, sortBy: SortByOrderDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.orderModel
      .find(condition)
      .populate(
        "user_id",
        "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("plan_id")
      .populate("media_id")
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
  async filterAdmin(filter: SearchAdminFilterDto, sortBy: SortByOrderDto, page: number, limit: number) {
    let condition = await this.getConditionAdmin(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};

    if (filter.user_birthday_year_from && filter.user_birthday_year_to) {
      let dataPopulate = {
        path: "user_id",
        options: { strictPopulate: false },
        select:
          "_id bio description user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active",
        populate: {
          path: "user_option_id",
          match: {
            user_birthday_year: {
              $gte: filter?.user_birthday_year_from?.toString(),
              $lte: filter?.user_birthday_year_to?.toString(),
            },
          },
        },
      };

      let dataReturn = await this.orderModel
        .find(condition, projection)
        .populate(dataPopulate)
        .populate("plan_id")
        .populate("media_id")
        .sort(sortObject)
        .skip(limit * (page - 1))
        .limit(limit)
        .exec()
        .then((orders) => orders.filter((order) => order.user_id.user_option_id != null));
      return dataReturn;
    } else {
      let dataPopulate = {
        path: "user_id",
        options: { strictPopulate: false },
        select:
          "_id bio description user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active",
        populate: { path: "user_option_id" },
      };
      let dataReturn = await this.orderModel
        .find(condition, projection)
        .populate(dataPopulate)
        .populate("plan_id")
        .populate("media_id")
        .sort(sortObject)
        .skip(limit * (page - 1))
        .limit(limit)
        .exec();
      return dataReturn;
    }
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  public countAdmin = async (filter: SearchAdminFilterDto) => {
    try {
      let condition = await this.getConditionAdmin(filter);
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
   * @param filter
   * @returns
   */
  public count = async (filter: SearchOrderDto) => {
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
  async create(createUser: CreateOrderDto) {
    const createdOrder = new this.orderModel(createUser);
    let dataCreate = await createdOrder.save();
    return dataCreate;
  }

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async createVnpayLog(createUser: any) {
    const createdOrder = new this.vnpayModel(createUser);
    let dataCreate = await createdOrder.save();
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
  async findAll(): Promise<Order[]> {
    return this.orderModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<Order> {
    return await this.orderModel.findOne(dataToSearch).sort({ _id: -1 }).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<Order> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }

    let populateObject = {
      path: "service_id",
      populate: [
        {
          path: "avatar",
        },
        {
          path: "avatar",
        },
      ],
    };

    return await this.orderModel
      .findById(objectId)
      .populate(
        "user_id",
        "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("plan_id")
      .populate("media_id")
      .populate(populateObject)
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

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateOrderDto) {
    try {
      let populateObject = {
        path: "service_id",
        populate: [
          {
            path: "avatar",
          },
          {
            path: "avatar",
          },
        ],
      };
      if (!dataUpdate._id) {
        return null;
      }
      if (dataUpdate?.status === "success") {
        dataUpdate = { ...dataUpdate, ...{ billing_on: new Date() } };
      }
      let dataReturn = await this.orderModel
        .findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: true })
        .populate(
          "user_id",
          "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
        )
        .populate("plan_id")
        .populate("media_id")
        .populate(populateObject);
      return dataReturn;
    } catch (e) {
      return e;
    }
  }
}
