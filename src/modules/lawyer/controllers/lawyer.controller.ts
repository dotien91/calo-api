import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, Req } from "@nestjs/common";
import { LawyerHelper } from "../helper/lawyer.helper";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateLawyerDto } from "../dto/create-lawyer.dto";
import { ListLawyerDto } from "../dto/list-lawyer.dto";
import { UpdateLawyerDto } from "../dto/update-lawyer.dto";
import { CreateUserFollowLawyerDto } from "../dto/create-user_follow_lawyer.dto";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { CreateLawyerRawDto } from "../dto/create.lawyer_raw.dto";

@Controller("lawyer")
@ApiTags("lawyer")
export class LawyerController {
  constructor(private readonly lawyerHelper: LawyerHelper) {}

  @Get("/list")
  async getUserLawyer(@Query() query: ListLawyerDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.lawyerHelper.getLawyerListByUser(query, res, req);
  }

  @Get("/admin-list")
  async getAdminLawyer(@Query() query: ListLawyerDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.lawyerHelper.getLawyerListByAdmin(query, res, req);
  }

  @Post("/create")
  @ApiBody({ type: CreateLawyerDto })
  async createNewLawyer(
    @Body() createLawyerBody: CreateLawyerDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.lawyerHelper.createNewLawyer(createLawyerBody, res, req);
  }

  @Post("/create-raw")
  @ApiBody({ type: CreateLawyerDto })
  async createLawyerRaw(
    @Body() createLawyerBody: CreateLawyerRawDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.lawyerHelper.createLawyerRaw(createLawyerBody, res, req);
  }

  @Post("/update")
  async updateByAdmin(@Body() dataUpdate: UpdateLawyerDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.lawyerHelper.handleUpdateLawyerByAdmin(dataUpdate, res, req);
  }

  @Get("detail/:id")
  async getDetailLawyer(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.lawyerHelper.handleGetDetailLawyer(id, res, req);
  }

  @Post("like")
  handleFollowUser(@Body() dataFollow: CreateUserFollowLawyerDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.lawyerHelper.processFollowUser(dataFollow, req, res);
  }

  @Post("un-like")
  handleUnFollowUser(
    @Body() dataFollow: CreateUserFollowLawyerDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return this.lawyerHelper.processUnFollowUser(dataFollow, req, res);
  }
}
