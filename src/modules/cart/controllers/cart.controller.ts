import { Body, Controller, Get, Patch, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CartHandleDTO } from "../dtos/cart.dto";
import { CartHelper } from "../helpers/cart.helper";

@Controller("cart")
export class CartController {
  constructor(private readonly cartHelper: CartHelper) {}

  @Get("/")
  async handleGetDetailCoupon(@Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.cartHelper.handleGetDetailCart(res, req);
  }

  @Patch("/handle")
  async createNewCoupon(@Body() data: CartHandleDTO, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.cartHelper.handleCart(data, res, req);
  }
}
