import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateSubscribeDto } from "../dto/create-subscribe.dto";
import { ListSubscribeDto } from "../dto/list-subscribe.dto";
import { UpdateSubscribeDto } from "../dto/update-subscribe.dto";
import { UserUpdateSubscribeDto } from "../dto/update-user_subscribe.dto";
import { SubscribeHelper } from "../helper/subscribe.helper";

@Controller("subscribe")
export class SubscribeController {
  constructor(private readonly subscribeHelper: SubscribeHelper) {}

  @Post("/create-subscribe")
  async createNewSubscribe(
    @Body() createSubscribe: CreateSubscribeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.subscribeHelper.createSubscribe(createSubscribe, res, req);
  }

  @Patch("/update-subscribe")
  async updateSubscribe(
    @Body() updateSubscribeData: UpdateSubscribeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.subscribeHelper.updateSubscribe(updateSubscribeData, res, req);
  }

  @Patch("/user-update-subscribe")
  async userUpdateSubscribe(
    @Body() updateSubscribeData: UserUpdateSubscribeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.subscribeHelper.updateSubscribeUser(updateSubscribeData, res, req);
  }

  @Get("/user/:id")
  async getSubscribe(
    @Query() query: ListSubscribeDto,
    @Param("id") id: string,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.subscribeHelper.getSubscribes(query, id, res, req);
  }

  @Get("/list-subscribe")
  async getListUserSubscribe(@Query() query: ListSubscribeDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.subscribeHelper.getAllSubscribeAdmin(query, res, req);
  }

  @Get("/user-expired/:id")
  async getExpiredSubscribes(
    @Query() query: ListSubscribeDto,
    @Param("id") id: string,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.subscribeHelper.getExpiredSubscribes(query, id, res, req);
  }

  @Get("detail-subscribe/:id")
  async handleGetDetailPlan(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.subscribeHelper.handleGetDetailSubscribe(id, res, req);
  }
}
