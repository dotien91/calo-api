import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import parsePhoneNumber from "libphonenumber-js";
import { Model } from "mongoose";
import { CreateUserDto } from "../dto/create-user.dto";
import { SearchUserDto } from "../dto/search-user.dto";
import { SortByUserDto } from "../dto/sort_by-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { User, UserDocument } from "../schemas/user.schema";
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private appUserModel: Model<UserDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateUserDto): Promise<User> {
    const createdUser = new this.appUserModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<User[]> {
    return this.appUserModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: SearchUserDto): Promise<User> {
    return await this.appUserModel.findOne(dataToSearch).exec();
  }

  async findOneLogin(dataToSearch: SearchUserDto): Promise<User> {
    const populateObject = {
      path: "user_option_id",
      options: { strictPopulate: false },
      populate: [
        {
          path: "public_album",
        },
        {
          path: "private_album",
        },
      ],
    };
    const dataReturn = await this.appUserModel.findOne(dataToSearch).populate(populateObject).exec();
    if (dataReturn) {
      const dataReturnObject = dataReturn.toObject();
      const userOptionObject = dataReturnObject.user_option_id;
      delete dataReturnObject?.user_option_id;
      delete userOptionObject?.user_id;
      return { ...userOptionObject, ...dataReturnObject };
    } else {
      return null;
    }
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string, projection: any) {
    if (!id) {
      return null;
    }
    projection = { ...projection, ...{ __v: false } };
    const dataReturn = await this.appUserModel.findById(id, projection).populate("user_option_id").exec();
    if (dataReturn) {
      const dataReturnObject = dataReturn.toObject();
      const userOptionObject = dataReturnObject.user_option_id;
      delete dataReturnObject.user_option_id;
      delete userOptionObject.user_id;
      return { ...userOptionObject, ...dataReturnObject };
    } else {
      return null;
    }
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchUserDto) {
    let condition: any = {
      user_status: 1,
    };
    if (filter.user_login) {
      condition = Object.assign(condition, { user_login: filter.user_login });
    }

    if (filter.user_email) {
      condition = Object.assign(condition, { user_email: filter.user_email });
    }

    if (filter.user_role) {
      condition = Object.assign(condition, { user_role: filter.user_role });
    }

    //@ts-ignore
    if (filter.user_birthday_year) {
      //@ts-ignore
      condition = Object.assign(condition, { "user_option.user_birthday_year": filter.user_birthday_year });
    }

    if (filter.search) {
      condition = Object.assign(condition, { $text: { $search: filter.search } });
    }

    if (filter.ids) {
      condition = Object.assign(condition, { _id: { $in: filter.ids } });
    }

    if (filter.have_sound) {
      condition = Object.assign(condition, { $and: [{ public_sound: { $ne: null } }, { public_sound: { $ne: "" } }] });
    }

    if (filter.notification_request) {
      condition = Object.assign(condition, { notification_request: filter.notification_request });
    }

    if (filter.user_phone) {
      const dataPhoneToFilter = filter.user_phone;
      const dataPhoneArray = parsePhoneNumber(dataPhoneToFilter.trim());
      const nationalNumber = dataPhoneArray.nationalNumber;
      condition = Object.assign(condition, { user_phone: { $regex: nationalNumber, $options: "i" } });
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
  getSort(sortBy: SortByUserDto) {
    let sort = { priority: -1 };
    if (sortBy.createdAt) {
      sort = Object.assign(sort, { _id: sortBy.createdAt === "DESC" ? -1 : 1 });
    }
    if (sortBy.updatedAt) {
      sort = Object.assign(sort, { _id: sortBy.updatedAt === "DESC" ? -1 : 1 });
    }
    return sort;
  }

  async filterAdmin(filter: any, sortBy: SortByUserDto, page: number, limit: number) {
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

    const dataReturn = await this.appUserModel
      .find(condition, projection)
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
  public count = async (filter: any) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.appUserModel.estimatedDocumentCount();
      } else {
        return this.appUserModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };

  /**
   * @author Tony Vu
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filter(filter: SearchUserDto, sortBy: SortByUserDto, page: number, limit: number) {
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

    const dataReturn = await this.appUserModel
      .find(condition, projection)
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
  async filterAdminWithSearch(filter: SearchUserDto, sortBy: SortByUserDto, page: number, limit: number) {
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

    let dataPopulate = {
      path: "user_option_id",
    };
    if (filter?.locking_for) {
      if (filter?.locking_for?.indexOf(",")) {
        const dataFilterLockingFor = filter?.locking_for?.split(",");
        dataPopulate = { ...dataPopulate, ...{ match: { locking_for: { $in: dataFilterLockingFor } } } };
      } else {
        dataPopulate = { ...dataPopulate, ...{ match: { locking_for: filter?.locking_for } } };
      }
    }
    if (filter?.user_interest) {
      if (filter?.user_interest?.indexOf(",")) {
        const dataUserInterest = filter?.user_interest?.split(",");
        dataPopulate = { ...dataPopulate, ...{ match: { user_interest: { $in: dataUserInterest } } } };
      } else {
        dataPopulate = { ...dataPopulate, ...{ match: { user_interest: filter?.user_interest } } };
      }
    }

    const dataReturn = await this.appUserModel
      .find(condition, projection)
      .sort(sortObject)
      .populate(dataPopulate)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec()
      .then((orders) => orders.filter((order) => order.user_option_id != null));

    const dataReturnAfter = [];
    for (const userItem of dataReturn) {
      if (userItem?.toObject()?.user_option_id?.toString()) {
        const dataUserId = userItem?.toObject().user_option_id;
        const dataToProcess = userItem?.toObject();
        delete dataToProcess.user_option_id;
        //delete dataToProcess.loc;
        dataReturnAfter.push({ ...dataUserId, ...dataToProcess });
      }
    }
    return dataReturnAfter;
  }

  /**
   *
   * @param dataUpdate
   * @returns
   */
  async updateArray(dataUpdate: UpdateUserDto, isPull: boolean = false) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = null;
      if (dataUpdate._id) {
        const dataId = dataUpdate?._id;
        delete dataUpdate?._id;
        if (isPull) {
          dataReturn = await this.appUserModel.findOneAndUpdate(
            { _id: dataId },
            {
              //@ts-ignore
              $pull: dataUpdate,
            },
            { new: true }
          );
        } else {
          dataReturn = await this.appUserModel.findOneAndUpdate(
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
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateUserDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      const dataReturn = await this.appUserModel.findByIdAndUpdate(
        dataUpdate._id,
        { $set: dataUpdate },
        { new: false }
      );
      if (dataReturn._id) {
        // if (dataUpdate.last_active) {
        //   let dataToUpdate = {
        //     user_id: dataReturn._id.toString(),
        //     last_active: dataUpdate.last_active
        //   }
        //   await this.updateUserOption(dataToUpdate)
        // }
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
      return this.appUserModel.findByIdAndUpdate(dataFilter._id, { $inc: dataUpdate });
    } catch (e) {
      return null;
    }
  }

  /**
   * @author SonLH
   * @returns
   */
  async findUserById(id: any, resultData: any) {
    try {
      return await this.appUserModel.findById(id, resultData).exec();
    } catch (e) {
      return null;
    }
  }
}
