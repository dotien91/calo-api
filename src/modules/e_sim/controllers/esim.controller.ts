import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, Req } from "@nestjs/common";
import { EsimHelper } from "../helper/esim.helper";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateEsimDto } from "../dto/create-esim.dto";
import { ListEsimDto } from "../dto/list-esim.dto";
import { UpdateEsimDto } from "../dto/update-esim.dto";
import { CreateEsimCountryDto } from "../dto/create-esim_country.dto";
import { resolve } from "path";

@Controller("esim")
export class EsimController {
  constructor(private readonly esimHelper: EsimHelper) {}

  @Get("/view")
  async getView(@Res() res: Response, @Req() req: ExpressRequestDto) {
    res.sendFile(resolve("./../../../modules/e_sim/views/index.html"));
  }

  /**
   *
   * @param query
   * @param res
   * @param req
   * @returns
   */
  @Get("/list")
  async getUserEsim(@Query() query: ListEsimDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.esimHelper.getListEsim(query, res, req);
  }

  /**
   *
   * @param createEsimBody
   * @param res
   * @param req
   * @returns
   */
  @Post("/create")
  async createNewEsim(@Body() createEsimBody: CreateEsimDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.esimHelper.createNewEsim(createEsimBody, res, req);
  }

  /**
   *
   * @param dataUpdate
   * @param res
   * @param req
   * @returns
   */
  @Patch("/update")
  async updateByAdmin(@Body() dataUpdate: UpdateEsimDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.esimHelper.handleUpdateEsimByAdmin(dataUpdate, res, req);
  }

  /**
   *
   * @param id
   * @param res
   * @param req
   * @returns
   */
  @Delete("delete/:id")
  async deleteEsim(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.esimHelper.handleDeleteEsim(id, res, req);
  }

  /**
   *
   * @param id
   * @param res
   * @param req
   * @returns
   */
  @Get("detail/:id")
  async getDetailEsim(
    @Query() query: ListEsimDto,
    @Param("id") id: string,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.esimHelper.handleGetDetailEsim(id, query, res, req);
  }

  /**
   *
   * @param query
   * @param res
   * @param req
   * @returns
   */
  @Get("/list-country")
  async getUserEsimCountry(@Query() query: ListEsimDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.esimHelper.getListEsimCountry(query, res, req);
  }

  /**
   *
   * @param createEsimBody
   * @param res
   * @param req
   * @returns
   */
  @Post("/create-country")
  async createNewEsimCountry(
    @Body() createEsimBody: CreateEsimCountryDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.esimHelper.createNewEsimCountry(createEsimBody, res, req);
  }

  /**
   *
   * @param dataUpdate
   * @param res
   * @param req
   * @returns
   */
  @Patch("/update-country")
  async updateByAdminCountry(@Body() dataUpdate: UpdateEsimDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.esimHelper.handleUpdateEsimCountryByAdmin(dataUpdate, res, req);
  }

  /**
   *
   * @param id
   * @param res
   * @param req
   * @returns
   */
  @Delete("delete-country/:id")
  async deleteEsimCountry(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.esimHelper.handleDeleteEsimCountry(id, res, req);
  }

  /**
   *
   * @param id
   * @param res
   * @param req
   * @returns
   */
  @Get("detail-country/:id")
  async getDetailEsimCountry(
    @Query() query: ListEsimDto,
    @Param("id") id: string,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.esimHelper.handleGetDetailEsimCountry(id, query, res, req);
  }
}
