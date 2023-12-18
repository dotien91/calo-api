import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, Query } from "@nestjs/common";
import { LawyerTypeHelper } from "../helper/lawyer_type.helper";
import { Response, Request } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateLawyerRatingDto } from "../dto/create.lawyer_rating.dto";
import { LawyerRatingHelper } from "../helper/lawyer_rating.helper";
import { UpdateLawyerRatingDto } from "../dto/update.lawyer_rating.dto";
import { SearchMyLawyerRatingDto } from "../dto/search.my_lawyer_rating.dto";
import { ApiTags } from "@nestjs/swagger";

@Controller("lawyer-rating")
@ApiTags('lawyer')
export class LawyerRatingController {
  constructor(private readonly lawyerRatingHelper: LawyerRatingHelper) { }

  @Post("/create")
  async createNewLawyerType(
    @Body() createLawyerBody: CreateLawyerRatingDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.lawyerRatingHelper.createNewLawyerRating(createLawyerBody, res, req);
  }

  @Patch("/update")
  async updateTypeByAdmin(
    @Body() dataUpdate: UpdateLawyerRatingDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.lawyerRatingHelper.handleUpdateRating(dataUpdate, res, req);
  }

  @Get("my-rating/:id")
  async getDetailLawyerCategory(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.lawyerRatingHelper.getMyRating(id, res, req);
  }

  @Get("my-ratings")
  async getMyListRating(@Query() query: SearchMyLawyerRatingDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.lawyerRatingHelper.getMyListRating(query, res, req);
  }

  @Get("list")
  async getAdminList(@Query() query: SearchMyLawyerRatingDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.lawyerRatingHelper.getAdminList(query, res, req);
  }

  @Delete("delete/:id")
  async removeRatingByAdmin(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.lawyerRatingHelper.removeRatingByAdmin(id, res, req);
  }
}
