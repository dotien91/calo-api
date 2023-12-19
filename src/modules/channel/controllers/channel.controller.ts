import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, Req, NotFoundException } from "@nestjs/common";
import { ChannelHelper } from "../helper/channel.helper";
import { Response, query } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateChannelDto } from "../dto/create-channel.dto";
import { ListChannelDto } from "../dto/list-channel.dto";
import { UpdateChannelDto } from "../dto/update-channel.dto";
import { CreateChannelPermissionDto } from "../dto/create-channel_permission.dto";
import { CreateChannelLikeDto } from "../dto/create-channel_like.dto";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ListChannelLevelDto } from "../dto/list-channel_level.dto";
import { CreateChannelLevelDto } from "../dto/create-channel_level.dto";
import { UpdateChannelLevelDto } from "../dto/update-channel_level.dto";
import { ListChannelPermissionDto } from "../dto/list-channel_permission.dto";
import { CreateInviteEmail } from "../dto/create-invite_email.dto";
import { UpdateChannelPermissionDto } from "../dto/update-channel_permission.dto";
import { UpdateChannelMentorDto } from "../dto/update-channel_mentor.dto";
import { CreateChannelBannerDto } from "../dto/create-channel_banner.dto";
import { ListChannelBannerDto } from "../dto/list-channel_banner.dto";
import { ListChannelMeDto } from "../dto/list-channel-me.dto";
import { CreateChannelDomainDto } from "../dto/create-channel-domain.dto";
import { CheckChannelDomainDto } from "../dto/check-channel-domain.dto";
import { PlusPointChannelDto } from "../../../modules/challenge/dto/plus-point-channel.dto";

@Controller("channel")
@ApiTags("channel")
@ApiBearerAuth("ICEO")
export class ChannelController {
  constructor(private readonly channelHelper: ChannelHelper) {}

  @Get("/list")
  async getUserChannel(@Query() query: ListChannelDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.channelHelper.getChannelList(query, res, req);
  }

  @Get("/list-banner")
  async getChannelBannerList(
    @Query() query: ListChannelBannerDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.channelHelper.getListChannelBanner(query, res, req);
  }

  @Get("/admin-list")
  async getAdminChannel(@Query() query: ListChannelDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.channelHelper.getChannelListByAdmin(query, res, req);
  }

  @Post("/create")
  async createNewChannel(
    @Body() createChannelBody: CreateChannelDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.channelHelper.createNewChannel(createChannelBody, res, req);
  }

  @Post("/create-banner")
  async createNewChannelBanner(
    @Body() createChannelBody: CreateChannelBannerDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.channelHelper.createNewChannelBanner(createChannelBody, res, req);
  }

  @Patch("/update")
  async updateChannel(@Body() dataUpdate: UpdateChannelDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.channelHelper.updateChannel(dataUpdate, res, req);
  }

  @Patch("/update-mentor")
  async updateChannelMentor(
    @Body() dataUpdate: UpdateChannelMentorDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.channelHelper.updateMentor(dataUpdate, res, req);
  }

  @Post("create-permission")
  handleViewUser(@Body() dataView: CreateChannelPermissionDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.channelHelper.handleAddUserPermission(dataView, req, res);
  }

  @Post("like")
  handleFollowUser(@Body() dataFollow: CreateChannelLikeDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.channelHelper.processFollowUser(dataFollow, req, res);
  }

  @Get("list-like")
  handleGetListLike(@Query() query: ListChannelDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.channelHelper.handleGetListLike(query, res, req);
  }

  @Get("list-member")
  @ApiOperation({ summary: 'order_type is in "point_week", "point_month", "point", "time", "level_number"' })
  handleGetListView(@Query() query: ListChannelPermissionDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.channelHelper.handleGetListView(query, res, req);
  }

  @Post("un-like")
  handleUnFollowUser(@Body() dataFollow: CreateChannelLikeDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.channelHelper.processUnFollowUser(dataFollow, req, res);
  }

  @Patch("/update-admin")
  async updateByAdmin(@Body() dataUpdate: UpdateChannelDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.channelHelper.handleUpdateChannelByAdmin(dataUpdate, res, req);
  }

  @Get("detail/:id")
  async getDetailChannel(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.channelHelper.handleGetDetailChannel(id, res, req);
  }

  @Get("me")
  async getCurrentChannel(@Query() query: ListChannelMeDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    if (query?.from_url) {
      let channelDomain = await this.getDomainFromUrl(query?.from_url);
      return await this.channelHelper.handleGetDetailChannelByDomain(channelDomain, res, req);
    } else {
      let channelId = req?.channel_id;
      if (!channelId || channelId === "undefined") {
        let dataReferal = req.headers.referer;
        let dataChannel = null;
        if (dataReferal) {
          let data = new URL(dataReferal);
          let originUrl = data?.origin;
          let channelDomain = await this.getDomainFromUrl(originUrl);
          return await this.channelHelper.handleGetDetailChannelByDomain(channelDomain, res, req);
        } else {
          throw new NotFoundException("Channel is not found!");
        }
      }
      if (channelId) {
        return await this.channelHelper.handleGetDetailChannel(channelId, res, req);
      } else {
        throw new NotFoundException("Channel is not found!");
      }
    }
  }

  /**
   *
   * @param url
   * @returns
   */
  async getDomainFromUrl(url: string) {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol; // Lấy giao thức (http hoặc https)
    const hostname = parsedUrl.hostname; // Lấy tên miền
    return protocol + "//" + hostname;
  }

  @Delete("delete/:id")
  async deleteChannel(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.channelHelper.handleDeleteChannel(id, res, req);
  }

  @Get("/list-level")
  async getListModule(@Query() query: ListChannelLevelDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.channelHelper.getChannelLevelList(query, res, req);
  }

  @Post("/create-level")
  async createNewChannelLevel(
    @Body() createChannelBody: CreateChannelLevelDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.channelHelper.createNewChannelLevel(createChannelBody, res, req);
  }

  @Post("/join-permission")
  async createJoinLevel(
    @Body() createChannelBody: CreateChannelPermissionDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.channelHelper.createJoinPermission(createChannelBody, res, req);
  }

  @Post("/invite-email")
  async inviteViaEmail(@Body() inviteViaEmail: CreateInviteEmail, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.channelHelper.inviteViaEmail(inviteViaEmail, res, req);
  }

  @Patch("/update-level")
  async updateChannelLevel(
    @Body() dataUpdate: UpdateChannelLevelDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.channelHelper.updateChannelLevel(dataUpdate, res, req);
  }

  @Patch("/update-permission")
  async updateChannelPermission(
    @Body() dataUpdate: UpdateChannelPermissionDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.channelHelper.updateChannelPermission(dataUpdate, res, req);
  }

  @Get("detail-channel/:id")
  async getDetailChannelLevel(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.channelHelper.handleGetDetailChannelLevel(id, res, req);
  }

  @Delete("delete-permission/:id")
  async deleteChannelLevel(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.channelHelper.handleDeleteChannelPermission(id, res, req);
  }

  @Delete("delete-level/:id")
  async deleteLevel(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.channelHelper.handleDeleteChannelLevel(id, res, req);
  }

  @Post("check-create-domain/:id")
  async checkCreateDomain(
    @Param("id") id: string,
    @Body() query: CreateChannelDomainDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    query.channel_id = id;
    query.user_id = req?.user_object?._id.toString();
    return await this.channelHelper.updateDomain(query, res, req);
  }

  @Get("check-active-domain/:id")
  async checkActiveDomain(
    @Param("id") id: string,
    @Query() query: CheckChannelDomainDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    query.channel_id = id;
    query.user_id = req?.user_object?._id.toString();
    return await this.channelHelper.checkDomainActive(query, res, req);
  }

  @Patch("plus-point-user")
  async plusPointForUser(@Body() body: PlusPointChannelDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    body.channel_id = req?.channel_id;
    return await this.channelHelper.plusPointHandleForUser(body, res, req);
  }
}
