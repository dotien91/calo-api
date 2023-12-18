import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, Req } from "@nestjs/common";
import { ReportHelper } from "../helper/report.helper";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { ListReportDto } from "../dto/list-report.dto";
import { CreateReportDto } from "../dto/create-report.dto";
import { UpdateReportDto } from "../dto/update-report.dto";

@Controller("report")
export class ReportController {
  constructor(private readonly reportHelper: ReportHelper) { }

  @Post("/create-report")
  async createNewReport(
    @Body() createReportData: CreateReportDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.reportHelper.createReport(createReportData, res, req);
  }

  @Post("/create-report-anonymous")
  async createNewReportAnonymous(
    @Body() createReportData: CreateReportDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.reportHelper.createNewReportAnonymous(createReportData, res, req);
  }

  @Post("/contact-us")
  async contactUs(
    @Body() createReportData: CreateReportDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.reportHelper.createContactUs(createReportData, res, req);
  }

  @Patch("/update-report")
  async updateReport(
    @Body() updateReportData: UpdateReportDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.reportHelper.updateReport(updateReportData, res, req);
  }

  @Get("/user/:id")
  async getSubscribe(
    @Query() query: ListReportDto,
    @Param("id") id: string,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.reportHelper.getReportByUserId(query, id, res, req);
  }

  @Get("/list-admin")
  async getListUserSubscribe(@Query() query: ListReportDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.reportHelper.getAllReportByAdmin(query, res, req);
  }

  @Delete("delete-report/:id")
  async removeReport(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.reportHelper.removeReport(id, res, req);
  }

  @Get("detail-report/:id")
  async handleGetDetailReport(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.reportHelper.handleGetDetailReport(id, res, req);
  }
}
