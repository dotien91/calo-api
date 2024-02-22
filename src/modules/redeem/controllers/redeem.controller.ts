import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateRedeemDTO, ListRedeemDto, UpdateRedeemDTO } from "../dtos/redeem.dto";
import { CreateRedeemMissionDTO, ListRedeemMissionDto, UpdateRedeemMissionDTO } from "../dtos/redeem_mission.dto";
import { RedeemHelper } from "../helpers/redeem.helper";
import { RedeemMissionHelper } from "../helpers/redeem_mission.helper";

@Controller("redeem")
export class RedeemController {
  constructor(private readonly redeemHelper: RedeemHelper, private readonly redeemMissionHelper: RedeemMissionHelper) {}

  // redeem apis
  @Get("/list")
  async listRedeem(@Query() query: ListRedeemDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.redeemHelper.list(query, res, req);
  }

  @Post("/create")
  async createNewRedeem(
    @Body() createRedeemData: CreateRedeemDTO,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.redeemHelper.createRedeem(createRedeemData, res, req);
  }

  @Patch("/update")
  async updateRedeem(@Body() updateRedeemData: UpdateRedeemDTO, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.redeemHelper.updateRedeem(updateRedeemData, res, req);
  }

  @Delete(":id")
  async removeRedeem(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.redeemHelper.removeRedeem(id, res, req);
  }

  @Get("detail/:id")
  async handleGetDetailRedeem(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.redeemHelper.handleGetDetailRedeem(id, res, req);
  }

  // redeem mission apis
  @Get("mission/list")
  async listRedeemMission(@Query() query: ListRedeemMissionDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.redeemMissionHelper.list(query, res, req);
  }

  @Post("mission/create")
  async createNewRedeemMission(
    @Body() createRedeemData: CreateRedeemMissionDTO,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.redeemMissionHelper.createRedeem(createRedeemData, res, req);
  }

  @Patch("mission/update")
  async updateRedeemMission(
    @Body() updateRedeemData: UpdateRedeemMissionDTO,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.redeemMissionHelper.updateRedeem(updateRedeemData, res, req);
  }

  @Delete("mission/:id")
  async removeRedeemMission(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.redeemMissionHelper.removeRedeem(id, res, req);
  }

  @Get("mission/detail/:id")
  async handleGetDetailRedeemMission(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.redeemMissionHelper.handleGetDetailRedeem(id, res, req);
  }
}
