import { BaseInterfaceRepository } from "./base.interface.repository";
import { Model } from "mongoose";

export abstract class BaseAbstractRepository<T> implements BaseInterfaceRepository<T> {
  private entity: Model<any>;

  protected constructor(entity) {
    this.entity = entity;
  }

  create(data: any): Promise<T> {
    return this.entity.create(data);
  }

  async findAll(): Promise<T[]> {
    return this.entity.find().exec();
  }

  findOneByCondition(filterCondition: any): Promise<T> {
    return this.entity.findOne(filterCondition).exec();
  }

  findOneById(id: string, projection?: any): Promise<T> {
    return this.entity.findById(id, projection).exec();
  }

  remove(id: string): Promise<T> {
    return this.entity.findByIdAndRemove(id).exec();
  }

  paginate(page: number, limit: number, filterCondition?: any, projections?: any, sort?: any): Promise<T[]> {
    return this.entity
      .find(filterCondition, projections)
      .sort(sort ? sort : { _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  count(filterCondition?: any): Promise<number> {
    if (filterCondition) {
      return this.entity.countDocuments(filterCondition).exec();
    } else {
      return this.entity.estimatedDocumentCount().exec();
    }
  }

  findOneByConditionAndUpdate(filterCondition: any, data: any): Promise<T> {
    return this.entity.findOneAndUpdate(filterCondition, data).exec();
  }
}
