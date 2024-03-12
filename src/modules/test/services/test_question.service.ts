import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FilterTestQuestionDTO } from "../dtos/test_question.dto";
import { TestQuestion, TestQuestionDocument } from "../schemas/test_question.schema";

@Injectable()
export class TestQuestionService {
  constructor(
    @InjectModel(TestQuestion.name)
    private testQuestionModel: Model<TestQuestionDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser): Promise<TestQuestion> {
    const createdUser = new this.testQuestionModel(createUser);
    return createdUser.save();
  }

  async createMultipleData(createUser: any): Promise<any> {
    const data = await this.testQuestionModel.create(createUser);
    return data;
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async remove(dataToSearch: any): Promise<any> {
    await this.testQuestionModel.deleteMany(dataToSearch);
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(pattern?: any): Promise<TestQuestion[]> {
    return this.testQuestionModel.find(pattern).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<TestQuestion> {
    if (isWithUser) {
      return await this.testQuestionModel.findOne(dataToSearch).exec();
    } else {
      return await this.testQuestionModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: any) {
    try {
      const dataReturn = await this.testQuestionModel.findOneAndUpdate(
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
  public count = async (filter: FilterTestQuestionDTO) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.testQuestionModel.estimatedDocumentCount();
      } else {
        return this.testQuestionModel.countDocuments(condition);
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

  getCondition(filter: FilterTestQuestionDTO) {
    let condition: any = {};

    if (filter.test_id) {
      condition = Object.assign(condition, { test_id: filter.test_id });
    }

    if (filter.parent_id) {
      condition = Object.assign(condition, { parent_id: filter.parent_id });
    }

    if (filter.part) {
      condition = Object.assign(condition, { part: filter.part });
    }

    if (filter.type) {
      condition = Object.assign(condition, { type: filter.type });
    }

    return condition;
  }

  async filter(
    filter: FilterTestQuestionDTO,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<TestQuestion[]> {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.testQuestionModel
      .find(condition, projection)
      .populate("media_id")
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }
}
