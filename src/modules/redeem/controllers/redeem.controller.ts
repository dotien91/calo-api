import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, Req } from "@nestjs/common";
import { RedeemHelper } from "../helper/redeem.helper";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateRedeemDto } from "../dto/create-redeem.dto";
import { ListRedeemDto } from "../dto/list-redeem.dto";
import { UpdateRedeemDto } from "../dto/update-redeem.dto";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateRedeemPermissionDto } from "../dto/create-redeem_permission.dto";
import { ListRedeemPermissionDto } from "../dto/list-redeem_permission.dto";

@Controller("redeem")
@ApiTags("redeem")
@ApiBearerAuth("ICEO")
export class RedeemController {
  constructor(private readonly redeemHelper: RedeemHelper) { }

  /**
   * ######## FOR REQUEST ######
   */

  /**
   *
   * @param query
   * @param res
   * @param req
   * @returns
   */
  @Get("/list")
  async getUserRedeem(@Query() query: ListRedeemDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.redeemHelper.getListRedeem(query, res, req);
  }

  /**
   *
   * @param query
   * @param res
   * @param req
   * @returns
   */
  @Get("/list-permission")
  async getListUserRedeemMission(
    @Query() query: ListRedeemPermissionDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.redeemHelper.getListUserRedeemMission(query, res, req);
  }

  /**
   *
   * @param createRedeemBody
   * @param res
   * @param req
   * @returns
   */
  @Post("/create")
  async createNewRedeem(
    @Body() createRedeemBody: CreateRedeemDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.redeemHelper.createNewRedeem(createRedeemBody, res, req);
  }

  /**
   *
   * @param createRedeemBody
   * @param res
   * @param req
   * @returns
   */
  @Post("/join-permission")
  async joinPermission(
    @Body() createRedeemBody: CreateRedeemPermissionDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.redeemHelper.createNewRedeemPermission(createRedeemBody, req, res);
  }

  /**
   *
   * @param dataUpdate
   * @param res
   * @param req
   * @returns
   */
  @Patch("/update")
  async updateByAdmin(@Body() dataUpdate: UpdateRedeemDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.redeemHelper.handleUpdateRedeemByAdmin(dataUpdate, res, req);
  }

  /**
   *
   * @param id
   * @param res
   * @param req
   * @returns
   */
  @Delete("delete/:id")
  async deleteRedeem(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.redeemHelper.handleDeleteRedeem(id, res, req);
  }

  /**
   *
   * @param id
   * @param res
   * @param req
   * @returns
   */
  @Get("detail/:id")
  async getDetailRedeem(
    @Query() query: ListRedeemDto,
    @Param("id") id: string,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.redeemHelper.handleGetDetailRedeem(id, query, res, req);
  }
}
