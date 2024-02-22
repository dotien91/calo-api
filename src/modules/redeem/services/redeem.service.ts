import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { User } from "../../../modules/user/schemas/user.schema";
import { FilterRedeemDTO } from "../dtos/redeem.dto";
import { Redeem, RedeemDocument } from "../schemas/redeem.schema";

@Injectable()
export class RedeemService {
  constructor(
    @InjectModel(Redeem.name)
    private redeemModel: Model<RedeemDocument>
  ) {}

  async create(createUser): Promise<Redeem> {
    const createdUser = new this.redeemModel(createUser);
    return createdUser.save();
  }

  async remove(dataToSearch: any): Promise<any> {
    await this.redeemModel.deleteMany(dataToSearch);
  }

  async findAll(pattern?: any): Promise<Redeem[]> {
    return this.redeemModel.find(pattern).exec();
  }

  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<Redeem> {
    if (isWithUser) {
      return await this.redeemModel.findOne(dataToSearch).exec();
    } else {
      return await this.redeemModel.findOne(dataToSearch).exec();
    }
  }

  async update(dataUpdate: any) {
    try {
      let dataReturn = await this.redeemModel.findOneAndUpdate(
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

  public count = async (filter: FilterRedeemDTO) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.redeemModel.estimatedDocumentCount();
      } else {
        return this.redeemModel.countDocuments(condition);
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

  getCondition(filter: FilterRedeemDTO) {
    let condition: any = {};

    if (filter.title) {
      condition = Object.assign(condition, {
        title: {
          $regex: filter.title,
          $options: "i",
        },
      });
    }

    return condition;
  }

  async filter(
    filter: FilterRedeemDTO,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<Redeem[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.redeemModel
      .find(condition, projection)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  async getListMissionOfRedeems(redeemIds: mongoose.Types.ObjectId[]) {
    return await this.redeemModel.aggregate([
      {
        $match: {
          _id: {
            $in: redeemIds,
          },
        },
      },
      {
        $lookup: {
          from: "redeemmissions",
          localField: "_id",
          foreignField: "redeem_id",
          as: "missions",
        },
      },
    ]);
  }

  async getListMissionOfRedeemsByUser(user: User) {
    return await this.redeemModel.aggregate([
      {
        $match: {
          $or: [
            {
              $and: [
                { start_time: { $lte: new Date() } },
                { $or: [{ end_time: { $gte: new Date() } }, { end_time: null }] },
              ],
            },
            {
              end_time: null,
            },
          ],
          required_level: { $lte: user.level },
        },
      },
      {
        $lookup: {
          from: "redeemmissions",
          localField: "_id",
          foreignField: "redeem_id",
          as: "missions",
        },
      },
    ]);
  }
}

