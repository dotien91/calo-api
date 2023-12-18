import { Injectable } from "@nestjs/common";
import { LawyerType, LawyerTypeDocument } from "../schemas/lawyer_type.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateLawyerTypeDto } from "../dto/create.lawyer_type.dto";
import { SearchLawyerTypeDto } from "../dto/search.lawyer_type.dto";
import { SortByLawyerDto } from "../dto/sort_by-lawyer.dto";
import { UpdateLawyerTypeDto } from "../dto/update.lawyer_type.dto";

@Injectable()
export class LawyerTypeService {
  constructor(
    @InjectModel(LawyerType.name)
    private lawyerTypeModel: Model<LawyerTypeDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateLawyerTypeDto): Promise<LawyerType> {
    const createdUser = new this.lawyerTypeModel(createUser);
    return await createdUser.save();
  }



  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
   async getCondition(filter: SearchLawyerTypeDto) {
    let condition: any = {};
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
  async filter(filter: SearchLawyerTypeDto, sortBy: SortByLawyerDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.lawyerTypeModel
      .find(condition)
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
   public count = async (filter: SearchLawyerTypeDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.lawyerTypeModel.estimatedDocumentCount();
      } else {
        return this.lawyerTypeModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<LawyerType[]> {
    return this.lawyerTypeModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<LawyerType> {
    return await this.lawyerTypeModel.findOne(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<LawyerType> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.lawyerTypeModel.findById(objectId).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.lawyerTypeModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateLawyerTypeDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.lawyerTypeModel.findByIdAndUpdate(
        dataUpdate._id,
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
}
