import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { Permissions } from "../../../decorators/auth.decorator";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { UserRoles } from "../../../modules/user/interfaces/user.interface";
import { CreateCategoryDto } from "../dto/create-category.dto";
import { CreateShortDto } from "../dto/create-short.dto";
import { CreateShortLikeDto } from "../dto/create-short_like.dto";
import { CreateShortViewDto } from "../dto/create-short_view.dto";
import { ListCategoryDto } from "../dto/list-category.dto";
import { ListShortDto } from "../dto/list-short.dto";
import { UpdateCategoryDto } from "../dto/update-category.dto";
import { UpdateShortDto } from "../dto/update-short.dto";
import { ShortHelper } from "../helper/short.helper";
import { ShortCategoryHelper } from "../helper/short_category.helper";

@Controller("short")
export class ShortController {
  constructor(private readonly shortHelper: ShortHelper, private readonly categoryHelper: ShortCategoryHelper) {}

  @Get("/list")
  async getUserShort(@Query() query: ListShortDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.shortHelper.getShortList(query, res, req);
  }

  @Get("/admin-list")
  @Permissions(UserRoles.ADMIN)
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

  @Get("/list-category")
  async getUserCategory(@Query() query: ListCategoryDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.categoryHelper.getCategoryListByUser(query, res, req);
  }

  @Get("/admin-list-category")
  @Permissions(UserRoles.ADMIN)
  async getAdminCategory(@Query() query: ListCategoryDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.categoryHelper.getCategoryListByAdmin(query, res, req);
  }

  @Post("/create-category")
  async createNewCategory(
    @Body() createPostBody: CreateCategoryDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.categoryHelper.createNewCategory(createPostBody, res, req);
  }

  @Patch("/update-category")
  async updateByAdminCategory(
    @Body() dataUpdate: UpdateCategoryDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.categoryHelper.handleUpdateCategoryByAdmin(dataUpdate, res, req);
  }

  @Get("detail-category/:id")
  async getDetailCategory(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.categoryHelper.handleGetDetailCategory(id, res, req);
  }

  @Delete("delete-category/:id")
  async deleteCategory(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.categoryHelper.handleDeleteCategory(id, res, req);
  }
}
