import { Body, Controller, Get, Post, Query, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { Permissions } from "../../../decorators/auth.decorator";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { UserRoles } from "../../user/interfaces/user.interface";
import { CreateTrackingDto } from "../dto/create-tracking.dto";
import { ListMyBodyTrackingDto } from "../dto/list-my-body-tracking.dto";
import { ListTrackingDto } from "../dto/list-tracking.dto";
import { TrackingHelper } from "../helper/tracking.helper";

@Controller("tracking")
export class TrackingController {
  constructor(private readonly trackingHelper: TrackingHelper) {}

  /**
   * @author Tony Vu
   * Tạo tracking event (type, user_id)
   */
  @Post("/create")
  async create(
    @Body() createData: CreateTrackingDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.trackingHelper.createTracking(createData, res, req);
  }

  /**
   * @author Tony Vu
   * Lấy danh sách tracking body của chính user (type = body)
   */
  @Get("/my-body")
  async getMyBody(
    @Query() query: ListMyBodyTrackingDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.trackingHelper.getMyBodyTracking(query, res, req);
  }

  /**
   * @author Tony Vu
   * Lấy danh sách tracking (admin)
   */
  @Get("/list-admin")
  @Permissions(UserRoles.ADMIN)
  async getListByAdmin(@Query() query: ListTrackingDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.trackingHelper.getListByAdmin(query, res, req);
  }
}
