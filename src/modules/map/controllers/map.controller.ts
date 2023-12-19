import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, Query } from "@nestjs/common";
import { MapHelper } from "../helper/map.helper";
import { Response, Request } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { SearchMapDto } from "../dto/search.map.dto";

@Controller("map")
export class MapController {
  constructor(private readonly mapHelper: MapHelper) {}

  @Get("search")
  async handleLogout(@Query() query: SearchMapDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return this.mapHelper.handleSearch(query, req, res);
  }
}
