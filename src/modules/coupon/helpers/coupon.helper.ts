import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import mongoose from "mongoose";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateCouponDTO, ListCouponDto, UpdateCouponDTO } from "../dtos/coupon.dto";
import { CouponUserService } from "../services/coupon-user.service";
import { CouponService } from "../services/coupon.service";

@Injectable()
export class CouponHelper {
  constructor(private couponService: CouponService, private couponUserService: CouponUserService) {}

  async list(query: ListCouponDto, res: Response, req: ExpressRequestDto) {
    try {
      let dataToFilter = {};
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }
      const dataToFilterBefore = query;
      delete dataToFilterBefore.page;
      delete dataToFilterBefore.limit;
      delete dataToFilterBefore.order_by;
      dataToFilter = { ...dataToFilterBefore, ...dataToFilter };

      const dataReturn = await this.couponService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.couponService.count(dataToFilter);

      return res
        .set({
          "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count",
          "X-Total-Count": Number(dataCount),
        })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async createCoupon(createCouponData: CreateCouponDTO, res: Response, req: ExpressRequestDto) {
    try {
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("Invalid user");

      const dataReturn = await this.couponService.create({
        ...createCouponData,
        user_id: userId,
      });

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async updateCoupon(updateCouponData: UpdateCouponDTO, res: Response, req: ExpressRequestDto) {
    try {
      const dataReturn = await this.couponService.update(updateCouponData);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getCouponByUserId(body: ListCouponDto, res: Response, req: ExpressRequestDto) {
    try {
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("User is invalid");
      //Check Permission
      let dataToFilter = {
        user_id: userId,
      };
      if (Number(body.limit) > 1000) {
        body.limit = 1000;
      }

      const limit = body.limit ? body.limit : 1000;
      const page = body.page ? body.page : 1;
      let orderByOBject = {};
      if (body.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: body.order_by } };
      }
      const dataToFilterBefore = body;
      delete dataToFilterBefore.page;
      delete dataToFilterBefore.limit;
      delete dataToFilterBefore.order_by;
      dataToFilter = { ...dataToFilterBefore, ...dataToFilter };

      const dataReturn = await this.couponService.getCouponByUserId(dataToFilter, orderByOBject, page, limit);
      const finalData = dataReturn.slice((page - 1) * limit, (page - 1) * limit + limit);

      return res
        .set({
          "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count",
          "X-Total-Count": dataReturn.length,
        })
        .status(HttpStatus.OK)
        .json(finalData);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async removeCoupon(id: string, res: Response, req: ExpressRequestDto) {
    try {
      //Check Permission
      await Promise.all([
        this.couponService.remove({ _id: new mongoose.Types.ObjectId(id) }),
        this.couponUserService.remove({ coupon_id: new mongoose.Types.ObjectId(id) }),
      ]);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async handleGetDetailCoupon(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const dataFilter = {
        _id: id,
        total: {
          $gt: 0,
        },
        expired: { $gte: new Date() },
      };
      //Check Permission
      const dataReturn = await this.couponService.findOne(dataFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
