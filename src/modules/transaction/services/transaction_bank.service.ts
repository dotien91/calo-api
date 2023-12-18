import { Injectable } from "@nestjs/common";
import { CreateTransactionBankDto } from "../dto/create-transaction_bank.dto";
import { TransactionBankDocument, TransactionBank } from "../schemas/transaction_bank.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UpdateTransactionBankDto } from "../dto/update-transactions_bank.dto";
import { SearchTransactionBankDto } from "../dto/search-transaction_bank.dto";
import { SortByTransactionBankDto } from "../dto/sort_by-transactions_bank.dto";
import { SearchAdminFilterDto } from "../../../modules/user/dto/search-admin_filter.dto";

@Injectable()
export class TransactionBankService {
  constructor(
    @InjectModel(TransactionBank.name)
    private transactionBankModel: Model<TransactionBankDocument>
  ) { }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchTransactionBankDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }

    if (filter.payment_method) {
      condition = Object.assign(condition, { payment_method: filter.payment_method });
    }
    if (filter.user_ids) {
      condition = Object.assign(condition, { user_id: { $in: filter.user_ids } });
    }

    if (filter.channel_id) {
      condition = Object.assign(condition, { channel_id: filter.channel_id });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByTransactionBankDto) {
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
  async filter(filter: SearchTransactionBankDto, sortBy: SortByTransactionBankDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.transactionBankModel
      .find(condition)
      .populate(
        "user_id",
        "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
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
  async filterAdmin(filter: SearchAdminFilterDto, sortBy: SortByTransactionBankDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
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
          "_id bio description user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      };

      let dataReturn = await this.transactionBankModel
        .find(condition, projection)
        .populate(dataPopulate)
        .sort(sortObject)
        .skip(limit * (page - 1))
        .limit(limit)
        .exec()
        .then((orders) => orders.filter((order) => order.user_id.user_option_id != null));
      return dataReturn;
    } else {
      let dataReturn = await this.transactionBankModel
        .find(condition, projection)
        .populate(
          "user_id",
          "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
        )
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
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.transactionBankModel.estimatedDocumentCount();
      } else {
        return this.transactionBankModel.countDocuments(condition);
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
  public count = async (filter: SearchTransactionBankDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.transactionBankModel.estimatedDocumentCount();
      } else {
        return this.transactionBankModel.countDocuments(condition);
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
  async create(createUser: CreateTransactionBankDto) {
    const createdTransactionBank = new this.transactionBankModel(createUser);
    let dataCreate = await createdTransactionBank.save();
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
  async findAll(): Promise<TransactionBank[]> {
    return this.transactionBankModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<TransactionBank> {
    return await this.transactionBankModel.findOne(dataToSearch).sort({ _id: -1 }).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<TransactionBank> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.transactionBankModel
      .findById(objectId)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.transactionBankModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateTransactionBankDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.transactionBankModel.findByIdAndUpdate(
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
