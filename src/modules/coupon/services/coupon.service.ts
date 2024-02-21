import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { FilterCouponDTO } from "../dtos/coupon.dto";
import { CouponPromotionType, CouponVisible } from "../interfaces/coupon.interface.i";
import { Coupon, CouponDocument } from "../schemas/coupon.schema";

@Injectable()
export class CouponService {
  constructor(
    @InjectModel(Coupon.name)
    private couponModel: Model<CouponDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser): Promise<Coupon> {
    const createdUser = new this.couponModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async remove(dataToSearch: any): Promise<any> {
    await this.couponModel.deleteMany(dataToSearch);
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(pattern?: any): Promise<Coupon[]> {
    return this.couponModel.find(pattern).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<Coupon> {
    if (isWithUser) {
      return await this.couponModel.findOne(dataToSearch).exec();
    } else {
      return await this.couponModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: any) {
    try {
      let dataReturn = await this.couponModel.findOneAndUpdate(
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
  public count = async (filter: FilterCouponDTO) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.couponModel.estimatedDocumentCount();
      } else {
        return this.couponModel.countDocuments(condition);
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

  getCondition(filter: FilterCouponDTO) {
    let condition: any = {};

    // should always get active coupon
    condition = Object.assign(condition, { expired: { $gte: new Date() } });

    // should get coupon that have total left > 0
    condition = Object.assign(condition, { total: { $gt: 0 } });

    if (filter.title) {
      condition = Object.assign(condition, {
        title: {
          $regex: filter.title,
          $options: "i",
        },
      });
    }

    if (filter.payment_method) {
      condition = Object.assign(condition, { payment_method: filter.payment_method });
    }

    if (filter.type) {
      condition = Object.assign(condition, { type: filter.type });
    }

    if (filter.visible) {
      condition = Object.assign(condition, { visible: filter.visible });
    }

    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }

    return condition;
  }

  async filter(
    filter: FilterCouponDTO,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<Coupon[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.couponModel
      .find(condition, projection)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  async getCouponByUserId(filter: FilterCouponDTO, sortBy: any, page: number, limit: number) {
    const data = await this.couponModel.aggregate([
      {
        $match: {
          expired: { $gte: new Date() },
          total: { $gt: 0 },
        },
      },
      {
        $lookup: {
          from: "couponusers",
          localField: "_id",
          foreignField: "coupon_id",
          as: "coupon_user",
          pipeline: [{ $match: { user_id: new mongoose.Types.ObjectId(filter?.user_id) } }],
        },
      },
    ]);

    return this.getValidCouponByUser(data);
  }

  getValidCouponByUser(data: any): Array<any> {
    data = data.filter((datum) => {
      if (datum.visible === CouponVisible.PUBLIC) {
        delete datum.coupon_user;
        return datum;
      }
      if (datum.visible === CouponVisible.PRIVATE) {
        if (datum.coupon_user.length) {
          delete datum.coupon_user;
          return datum;
        }
      }

      return false;
    });

    return data;
  }

  getPrice(price: number, coupon: Coupon) {
    let discount = 0;
    switch (coupon.promotion_type) {
      case CouponPromotionType.PERCENTAGE: {
        discount = (price * coupon.promotion) / 100;
        if (coupon.promotion_max !== -1 && discount > coupon.promotion_max) discount = coupon.promotion_max;
        break;
      }
      case CouponPromotionType.VALUE: {
        discount = coupon.promotion;
        if (coupon.promotion_max !== -1 && discount > coupon.promotion_max) discount = coupon.promotion_max;
        break;
      }
    }

    return price - discount;
  }
}

