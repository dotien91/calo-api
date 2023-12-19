import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateNotificationDto } from "../dto/create-notifcation.dto";
import { SearchNotificationDto } from "../dto/search-notification.dto";
import { SortByNotificationDto } from "../dto/sort_by-notification.dto";
import { UpdateNotificationDto } from "../dto/update-notification.dto";
import { Notification, NotificationDocument } from "../schemas/notification.schema";

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private NotificationModel: Model<NotificationDocument>
  ) {}

  private readonly logger = new Logger("cron_job");

  // @Cron(CronExpression.EVERY_5_SECONDS)
  // handleCron() {
  //   this.logger.debug("Called every 30 seconds");
  // }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchNotificationDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.channel) {
      condition = Object.assign(condition, { payment_method: filter.channel });
    }
    if (filter.channel_id) {
      condition = Object.assign(condition, { channel_id: filter.channel_id });
    }
    if (filter.type_action) {
      condition = Object.assign(condition, { plan_id: filter.type_action });
    }
    if (filter.hasOwnProperty("read_status")) {
      condition = Object.assign(condition, { read_status: Number(filter.read_status) });
    }
    if (filter.notification_type) {
      condition = Object.assign(condition, { notification_type: filter.notification_type });
    }
    if (filter.manual_mode) {
      const currentTime = new Date();
      condition = Object.assign(condition, { manual_mode: filter.manual_mode, send_start: { $gte: currentTime } });
    }
    if (filter.from_time) {
      const dateFrom = new Date(filter.from_time);
      condition = Object.assign(condition, { updatedAt: { $gte: dateFrom } });
    }
    if (filter.hasOwnProperty("read_status")) {
      condition = Object.assign(condition, { read_status: filter.read_status });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByNotificationDto) {
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
  async filter(filter: SearchNotificationDto, sortBy: SortByNotificationDto, page: number, limit: number) {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const populateObject = {
      path: "request_id",
      populate: {
        path: "user_id",
        select:
          "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active",
      },
    };
    const dataReturn = await this.NotificationModel.find(condition, { user_id: false })
      .populate(
        "createdBy",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
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
  public count = async (filter: SearchNotificationDto) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.NotificationModel.estimatedDocumentCount();
      } else {
        return this.NotificationModel.countDocuments(condition);
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
  async create(createUser: CreateNotificationDto) {
    const createdNotification = new this.NotificationModel(createUser);
    const dataCreate = await createdNotification.save();
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
   * @param dataUpdate
   * @returns
   */
  async updateOne(dataUpdate: CreateNotificationDto) {
    try {
      const dataReturn = await this.NotificationModel.findOneAndUpdate(
        { _id: null },
        { $set: dataUpdate },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).populate(
        "createdBy",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      );
      return dataReturn;
    } catch (e) {
      return e;
    }
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<Notification[]> {
    return this.NotificationModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<Notification> {
    return await this.NotificationModel.findOne(dataToSearch).sort({ _id: -1 }).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<Notification> {
    if (!id) {
      return null;
    }
    const objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.NotificationModel.findById(objectId)
      .populate(
        "createdBy",
        "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("request_id")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.NotificationModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateNotificationDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      const dataReturn = await this.NotificationModel.findByIdAndUpdate(
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
