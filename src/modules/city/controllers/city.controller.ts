import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, Req } from "@nestjs/common";
import { CityHelper } from "../helper/city.helper";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateCityDto } from "../dto/create-city.dto";
import { ListCityDto } from "../dto/list-city.dto";
import { UpdateCityDto } from "../dto/update-city.dto";
import { CreateUserJoinCityDto } from "../dto/create-user_join_city.dto";
import { CrawlCityDto } from "../dto/crawl-city.dto";

@Controller("city")
export class CityController {
  constructor(private readonly cityHelper: CityHelper) {}

  @Get("/list")
  async getUserCity(@Query() query: ListCityDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.cityHelper.getCityListByUser(query, res, req);
  }

  @Get("/client-list")
  async getListClient(@Query() query: ListCityDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.cityHelper.getListClient(query, res, req);
  }

  @Get("/admin-list")
  async getAdminCity(@Query() query: ListCityDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.cityHelper.getCityListByAdmin(query, res, req);
  }

  @Get("/process-city-avatar")
  async processCityAvatar(@Query() query: CrawlCityDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.cityHelper.processCityAvatar(query, res, req);
  }

  @Get("/top-country")
  async processCountry(@Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.cityHelper.processCountry(res, req);
  }

  @Get("/process-avatar")
  async processAvatar(@Query() query: CrawlCityDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.cityHelper.processAvatar(query, res, req);
  }

  @Get("/process-city")
  async processCity(@Query() query: CrawlCityDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.cityHelper.processCity(query, res, req);
  }

  // @Get("/process-people")
  // async processPeople(
  //   @Query() query: CrawlCityDto,
  //   @Res() res: Response,
  //   @Req() req: ExpressRequestDto
  // ) {
  //   return await this.cityHelper.processPeople(query, res, req);
  // }

  @Get("/process-thumbnail")
  async processThumbnail(@Query() query: CrawlCityDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.cityHelper.processThumbnail(query, res, req);
  }

  @Post("/create")
  async createNewCity(@Body() createCityBody: CreateCityDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.cityHelper.createNewCity(createCityBody, res, req);
  }

  @Patch("/update")
  async updateByAdmin(@Body() dataUpdate: UpdateCityDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.cityHelper.handleUpdateCityByAdmin(dataUpdate, res, req);
  }

  @Get("detail/:id")
  async getDetailCity(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.cityHelper.handleGetDetailCity(id, res, req);
  }

  @Post("join")
  handleFollowUser(@Body() dataFollow: CreateUserJoinCityDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.cityHelper.processJoinUser(dataFollow, req, res);
  }

  @Post("un-join")
  handleUnFollowUser(@Body() dataFollow: CreateUserJoinCityDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.cityHelper.processUnJoinUser(dataFollow, req, res);
  }
}
