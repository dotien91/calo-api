import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as moment from "moment-timezone";
import mongoose, { Model, Types } from "mongoose";
import { SearchAdminFilterDto } from "../../../modules/user/dto/search-admin_filter.dto";
import { EmailService } from "../../email/services/email.service";
import { EmailPattern } from "../../email/services/email.service.i";
import { SearchOrderDto } from "../dto/search-order.dto";
import { SortByOrderDto } from "../dto/sort_by-order.dto";
import { UpdateOrderDto } from "../dto/update-order.dto";
import { Order, OrderDocument } from "../schemas/order.schema";
import { VnpayLog, VnpayLogDocument } from "../schemas/vnpay_log.schema";

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectModel(VnpayLog.name)
    private vnpayModel: Model<VnpayLogDocument>,

    private emailService: EmailService
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
      const dateFrom = new Date(filter.from);
      const dateTo = new Date(filter.to);
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
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.orderModel
      .find(condition)
      .populate(
        "user_id",
        "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
      )
      // .populate("plan_id")
      .populate("media_id")
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  async getOrdersByStatus(status: string) {
    const dataReturn = await this.orderModel
      .find({
        status,
      })
      .populate(
        "user_id",
        "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status"
      )
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
    const condition = await this.getConditionAdmin(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const projection = {};

    const dataPopulate = {
      path: "user_id",
      options: { strictPopulate: false },
      select:
        "_id bio description user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status",
    };
    const dataReturn = await this.orderModel
      .find(condition, projection)
      .populate(dataPopulate)
      // .populate("plan_id")
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
   * @returns
   */
  public countAdmin = async (filter: SearchAdminFilterDto) => {
    try {
      const condition = await this.getConditionAdmin(filter);
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
      const condition = await this.getCondition(filter);
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
  async create(createUser: any) {
    const createdOrder = new this.orderModel(createUser);
    const dataCreate = await createdOrder.save();
    return dataCreate;
  }

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async createVnpayLog(createUser: any) {
    const createdOrder = new this.vnpayModel(createUser);
    const dataCreate = await createdOrder.save();
    return dataCreate;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<Order[]> {
    return this.orderModel.find(dataToSearch).exec();
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
    const objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }

    const dataReturn: any = await this.orderModel.aggregate(this.getOrderDetailAggregate(objectId));
    return dataReturn[0];
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
      const objectId = new mongoose.Types.ObjectId(dataUpdate._id);
      if (!dataUpdate._id) {
        return null;
      }
      if (dataUpdate?.status === "success") {
        dataUpdate = { ...dataUpdate, ...{ billing_on: new Date() } };
      }
      await this.orderModel.updateOne({ _id: objectId }, { $set: dataUpdate }, { new: true });
      const dataReturn: any = await this.orderModel.aggregate(this.getOrderDetailAggregate(objectId));

      if (dataReturn) {
        if (dataUpdate?.status === "close") {
          this.emailService.send({
            eventName: EmailPattern.CLOSE_ORDER,
            email: dataReturn.user_id.user_email,
            language: dataReturn.user_id.default_language,
            replacePattern: {
              display_name: dataReturn.user_id.display_name,
              order_id: dataReturn._id.toString(),
              order_name: dataReturn.items?.map((item) => item.service_name)?.toString(),
              order_price: dataReturn.price,
              order_date: moment()
                .tz(dataReturn.user_id.timezone || "UTC")
                .format("DD-MM-YYYY HH:mm"),
            },
          });
        }
      }

      return dataReturn[0];
    } catch (e) {
      return e;
    }
  }

  getOrderDetailAggregate(objectId) {
    return [
      {
        $match: {
          _id: objectId,
        },
      },
      {
        $unwind: {
          path: "$items",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "handleservices",
          localField: "items.service_id",
          foreignField: "_id",
          as: "items.service_id_array",
        },
      },
      {
        $lookup: {
          from: "plans",
          localField: "items.plan_id",
          foreignField: "_id",
          as: "items.plan_id_array",
        },
      },
      {
        $lookup: {
          from: "media",
          localField: "media_id",
          foreignField: "_id",
          as: "media_id_array",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user_id_array",
        },
      },
      {
        $addFields: {
          "items.plan_id": {
            $arrayElemAt: ["$items.plan_id_array", 0],
          },
        },
      },
      {
        $project: {
          "items.plan_id_array": 0,
        },
      },
      {
        $addFields: {
          "items.service_id": {
            $arrayElemAt: ["$items.service_id_array", 0],
          },
        },
      },
      {
        $project: {
          "items.service_id_array": 0,
        },
      },
      {
        $addFields: {
          media_id: {
            $arrayElemAt: ["$media_id_array", 0],
          },
        },
      },
      {
        $project: {
          media_id_array: 0,
        },
      },
      {
        $addFields: {
          user_id: {
            $arrayElemAt: ["$user_id_array", 0],
          },
        },
      },
      {
        $project: {
          user_id_array: 0,
        },
      },
      {
        $group: {
          _id: "$_id",
          items: { $addToSet: "$items" },
          user_id: {
            $first: "$user_id",
          },
          media_id: {
            $first: "$media_id",
          },
          amount_of_package: {
            $first: "$amount_of_package",
          },
          price: {
            $first: "$price",
          },
          description: {
            $first: "$description",
          },
          deep_link: {
            $first: "$deep_link",
          },
          product_url: {
            $first: "$product_url",
          },
          payment_method: {
            $first: "$payment_method",
          },
          trans_id: {
            $first: "$trans_id",
          },
          status: {
            $first: "$status",
          },
          error_message: {
            $first: "$error_message",
          },
          data_payment: {
            $first: "$data_payment",
          },
          redirect_url: {
            $first: "$redirect_url",
          },
          trial_days: {
            $first: "$trial_days",
          },
          short_id: {
            $first: "$short_id",
          },
          vnpay_on: {
            $first: "$vnpay_on",
          },
          billing_on: {
            $first: "$billing_on",
          },
          trial_end_on: {
            $first: "$trial_end_on",
          },
          cancelled_on: {
            $first: "$cancelled_on",
          },
          coupon_product_id: {
            $first: "$coupon_product_id",
          },
          createdAt: {
            $first: "$createdAt",
          },
          updatedAt: {
            $first: "$updatedAt",
          },
          order_note: {
            $first: "$order_note",
          },
          address: {
            $first: "$address",
          },
        },
      },
    ];
  }
}
