import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { Permission, Permissions } from "../../../decorators/auth.decorator";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { ListChatHistoryDto } from "../../../modules/chat_history/dto/list-chat_history.dto";
import { Controllers } from "../../../modules/index.i";
import { CreateLivestreamDto } from "../dto/create-livestream.dto";
import { CreateLivestreamCommentWithMediaDto } from "../dto/create-livestream_comment.dto";
import { CreateLivestreamLikeDto } from "../dto/create-livestream_like.dto";
import { CreateLivestreamViewDto } from "../dto/create-livestream_view.dto";
import { ListLivestreamDto } from "../dto/list-livestream.dto";
import { UpdateLivestreamDto } from "../dto/update-livestream.dto";
import { LivestreamHelper } from "../helper/livestream.helper";

@Controller(Controllers.LIVESTREAM)
@ApiTags("livestream")
@ApiBearerAuth("ICEO")
export class LivestreamController {
  constructor(private readonly livestreamHelper: LivestreamHelper) {}

  @Get("/list")
  async getUserLivestream(@Query() query: ListLivestreamDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.livestreamHelper.getLivestreamList(query, res, req);
  }

  @Post("/create-comment")
  async create(
    @Req() req: ExpressRequestDto,
    @Res() res: Response,
    @Body() createLivestreamCommentDto: CreateLivestreamCommentWithMediaDto
  ) {
    try {
      return this.livestreamHelper.createNewComment(createLivestreamCommentDto, req, res);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get("/admin-list")
  async getAdminLivestream(@Query() query: ListLivestreamDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.livestreamHelper.getLivestreamListByAdmin(query, res, req);
  }

  @Post("/create")
  @Permissions(Permission(Controllers.LIVESTREAM).CREATE)
  async createNewLivestream(
    @Body() createLivestreamBody: CreateLivestreamDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.livestreamHelper.createNewLivestream(createLivestreamBody, res, req);
  }

  @Patch("/update")
  @Permissions(Permission(Controllers.LIVESTREAM).UPDATE)
  async updateLivestream(@Body() dataUpdate: UpdateLivestreamDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.livestreamHelper.updateLivestream(dataUpdate, res, req);
  }

  @Post("view")
  handleViewUser(@Body() dataView: CreateLivestreamViewDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.livestreamHelper.processViewUser(dataView, req, res);
  }

  @Post("like")
  handleFollowUser(@Body() dataFollow: CreateLivestreamLikeDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.livestreamHelper.processFollowUser(dataFollow, req, res);
  }

  @Post("un-like")
  handleUnFollowUser(@Body() dataFollow: CreateLivestreamLikeDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.livestreamHelper.processUnFollowUser(dataFollow, req, res);
  }

  @Patch("/update")
  @Permissions(Permission(Controllers.LIVESTREAM).UPDATE)
  async updateByAdmin(@Body() dataUpdate: UpdateLivestreamDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.livestreamHelper.handleUpdateLivestreamByAdmin(dataUpdate, res, req);
  }

  @Get("detail/:id")
  async getDetailLivestream(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.livestreamHelper.handleGetDetailLivestream(id, res, req);
  }

  @Delete("delete/:id")
  @Permissions(Permission(Controllers.LIVESTREAM).DELETE)
  async deleteLivestream(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.livestreamHelper.handleDeleteLivestream(id, res, req);
  }

  @Get("/list-comment/:id")
  async findAll(
    @Req() req: ExpressRequestDto,
    @Query() query: ListChatHistoryDto,
    @Res() res: Response,
    @Param("id") id: string
  ) {
    try {
      return this.livestreamHelper.getRoomDetail(req, res, query, id);
    } catch (error) {
      //this.logger.log("findAll Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }
}
