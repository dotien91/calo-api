import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, Req } from "@nestjs/common";
import { NeedHelpHelper } from "../helper/need_help.helper";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { ListNeedHelpDto } from "../dto/list-need_help.dto";
import { CreateNeedHelpDto } from "../dto/create-need_help.dto";
import { UpdateNeedHelpDto } from "../dto/update-need_help.dto";

@Controller("need-help")
export class NeedHelpController {
  constructor(private readonly needHelpHelper: NeedHelpHelper) {}

  @Post("/create")
  async createNewNeedHelp(
    @Body() createNeedHelpData: CreateNeedHelpDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.needHelpHelper.createNeedHelp(createNeedHelpData, res, req);
  }

  @Patch("/update")
  async updateNeedHelp(
    @Body() updateNeedHelpData: UpdateNeedHelpDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.needHelpHelper.updateNeedHelp(updateNeedHelpData, res, req);
  }

  @Get("/user/:id")
  async getSubscribe(
    @Query() query: ListNeedHelpDto,
    @Param("id") id: string,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.needHelpHelper.getNeedHelpByUserId(query, id, res, req);
  }

  @Get("/list")
  async getListUserSubscribe(@Query() query: ListNeedHelpDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.needHelpHelper.getAllNeedHelpByAdmin(query, res, req);
  }

  @Delete("delete-contact-form/:id")
  async removeNeedHelp(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.needHelpHelper.removeNeedHelp(id, res, req);
  }

  @Get("detail/:id")
  async handleGetDetailNeedHelp(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.needHelpHelper.handleGetDetailNeedHelp(id, res, req);
  }
}
