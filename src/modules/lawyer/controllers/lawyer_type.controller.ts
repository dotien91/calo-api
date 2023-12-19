import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, Query } from "@nestjs/common";
import { LawyerTypeHelper } from "../helper/lawyer_type.helper";
import { Response, Request } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateLawyerTypeDto } from "../dto/create.lawyer_type.dto";
import { SearchLawyerTypeDto } from "../dto/search.lawyer_type.dto";
import { UpdateLawyerTypeDto } from "../dto/update.lawyer_type.dto";
import { ApiTags } from "@nestjs/swagger";

@Controller("lawyer-type")
@ApiTags("lawyer")
export class LawyerTypeController {
  constructor(private readonly lawyerTypeHelper: LawyerTypeHelper) {}

  @Post("/create-type")
  async createNewLawyerType(
    @Body() createLawyerBody: CreateLawyerTypeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.lawyerTypeHelper.createNewLawyerType(createLawyerBody, res, req);
  }

  @Post("/create-category")
  async createNewLawyerCategory(
    @Body() createLawyerBody: CreateLawyerTypeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.lawyerTypeHelper.createNewLawyerCategory(createLawyerBody, res, req);
  }

  @Get("/list-type")
  async getListLawyerType(@Query() query: SearchLawyerTypeDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.lawyerTypeHelper.getListLawyerType(query, res, req);
  }

  @Get("/list-category")
  async getListLawyerCategory(
    @Query() query: SearchLawyerTypeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.lawyerTypeHelper.getListLawyerCategory(query, res, req);
  }

  @Patch("/admin-update-type")
  async updateTypeByAdmin(
    @Body() dataUpdate: UpdateLawyerTypeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.lawyerTypeHelper.handleUpdateLawyerTypeByAdmin(dataUpdate, res, req);
  }

  @Patch("/admin-update-category")
  async updateCategoryByAdmin(
    @Body() dataUpdate: UpdateLawyerTypeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.lawyerTypeHelper.handleUpdateLawyerCategoryByAdmin(dataUpdate, res, req);
  }

  @Get("detail-type/:id")
  async getDetailLawyerType(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.lawyerTypeHelper.getDetailLawyerType(id, res, req);
  }

  @Get("detail-category/:id")
  async getDetailLawyerCategory(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.lawyerTypeHelper.getDetailLawyerCategory(id, res, req);
  }

  @Delete("delete-type/:id")
  async removeLawyerType(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.lawyerTypeHelper.removeLawyerType(id, res, req);
  }

  @Delete("delete-category/:id")
  async removeLawyerCategory(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.lawyerTypeHelper.removeLawyerCategory(id, res, req);
  }
}
