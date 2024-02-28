import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  CreateProductReviewDto,
  FilterReviewProductDto,
  UpdateProductReviewDto,
} from "../interfaces/product_review.interface";
import { ProductReview, ProductReviewDocument } from "../schemas/product_review.schema";

@Injectable()
export class ProductReviewService {
  constructor(
    @InjectModel(ProductReview.name)
    private productReviewModel: Model<ProductReviewDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateProductReviewDto): Promise<ProductReview> {
    const createdUser = new this.productReviewModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async remove(dataToSearch: any): Promise<ProductReview> {
    return await this.productReviewModel.findOneAndRemove(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(pattern?: any): Promise<ProductReview[]> {
    return this.productReviewModel.find(pattern).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<ProductReview> {
    if (isWithUser) {
      return await this.productReviewModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.productReviewModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateProductReviewDto) {
    try {
      const dataReturn = await this.productReviewModel.findOneAndUpdate(
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
  public count = async (filter: FilterReviewProductDto) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.productReviewModel.estimatedDocumentCount();
      } else {
        return this.productReviewModel.countDocuments(condition);
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

  getCondition(filter: FilterReviewProductDto) {
    let condition: any = {};

    if (filter.product_id) {
      condition = Object.assign(condition, { product_id: filter.product_id });
    }

    if (filter.rating) {
      condition = Object.assign(condition, { rating: filter.rating });
    }

    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }

    return condition;
  }

  async filter(
    filter: FilterReviewProductDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<ProductReview[]> {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.productReviewModel
      .find(condition, projection)
      .populate({
        path: "user_id",
        select:
          "_id bio description user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active official_status",
      })
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }
}
