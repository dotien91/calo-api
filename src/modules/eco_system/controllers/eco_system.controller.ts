import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, Req } from "@nestjs/common";
import { EcoSystemHelper } from "../helper/eco_system.helper";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateEcoSystemDto } from "../dto/create-eco_system.dto";
import { ListEcoSystemDto } from "../dto/list-eco_system.dto";
import { UpdateEcoSystemDto } from "../dto/update-eco_system.dto";

@Controller("eco-system")
export class EcoSystemController {
  constructor(private readonly ecoSystemHelper: EcoSystemHelper) {
    setTimeout(() => {
      // this.handleUpdateEcoSystem();
    }, 1000);
  }

  async handleUpdateEcoSystem() {
    return this.ecoSystemHelper.updateEcosystem();
  }

  @Get("/list")
  async getAdminEcoSystem(@Query() query: ListEcoSystemDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.ecoSystemHelper.getEcoSystemListByAdmin(query, res, req);
  }

  @Post("/create")
  async createNewEcoSystem(
    @Body() createEcoSystemBody: CreateEcoSystemDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.ecoSystemHelper.createNewEcoSystem(createEcoSystemBody, res, req);
  }

  @Post("/admin-update")
  async updateByAdmin(@Body() dataUpdate: UpdateEcoSystemDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.ecoSystemHelper.handleUpdateEcoSystemByAdmin(dataUpdate, res, req);
  }

  @Get("detail/:id")
  async getDetailEcoSystem(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.ecoSystemHelper.handleGetDetailEcoSystem(id, res, req);
  }

  @Delete("delete/:id")
  async deleteEcoSystem(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.ecoSystemHelper.handleDeleteEcoSystem(id, res, req);
  }
}
