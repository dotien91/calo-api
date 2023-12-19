import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, Req } from "@nestjs/common";
import { GiftHelper } from "../helper/gift.helper";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { ListGiftDto } from "../dto/list-gift.dto";
import { CreateGiftDto } from "../dto/create-gift.dto";
import { UpdateGiftDto } from "../dto/update-gift.dto";
import { ListUserGiftDto } from "../dto/list-user_gift.dto";
import { CreateSellGiftDto } from "../dto/create-sell_gift.dto";
import { CreateBuyGiftDto } from "../dto/create-buy_gift.dto";
import { CreateGiveGiftDto } from "../dto/create-give_gift.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UpdateUserGiftDto } from "../dto/update-user_gift.dto";

@Controller("gift")
@ApiTags("gift")
@ApiBearerAuth("ICEO")
export class GiftController {
  constructor(private readonly giftHelper: GiftHelper) {}

  @Post("/create-gift")
  async createNewGift(@Body() createGiftData: CreateGiftDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.giftHelper.createGift(createGiftData, res, req);
  }

  @Patch("/update-gift")
  async updateGift(@Body() updateGiftData: UpdateGiftDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.giftHelper.updateGift(updateGiftData, res, req);
  }

  @Patch("/update-user-gift")
  async updateUserGift(@Body() updateGiftData: UpdateUserGiftDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.giftHelper.updateUserGift(updateGiftData, res, req);
  }

  @Get("/user/:id")
  async getSubscribe(
    @Query() query: ListUserGiftDto,
    @Param("id") id: string,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.giftHelper.getUserGiftByUserId(query, id, res, req);
  }

  @Get("/list-gift")
  async getListGift(@Query() query: ListGiftDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.giftHelper.getListGift(query, res, req);
  }

  @Get("/list-user")
  async getListUserSubscribe(@Query() query: ListUserGiftDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.giftHelper.getAllUserGiftByAdmin(query, res, req);
  }

  @Delete("delete-gift/:id")
  async removeGift(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.giftHelper.removeGift(id, res, req);
  }

  @Get("detail-gift/:id")
  async handleGetDetailGift(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.giftHelper.handleGetDetailGift(id, res, req);
  }

  @Post("sell-gift")
  async handleSellGift(@Body() updateGiftData: CreateSellGiftDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.giftHelper.handleSellGift(updateGiftData, res, req);
  }

  @Post("buy-gift")
  async handleBuyGift(@Body() updateGiftData: CreateBuyGiftDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.giftHelper.handleBuyGift(updateGiftData, res, req);
  }

  @Post("give-gift")
  async handleGiveGift(@Body() updateGiftData: CreateGiveGiftDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.giftHelper.handleGiveGift(updateGiftData, res, req);
  }

  @Get("send-suprise-gift")
  async testSendSupriseGift() {
    return await this.giftHelper.addGiftToQueue();
  }

  @Get("coin-box-gift")
  async plusCoinBox(@Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.giftHelper.plusPointBox(res, req);
  }
}
