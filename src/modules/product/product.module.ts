import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CouponModule } from "../coupon/coupon.module";
import { PlanModule } from "../plan/plan.module";
import { ShopModule } from "../shop/shop.module";
import { ProductController } from "./controllers/product.controller";
import { ProductHelper } from "./helper/product.helper";
import { Product, ProductSchema } from "./schemas/product.schema";
import { ProductService } from "./services/product.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    PlanModule,
    CouponModule,
    ShopModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductHelper],
  exports: [ProductService],
})
export class ProductModule {}
