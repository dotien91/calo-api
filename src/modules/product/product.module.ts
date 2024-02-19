import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CouponModule } from "../coupon/coupon.module";
import { OrderModule } from "../order/order.module";
import { PlanModule } from "../plan/plan.module";
import { ShopModule } from "../shop/shop.module";
import { ProductController } from "./controllers/product.controller";
import { ProductHelper } from "./helper/product.helper";
import { ProductReviewHelper } from "./helper/product_review.helper";
import { Product, ProductSchema } from "./schemas/product.schema";
import { ProductReview, ProductReviewSchema } from "./schemas/product_review.schema";
import { ProductService } from "./services/product.service";
import { ProductReviewService } from "./services/product_review.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductReview.name, schema: ProductReviewSchema },
    ]),
    PlanModule,
    CouponModule,
    ShopModule,
    OrderModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductHelper, ProductReviewService, ProductReviewHelper],
  exports: [ProductService, ProductHelper, ProductReviewService, ProductReviewHelper],
})
export class ProductModule {}
