import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, Query } from "@nestjs/common";
import { EventHelper } from "../helper/event.helper";
import { Response, Request } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { SearchEventDto } from "../dto/search.event.dto";
import { CreateEventDto } from "../dto/create.event.dto";
import { UpdateEventDto } from "../dto/update.event.dto";
import { CreateEventTypeDto } from "../dto/create.event_type.dto";
import { CreateUserFollowDto } from "../../../modules/user/dto/create-user_follow.dto";
import { CreateUserFollowEventDto } from "../dto/create-user_follow_event.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { SearchEventLikeDto } from "../dto/search.event_like.dto";

@Controller("event")
@ApiTags("event")
@ApiBearerAuth("ICEO")
export class EventController {
  constructor(private readonly eventHelper: EventHelper) {}

  @Get("list")
  async handleSearchEvent(@Query() query: SearchEventDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return this.eventHelper.handleSearch(query, req, res);
  }

  @Get("list-like")
  async handleSearchEventLike(@Query() query: SearchEventLikeDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return this.eventHelper.handleSearchLike(query, req, res);
  }

  @Post("/create-event")
  async createNewEvent(@Body() createEventBody: CreateEventDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.eventHelper.createNewEvent(createEventBody, res, req);
  }

  @Patch("/update-event")
  async updateByAdmin(@Body() dataUpdate: UpdateEventDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.eventHelper.handleUpdateEventByAdmin(dataUpdate, res, req);
  }

  @Get("detail-event/:id")
  async getDetailEvent(
    @Query() query: SearchEventDto,
    @Param("id") id: string,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.eventHelper.handleGetDetailEvent(query, id, res, req);
  }

  @Delete("delete-event/:id")
  async removeEvent(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.eventHelper.removeEvent(id, res, req);
  }

  @Post("like")
  handleFollowUser(@Body() dataFollow: CreateUserFollowEventDto, @Res() res: Response, @Req() req: Request) {
    return this.eventHelper.processFollowUser(dataFollow, req, res);
  }

  @Post("un-like")
  handleUnFollowUser(@Body() dataFollow: CreateUserFollowEventDto, @Res() res: Response, @Req() req: Request) {
    return this.eventHelper.processUnFollowUser(dataFollow, req, res);
  }
}
