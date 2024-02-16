import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { CreateProductDTO, SearchProductParams, UpdateProductDTO } from "../dto/product.dto";
import { Product, ProductDocument } from "../schemas/product.schema";

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>
  ) {}

  async getCondition(filter: SearchProductParams) {
    let condition: any = {};

    if (filter.name) {
      condition = Object.assign(condition, { name: { $regex: filter.name, $options: "i" } });
    }

    if (filter.shop_id) {
      condition = Object.assign(condition, { shop_id: new mongoose.Types.ObjectId(filter.shop_id) });
    }

    return condition;
  }

  async filter(filter: SearchProductParams, sortObject: any, page: number, limit: number): Promise<Product[]> {
    let condition = await this.getCondition(filter);

    let dataReturn = await this.productModel
      .find(condition)
      .populate("shop_id")
      .populate("media_id")
      .populate("coupon_id")
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();

    return dataReturn;
  }

  async create(data: CreateProductDTO) {
    const createdData = new this.productModel(data);
    let dataCreate = await createdData.save();
    return dataCreate;
  }

  async update(dataUpdate: UpdateProductDTO) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.productModel
        .findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { new: true })
        .populate("shop_id")
        .populate("media_id")
        .populate("coupon_id");
      return dataReturn;
    } catch (e) {
      return e;
    }
  }

  public count = async (filter: SearchProductParams) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.productModel.estimatedDocumentCount();
      } else {
        return this.productModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };

  async findAll(pattern?: any): Promise<Product[]> {
    return this.productModel.find(pattern).exec();
  }

  async findOne(dataToSearch: any): Promise<Product> {
    return await this.productModel
      .findOne(dataToSearch)
      .populate("shop_id")
      .populate("media_id")
      .populate("coupon_id")
      .exec();
  }

  async remove(id: string) {
    return await this.productModel
      .findByIdAndDelete(id)
      .populate("shop_id")
      .populate("media_id")
      .populate("coupon_id")
      .exec();
  }
}
