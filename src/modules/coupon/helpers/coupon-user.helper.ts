import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateCouponUserDTO } from "../dtos/coupon-user.dto";
import { CouponVisible } from "../interfaces/coupon.interface.i";
import { CouponUserService } from "../services/coupon-user.service";
import { CouponService } from "../services/coupon.service";

@Injectable()
export class CouponUserHelper {
  constructor(private couponUserService: CouponUserService, private couponService: CouponService) {}

  async createCouponUser(body: CreateCouponUserDTO, res: Response, req: ExpressRequestDto) {
    try {
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("User is invalid");

      let condition = {};
      if (body.coupon_id) {
        condition = Object.assign(condition, { _id: body.coupon_id });
      }
      if (body.code) {
        condition = Object.assign(condition, { code: body.code });
      }

      const coupon = await this.couponService.findOne(condition);
      if (!coupon) throw new Error("Coupon not found");
      if (coupon.visible === CouponVisible.PUBLIC) throw new Error("No need to save public coupon");
      if (!this.couponService.isUsedAble(coupon)) throw new Error("Coupon is expired or not available yet");

      const params = { coupon_id: coupon._id.toString(), user_id: userId };
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
