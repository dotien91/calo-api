import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateCouponUserDTO } from "../dtos/coupon-user.dto";
import { CreateCouponDTO, ListCouponDto, UpdateCouponDTO } from "../dtos/coupon.dto";
import { CouponUserHelper } from "../helpers/coupon-user.helper";
import { CouponHelper } from "../helpers/coupon.helper";

@Controller("coupon")
export class CouponController {
  constructor(private readonly couponHelper: CouponHelper, private readonly couponUserHelper: CouponUserHelper) {}

  // coupon apis
  @Get("list")
  async listCoupon(@Query() query: ListCouponDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.couponHelper.list(query, res, req);
  }

  @Post("create")
  async createNewCoupon(
    @Body() createCouponData: CreateCouponDTO,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.couponHelper.createCoupon(createCouponData, res, req);
  }

  @Patch("update")
  async updateCoupon(@Body() updateCouponData: UpdateCouponDTO, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.couponHelper.updateCoupon(updateCouponData, res, req);
  }

  @Post("user")
  async getSubscribe(@Body() body: ListCouponDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.couponHelper.getCouponByUserId(body, res, req);
  }

  @Delete("delete/:id")
  async removeCoupon(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.couponHelper.removeCoupon(id, res, req);
  }

  @Get("detail/:id")
  async handleGetDetailCoupon(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.couponHelper.handleGetDetailCoupon(id, res, req);
  }

  // coupon user apis
  @Post("save/:id")
  async saveCouponToUser(@Body() body: CreateCouponUserDTO, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.couponUserHelper.createCouponUser(body, res, req);
  }
}
