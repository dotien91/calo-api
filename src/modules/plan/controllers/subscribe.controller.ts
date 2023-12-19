import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, Req } from "@nestjs/common";
import { PlanHelper } from "../helper/plan.helper";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreatePlanDto } from "../dto/create-plan.dto";
import { ListPlanDto } from "../dto/list-plan.dto";
import { HandleServiceHelper } from "../helper/handle_service.helper";
import { CreateHandleServiceDto } from "../dto/create-handle_service.dto";
import { UpdatePlanDto } from "../dto/update-plan.dto";
import { ListHandleServiceDto } from "../dto/list-handle_service.dto";
import { UpdateHandleServiceDto } from "../dto/update-handle_service.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@Controller("plan")
@ApiTags("plan")
@ApiBearerAuth("ICEO")
export class SubscribeController {
  constructor(private readonly planHelper: PlanHelper, private readonly handleServiceHelper: HandleServiceHelper) {}

  @Post("/create-service")
  async createNewService(
    @Body() createHandleServiceData: CreateHandleServiceDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.handleServiceHelper.createHandleService(createHandleServiceData, res, req);
  }

  @Post("/create-plan")
  async createNewPlan(@Body() createPlanData: CreatePlanDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.planHelper.createPlan(createPlanData, res, req);
  }

  @Patch("/update-plan")
  async updatePlan(@Body() updatePlanData: UpdatePlanDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.planHelper.updatePlan(updatePlanData, res, req);
  }

  @Patch("/update-service")
  async updateHandleService(
    @Body() updateHandleServiceData: UpdateHandleServiceDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.handleServiceHelper.updateHandleService(updateHandleServiceData, res, req);
  }

  @Get("/list-plan")
  async getListPlan(@Query() query: ListPlanDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.planHelper.getListPlan(query, res, req);
  }

  @Get("/list-service")
  async getListHandle(@Query() query: ListHandleServiceDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.handleServiceHelper.getListHandle(query, res, req);
  }

  @Delete("delete-plan/:id")
  async removePlan(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.planHelper.removePlan(id, res, req);
  }

  @Delete("delete-handle/:id")
  async removeHandle(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.handleServiceHelper.removeHandle(id, res, req);
  }

  @Get("detail-service/:id")
  async handleGetDetailService(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.handleServiceHelper.handleGetDetailService(id, res, req);
  }

  @Get("detail-plan/:id")
  async handleGetDetailPlan(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.planHelper.handleGetDetailPlan(id, res, req);
  }
}
