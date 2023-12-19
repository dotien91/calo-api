import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, Req } from "@nestjs/common";
import { ShortHelper } from "../helper/short.helper";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateShortDto } from "../dto/create-short.dto";
import { ListShortDto } from "../dto/list-short.dto";
import { UpdateShortDto } from "../dto/update-short.dto";
import { CreateShortViewDto } from "../dto/create-short_view.dto";
import { CreateShortLikeDto } from "../dto/create-short_like.dto";

@Controller("short")
export class ShortController {
  constructor(private readonly shortHelper: ShortHelper) {}

  @Get("/list")
  async getUserShort(@Query() query: ListShortDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.shortHelper.getShortList(query, res, req);
  }

  @Get("/admin-list")
  async getAdminShort(@Query() query: ListShortDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.shortHelper.getShortListByAdmin(query, res, req);
  }

  @Post("/create")
  async createNewShort(@Body() createShortBody: CreateShortDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.shortHelper.createNewShort(createShortBody, res, req);
  }

  @Patch("/update")
  async updateShort(@Body() dataUpdate: UpdateShortDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.shortHelper.updateShort(dataUpdate, res, req);
  }

  @Post("view")
  handleViewUser(@Body() dataView: CreateShortViewDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.shortHelper.processViewUser(dataView, req, res);
  }

  @Post("like")
  handleFollowUser(@Body() dataFollow: CreateShortLikeDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.shortHelper.processFollowUser(dataFollow, req, res);
  }

  @Get("list-like")
  handleGetListLike(@Query() query: ListShortDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.shortHelper.handleGetListLike(query, res, req);
  }

  @Get("list-view")
  handleGetListView(@Query() query: ListShortDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.shortHelper.handleGetListView(query, res, req);
  }

  @Post("un-like")
  handleUnFollowUser(@Body() dataFollow: CreateShortLikeDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.shortHelper.processUnFollowUser(dataFollow, req, res);
  }

  @Patch("/update")
  async updateByAdmin(@Body() dataUpdate: UpdateShortDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.shortHelper.handleUpdateShortByAdmin(dataUpdate, res, req);
  }

  @Get("detail/:id")
  async getDetailShort(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.shortHelper.handleGetDetailShort(id, res, req);
  }

  @Delete("delete/:id")
  async deleteShort(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.shortHelper.handleDeleteShort(id, res, req);
  }
}
