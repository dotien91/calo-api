import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, Query } from "@nestjs/common";
import { EventTypeHelper } from "../helper/event_type.helper";
import { Response, Request } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { SearchEventDto } from "../dto/search.event.dto";
import { CreateEventDto } from "../dto/create.event.dto";
import { UpdateEventDto } from "../dto/update.event.dto";
import { CreateEventTypeDto } from "../dto/create.event_type.dto";
import { SearchEventTypeDto } from "../dto/search.event_type.dto";
import { UpdateEventTypeDto } from "../dto/update.event_type.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@Controller("event-type")
@ApiTags('event')
@ApiBearerAuth('ICEO')
export class EventTypeController {
  constructor(private readonly eventTypeHelper: EventTypeHelper) { }

  @Post("/create-type")
  async createNewEventType(
    @Body() createEventBody: CreateEventTypeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.eventTypeHelper.createNewEventType(createEventBody, res, req);
  }

  @Post("/create-category")
  async createNewEventCategory(
    @Body() createEventBody: CreateEventTypeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.eventTypeHelper.createNewEventCategory(createEventBody, res, req);
  }

  @Get("/list-type")
  async getListEventType(
    @Query() query: SearchEventTypeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.eventTypeHelper.getListEventType(query, res, req);
  }

  @Get("/list-category")
  async getListEventCategory(
    @Query() query: SearchEventTypeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.eventTypeHelper.getListEventCategory(query, res, req);
  }


  @Patch("/admin-update-type")
  async updateTypeByAdmin(
    @Body() dataUpdate: UpdateEventTypeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.eventTypeHelper.handleUpdateEventTypeByAdmin(dataUpdate, res, req);
  }

  @Patch("/admin-update-category")
  async updateCategoryByAdmin(
    @Body() dataUpdate: UpdateEventTypeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.eventTypeHelper.handleUpdateEventCategoryByAdmin(dataUpdate, res, req);
  }

  @Get("detail-type/:id")
  async getDetailEventType(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.eventTypeHelper.getDetailEventType(id, res, req);
  }

  @Get("detail-category/:id")
  async getDetailEventCategory(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.eventTypeHelper.getDetailEventCategory(id, res, req);
  }

  @Delete("delete-type/:id")
  async removeEventType(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.eventTypeHelper.removeEventType(id, res, req);
  }

  @Delete("delete-category/:id")
  async removeEventCategory(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.eventTypeHelper.removeEventCategory(id, res, req);
  }

}
