import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CouponVisible } from "../interfaces/coupon.interface.i";
import { CouponUserService } from "../services/coupon-user.service";
import { CouponService } from "../services/coupon.service";

@Injectable()
export class CouponUserHelper {
  constructor(private couponUserService: CouponUserService, private couponService: CouponService) {}

  async createCouponUser(couponId: string, res: Response, req: ExpressRequestDto) {
    try {
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("User is invalid");

      const coupon = await this.couponService.findOne({
        _id: couponId,
      });
      if (!coupon) throw new Error("Coupon not found");
      if (coupon.visible === CouponVisible.PUBLIC) throw new Error("No need to save public coupon");

      const params = { coupon_id: couponId, user_id: userId };
      const dataReturn = await this.couponUserService.create(params);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}

