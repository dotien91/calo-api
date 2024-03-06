import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FilterTestDTO } from "../dtos/test.dto";
import { Test, TestDocument } from "../schemas/test.schema";

@Injectable()
export class TestService {
  constructor(
    @InjectModel(Test.name)
    private testModel: Model<TestDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser): Promise<Test> {
    const createdUser = new this.testModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async remove(dataToSearch: any): Promise<any> {
    await this.testModel.deleteMany(dataToSearch);
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(pattern?: any): Promise<Test[]> {
    return this.testModel.find(pattern).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<Test> {
    if (isWithUser) {
      return await this.testModel
        .findOne(dataToSearch)
        .populate({
          path: "created_user_id",
          select:
            "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail user_avatar_square last_active user_active official_status",
        })
        .exec();
    } else {
      return await this.testModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: any) {
    try {
      const dataReturn = await this.testModel.findOneAndUpdate(
        { _id: dataUpdate._id },
        { $set: dataUpdate },
        { upsert: true, new: true, setDefaultsOnInsert: true }
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

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  public count = async (filter: FilterTestDTO) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.testModel.estimatedDocumentCount();
      } else {
        return this.testModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: any) {
    let sort = { priority: -1 };
    if (sortBy.createdAt) {
      sort = Object.assign(sort, { _id: sortBy.createdAt === "DESC" ? -1 : 1 });
    }
    if (sortBy.updatedAt) {
      sort = Object.assign(sort, { updatedAt: sortBy.updatedAt === "DESC" ? -1 : 1 });
    }
    return sort;
  }

  getCondition(filter: FilterTestDTO) {
    let condition: any = {};

    if (filter.title) {
      condition = Object.assign(condition, {
        title: {
          $regex: filter.title,
          $options: "i",
        },
      });
    }

    if (filter.created_user_id) {
      condition = Object.assign(condition, { created_user_id: filter.created_user_id });
    }

    return condition;
  }

  async filter(filter: FilterTestDTO, sortBy: any, page: number, limit: number, projection: any = {}): Promise<Test[]> {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.testModel
      .find(condition, projection)
      .populate({
        path: "created_user_id",
        select:
          "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail user_avatar_square last_active user_active official_status",
      })
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }
}
