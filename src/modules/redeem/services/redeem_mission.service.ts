import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FilterRedeemMissionDTO } from "../dtos/redeem_mission.dto";
import { RedeemMission, RedeemMissionDocument } from "../schemas/redeem_mission.schema";

@Injectable()
export class RedeemMissionService {
  constructor(
    @InjectModel(RedeemMission.name)
    private redeemMissionModel: Model<RedeemMissionDocument>
  ) {}

  async create(createUser): Promise<RedeemMission> {
    const createdUser = new this.redeemMissionModel(createUser);
    return createdUser.save();
  }

  async remove(dataToSearch: any): Promise<any> {
    await this.redeemMissionModel.deleteMany(dataToSearch);
  }

  async findAll(pattern?: any): Promise<RedeemMission[]> {
    return this.redeemMissionModel.find(pattern).exec();
  }

  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<RedeemMission> {
    if (isWithUser) {
      return await this.redeemMissionModel.findOne(dataToSearch).exec();
    } else {
      return await this.redeemMissionModel.findOne(dataToSearch).exec();
    }
  }

  async update(dataUpdate: any) {
    try {
      let dataReturn = await this.redeemMissionModel.findOneAndUpdate(
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

  public count = async (filter: FilterRedeemMissionDTO) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.redeemMissionModel.estimatedDocumentCount();
      } else {
        return this.redeemMissionModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };

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

  getCondition(filter: FilterRedeemMissionDTO) {
    let condition: any = {};

    if (filter.title) {
      condition = Object.assign(condition, {
        title: {
          $regex: filter.title,
          $options: "i",
        },
      });
    }

    if (filter.redeem_id) {
      condition = Object.assign(condition, { redeem_id: filter.redeem_id });
    }

    return condition;
  }

  async filter(
    filter: FilterRedeemMissionDTO,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<RedeemMission[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.redeemMissionModel
      .find(condition, projection)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }
}

