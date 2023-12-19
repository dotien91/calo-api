import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateLawyerRawDto } from "../dto/create.lawyer_raw.dto";
import { SearchLawyerDto } from "../dto/search-lawyer.dto";
import { SortByLawyerDto } from "../dto/sort_by-lawyer.dto";
import { UpdateLawyerRawDto } from "../dto/update.lawyer_raw.dto";
import { LawyerRaw, LawyerRawDocument } from "../schemas/lawyer_raw.schema";

@Injectable()
export class LawyerRawService {
  constructor(
    @InjectModel(LawyerRaw.name)
    private lawyerRawModel: Model<LawyerRawDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateLawyerRawDto): Promise<LawyerRaw> {
    const createdUser = new this.lawyerRawModel(createUser);
    return await createdUser.save();
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<LawyerRaw[]> {
    return this.lawyerRawModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<LawyerRaw> {
    return await this.lawyerRawModel.findOne(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<LawyerRaw> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.lawyerRawModel.findById(objectId).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.lawyerRawModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateLawyerRawDto) {
    try {
      let dataReturn = await this.lawyerRawModel.findOneAndUpdate(
        {
          _id: dataUpdate?._id,
        },
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
  async getCondition(filter: SearchLawyerDto) {
    let condition: any = {};
    if (filter.url) {
      condition = Object.assign(condition, { url: filter.url });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByLawyerDto) {
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
  async filter(filter: SearchLawyerDto, sortBy: SortByLawyerDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.lawyerRawModel
      .find(condition)
      // .sort(sortObject)
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
  public count = async (filter: SearchLawyerDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.lawyerRawModel.estimatedDocumentCount();
      } else {
        return this.lawyerRawModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };
}
