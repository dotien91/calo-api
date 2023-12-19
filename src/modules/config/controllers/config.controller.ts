import { Body, Controller, Get, Param, Post, Query, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateConfigDto } from "../dto/create-config.dto";
import { ListConfigDto } from "../dto/list-config.dto";
import { UpdateConfigDto } from "../dto/update-config.dto";
import { ConfigHelper } from "../helper/config.helper";

@Controller("config")
export class ConfigController {
  constructor(private readonly configHelper: ConfigHelper) {}

  @Get("/list/:type")
  async getUserConfig(
    @Param("type") type: string,
    @Query() query: ListConfigDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.configHelper.getConfigListByUser(type, query, res, req);
  }

  // @Get("/default-avatar/:type")
  // async getDefaultAvatar(@Param("type") type: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
  //   return await this.configHelper.getDefaultAvatar(type, res, req);
  // }

  @Get("/:type/:package")
  async getPackageType(@Param("type") type: string, @Param("package") packageString: string, @Res() res: Response) {
    return await this.configHelper.getPackageType(type, packageString, res);
  }

  @Get("/check-gpt-health/:type/:password")
  async checkGPTHealth(
    @Param("type") type: string,
    @Param("password") password: string,
    @Query() query: ListConfigDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.configHelper.checkGPTHealth(type, password, query, res, req);
  }

  @Get("/admin-list")
  async getAdminConfig(@Query() query: ListConfigDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.configHelper.getConfigListByAdmin(query, res, req);
  }

  @Post("/create")
  async createNewConfig(
    @Body() createConfigBody: CreateConfigDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.configHelper.createNewConfig(createConfigBody, res, req);
  }

  @Post("/admin-update")
  async updateByAdmin(@Body() dataUpdate: UpdateConfigDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.configHelper.handleUpdateConfigByAdmin(dataUpdate, res, req);
  }

  @Get("detail-config/:id")
  async getDetailConfig(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.configHelper.handleGetDetailConfig(id, res, req);
  }
}
