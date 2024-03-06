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
  async listShop(@Query() query: ListShopDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.shopHelper.list(query, res, req);
  }

  @Post("/create")
  async createNewShop(@Body() createShopData: CreateShopDTO, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.shopHelper.createShop(createShopData, res, req);
  }

  @Patch("/update")
  async updateShop(@Body() updateShopData: UpdateShopDTO, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.shopHelper.updateShop(updateShopData, res, req);
  }

  @Delete("delete/:id")
  async removeShop(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.shopHelper.removeShop(id, res, req);
  }

  @Get("detail/:id")
  async handleGetDetailShop(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.shopHelper.handleGetDetailShop(id, res, req);
  }
}
