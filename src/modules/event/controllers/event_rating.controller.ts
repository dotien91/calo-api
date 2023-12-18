import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, Query } from "@nestjs/common";
import { EventTypeHelper } from "../helper/event_type.helper";
import { Response, Request } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateEventRatingDto } from "../dto/create.event_rating.dto";
import { EventRatingHelper } from "../helper/event_rating.helper";
import { UpdateEventRatingDto } from "../dto/update.event_rating.dto";
import { SearchMyEventRatingDto } from "../dto/search.my_event_rating.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@Controller("event-rating")
@ApiTags('event')
@ApiBearerAuth('ICEO')
export class EventRatingController {
  constructor(private readonly eventRatingHelper: EventRatingHelper) { }

  @Post("/create")
  async createNewEventType(
    @Body() createEventBody: CreateEventRatingDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.eventRatingHelper.createNewEventRating(createEventBody, res, req);
  }

  @Patch("/update")
  async updateTypeByAdmin(
    @Body() dataUpdate: UpdateEventRatingDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.eventRatingHelper.handleUpdateRating(dataUpdate, res, req);
  }

  @Get("my-rating/:id")
  async getDetailEventCategory(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.eventRatingHelper.getMyRating(id, res, req);
  }

  @Get("my-ratings")
  async getMyListRating(@Query() query: SearchMyEventRatingDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.eventRatingHelper.getMyListRating(query, res, req);
  }

  @Get("list")
  async getAdminList(@Query() query: SearchMyEventRatingDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.eventRatingHelper.getAdminList(query, res, req);
  }

  @Delete("delete/:id")
  async removeRatingByAdmin(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.eventRatingHelper.removeRatingByAdmin(id, res, req);
  }
}
