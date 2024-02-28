import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CouponController } from "./controllers/coupon.controller";
import { CouponUserHelper } from "./helpers/coupon-user.helper";
import { CouponHelper } from "./helpers/coupon.helper";
import { CouponUser, CouponUserSchema } from "./schemas/coupon-user.schema";
import { Coupon, CouponSchema } from "./schemas/coupon.schema";
import { CouponUserService } from "./services/coupon-user.service";
import { CouponService } from "./services/coupon.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Coupon.name, schema: CouponSchema },
      {
        name: CouponUser.name,
        schema: CouponUserSchema,
      },
    ]),
  ],
  controllers: [CouponController],
  providers: [CouponService, CouponHelper, CouponUserService, CouponUserHelper],
  exports: [CouponService, CouponUserService],
})
export class CouponModule {}
