import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateShopDTO, ListShopDto, UpdateShopDTO } from "../dtos/shop.dto";
import { ShopHelper } from "../helpers/shop.helper";

@Controller("shop")
export class ShopController {
  constructor(private readonly shopHelper: ShopHelper) {}

  // shop apis
  @Get("/list")
  async listCoupon(@Query() query: ListShopDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.shopHelper.list(query, res, req);
  }

  @Post("/create")
  async createNewCoupon(@Body() createCouponData: CreateShopDTO, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.shopHelper.createShop(createCouponData, res, req);
  }

  @Patch("/update")
  async updateCoupon(@Body() updateCouponData: UpdateShopDTO, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.shopHelper.updateShop(updateCouponData, res, req);
  }

  @Delete(":id")
  async removeCoupon(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.shopHelper.removeShop(id, res, req);
  }

  @Get("detail/:id")
  async handleGetDetailCoupon(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.shopHelper.handleGetDetailShop(id, res, req);
  }
}
