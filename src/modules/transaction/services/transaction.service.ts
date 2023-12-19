import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { SearchAdminFilterDto } from "../../../modules/user/dto/search-admin_filter.dto";
import { CreateTransactionDto } from "../dto/create-transaction.dto";
import { SearchTransactionDto } from "../dto/search-transaction.dto";
import { SortByTransactionDto } from "../dto/sort_by-transactions.dto";
import { UpdateTransactionDto } from "../dto/update-transactions.dto";
import { Transaction, TransactionDocument } from "../schemas/transaction.schema";

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionsModel: Model<TransactionDocument>
  ) { }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchTransactionDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: new Types.ObjectId(filter.user_id) });
    }
    if (filter.user_ids) {
      condition = Object.assign(condition, { from_user: { $in: filter.user_ids } });
    }
    if (filter.status) {
      condition = Object.assign(condition, { status: filter.status });
    }
    if (filter.method) {
      condition = Object.assign(condition, { method: filter.method });
    }
    if (filter.channel_id) {
      condition = Object.assign(condition, { channel_id: filter.channel_id });
    }
    if (filter?.transaction_type) {
      condition = Object.assign(condition, { transaction_type: filter.transaction_type });
    }
    if (filter.ref_id) {
      if (filter?.ref_id?.indexOf(",")) {
        const dataRefArray = filter.ref_id?.split(",");
        condition = Object.assign(condition, { ref_id: { $in: dataRefArray } });
      } else {
        condition = Object.assign(condition, { ref_id: filter.ref_id });
      }
    }
    if (filter.ref_type) {
      condition = Object.assign(condition, { ref_type: filter.ref_type });
    }
    if (filter.type_system) {
      condition = Object.assign(condition, { type_system: filter.type_system });
    }
    if (filter.status_array) {
      condition = Object.assign(condition, { status: { $in: filter.status_array } });
    }
    if (filter.from && filter.to) {
      const dateFrom = new Date(filter.from);
      const dateTo = new Date(filter.to);
      condition = Object.assign(condition, { successfully_on: { $gte: dateFrom, $lte: dateTo } });
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
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.status) {
      condition = Object.assign(condition, { status: filter.status });
    }
    if (filter.method) {
      condition = Object.assign(condition, { method: filter.method });
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
  getSort(sortBy: SortByTransactionDto) {
    let sort = {};
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
  async filter(filter: SearchTransactionDto, sortBy: SortByTransactionDto, page: number, limit: number) {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.transactionsModel
      .find(condition)
      .populate(
        "user_id",
        "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate(
        "from_user",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("transaction_bank")
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  async getUserIncome(filter: SearchTransactionDto, sortBy: SortByTransactionDto, page: number, limit: number) {
    const condition = await this.getCondition(filter);
    console.log(condition, "condition");
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.transactionsModel
      .aggregate()
      .match(condition)
      .group({
        _id: { user_id: "$user_id" },
        sum: { $sum: "$transaction_value" },
        count: { $sum: 1 },
      })
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
  async filterAdmin(filter: SearchAdminFilterDto, sortBy: SortByTransactionDto, page: number, limit: number) {
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
        "_id bio description user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
    };
    const dataReturn = await this.transactionsModel
      .find(condition, projection)
      .populate(dataPopulate)
      .populate(
        "from_user",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("transaction_bank")
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
        return this.transactionsModel.estimatedDocumentCount();
      } else {
        return this.transactionsModel.countDocuments(condition);
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
  public count = async (filter: SearchTransactionDto) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.transactionsModel.estimatedDocumentCount();
      } else {
        return this.transactionsModel.countDocuments(condition);
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
  async create(createUser: CreateTransactionDto) {
    const createdTransaction = new this.transactionsModel(createUser);
    const dataCreate = await createdTransaction.save();
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
  async findAll(dataToSearch?: any): Promise<Transaction[]> {
    return this.transactionsModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<Transaction> {
    return await this.transactionsModel.findOne(dataToSearch).sort({ _id: -1 }).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<Transaction> {
    if (!id) {
      return null;
    }
    const objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.transactionsModel
      .findById(objectId)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate(
        "from_user",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("transaction_bank")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.transactionsModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateTransactionDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      const dataReturn = await this.transactionsModel.findByIdAndUpdate(
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
