import { BadRequestException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { OrderStatus } from "../../../modules/order/interfaces/order.interface";
import { OrderService } from "../../../modules/order/services/order.service";
import { ShopService } from "../../../modules/shop/services/shop.service";
import {
  CreateProductReviewDto,
  ListProductReviewDto,
  UpdateProductReviewDto,
} from "../interfaces/product_review.interface";
import { ProductService } from "../services/product.service";
import { ProductReviewService } from "../services/product_review.service";

@Injectable()
export class ProductReviewHelper {
  constructor(
    private productService: ProductService,
    private productReviewService: ProductReviewService,
    private orderService: OrderService,
    private shopService: ShopService
  ) {}

  async getProductReviewList(query: ListProductReviewDto, req: ExpressRequestDto, res: Response) {
    try {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByObject = {};
      if (query.order_by) {
        orderByObject = { ...orderByObject, ...{ createdAt: query.order_by } };
      }
      const dataToFilter = { ...query };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      //Check Video View
      const dataReturn: any = await this.productReviewService.filter(dataToFilter, orderByObject, page, limit);
      const countProduct = await this.productReviewService.count(dataToFilter);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": countProduct })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async createNewReview(dataFollow: CreateProductReviewDto, req: ExpressRequestDto, res: Response) {
    try {
      // check if user is bought product
      const product = await this.productService.findOne({
        _id: dataFollow.product_id,
      });
      if (!product) throw new NotFoundException("Not found product");

      const order = await this.orderService.findOne({
        "items.service_id": product.service_id,
        status: OrderStatus.SUCCESS,
        user_id: dataFollow.user_id,
      });
      if (!order) throw new Error("You not buy this product yet");

      const isReviewed = await this.productReviewService.findOne({
        user_id: dataFollow.user_id,
        product_id: dataFollow.product_id,
      });
      if (isReviewed) throw new Error("You're already leave review for this product");

      const productReview = await this.productReviewService.create(dataFollow);

      this.processUpdateRating(dataFollow.product_id);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(productReview);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateReview(dataFollow: UpdateProductReviewDto, req: ExpressRequestDto, res: Response) {
    try {
      const userId = req?.user_id;
      if (userId) throw new Error("Invalid user");

      const _productReview = await this.productReviewService.findOne({ _id: dataFollow._id });
      if (_productReview?.user_id.toString() !== userId) throw new Error("You don't have permission to do this");

      const productReview = await this.productReviewService.update(dataFollow);

      this.processUpdateRating(productReview.product_id.toString());

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(productReview);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteReview(id: string, req: ExpressRequestDto, res: Response) {
    try {
      const user = req?.user_object;
      const productReview = await this.productReviewService.findOne({
        _id: id,
        user_id: user?._id,
      });
      if (!productReview) throw new Error("You don't have permission to do this action");

      await this.productReviewService.remove({ _id: id });

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(productReview);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async processUpdateRating(productId: string) {
    const newProductRating = await this.calculateRatingForCourse(productId);
    await this.productService.update({
      _id: productId,
      rating: newProductRating,
    });

    const product = await this.productService.findOne({ _id: productId });
    if (product) {
      const newShopRating = await this.calculateRatingForShop(product.shop_id._id.toString());
      await this.shopService.update({
        _id: product.shop_id._id.toString(),
        rating: newShopRating,
      });
    }
  }

  async calculateRatingForCourse(productId: string): Promise<number> {
    const reviews = await this.productReviewService.findAll({ product_id: productId });
    if (reviews.length === 0) return 0;

    const totalRating = reviews.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.rating;
    }, 0);
    return totalRating / reviews.length;
  }

  async calculateRatingForShop(shopId: string): Promise<number> {
    const products = await this.productService.findAllShopProductReviewOfUser(shopId);
    let totalReview = 0;
    let totalRating = 0;
    for (const product of products) {
      const reviews = product.reviews;
      if (reviews.length === 0) continue;

      const _totalRating = reviews.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.rating;
      }, 0);
      totalRating += _totalRating;
      totalReview += reviews.length;
    }

    return totalRating / totalReview;
  }
}
