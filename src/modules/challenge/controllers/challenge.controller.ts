import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, Req } from "@nestjs/common";
import { ChallengeHelper } from "../helper/challenge.helper";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateChallengeDto } from "../dto/create-challenge.dto";
import { ListChallengeDto } from "../dto/list-challenge.dto";
import { UpdateChallengeDto } from "../dto/update-challenge.dto";
import { CreateChallengeViewDto } from "../dto/create-challenge_view.dto";
import { CreateChallengePermissionDto } from "../dto/create-challenge_permission.dto";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ListChallengeGameDto } from "../dto/list-challenge_game.dto";
import { CreateChallengeGameDto } from "../dto/create-challenge_game.dto";
import { UpdateChallengeGameDto } from "../dto/update-challenge_game.dto";
import { CreateChallengeJoinPermissionDto } from "../dto/create-challenge_join_permission.dto";
import { DeleteChallengePermissionDto } from "../dto/delete-challenge_permission.dto";
import { ListChannelPermissionDto } from "../../../modules/channel/dto/list-channel_permission.dto";
import { ListChallengePermissionDto } from "../dto/list-challenge_permission.dto";
import { CreateChallengeNotificationDto } from "../dto/create-challenge_notification.dto";
import { ListChallengeNotificationDto } from "../dto/list-challenge_notification.dto";
import { CreateChallengeActivityDto } from "../dto/create-challenge_activity.dto";
import { UpdateChallengeActivityDto } from "../dto/update-challenge_activity.dto";
import { ListChallengeActivityDto } from "../dto/list-challenge_activity.dto";
import { UpdateChallengePermissionDto } from "../dto/update-challenge_permission.dto";

@Controller("challenge")
@ApiTags("challenge")
@ApiBearerAuth("ICEO")
export class ChallengeController {
  constructor(private readonly challengeHelper: ChallengeHelper) { }

  @Get("/list")
  async getUserChallenge(@Query() query: ListChallengeDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.challengeHelper.getChallengeList(query, res, req);
  }

  @Get("/admin-list")
  async getAdminChallenge(@Query() query: ListChallengeDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.challengeHelper.getChallengeListByAdmin(query, res, req);
  }

  @Post("/create")
  async createNewChallenge(
    @Body() createChallengeBody: CreateChallengeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.challengeHelper.createNewChallenge(createChallengeBody, res, req);
  }

  @Patch("/update")
  async updateChallenge(@Body() dataUpdate: UpdateChallengeDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.challengeHelper.updateChallenge(dataUpdate, res, req);
  }

  @Post("view")
  handleViewUser(@Body() dataView: CreateChallengeViewDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.challengeHelper.processViewChallenge(dataView, req, res);
  }

  @Post("create-permission")
  handleCreatePermission(
    @Body() dataFollow: CreateChallengePermissionDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return this.challengeHelper.processCreatePermission(dataFollow, req, res);
  }

  @Patch("/update-permission")
  async updatePermission(
    @Body() dataUpdate: UpdateChallengePermissionDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.challengeHelper.updateChallengePermission(dataUpdate, res, req);
  }

  @Post("join-permission")
  handleJoinPermission(
    @Body() dataFollow: CreateChallengeJoinPermissionDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return this.challengeHelper.processCreateJoinPermission(dataFollow, req, res);
  }

  @Get("list-permission")
  handleGetListLike(@Query() query: ListChallengePermissionDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.challengeHelper.handleGetListLike(query, res, req);
  }

  @Get("my-permission")
  handleGetMyPermission(@Query() query: ListChallengePermissionDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.challengeHelper.handleGetMyPermission(query, res, req);
  }

  @Delete("delete-permission")
  handleUnFollowUser(
    @Body() dataFollow: DeleteChallengePermissionDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return this.challengeHelper.processRemoveChallengePermission(dataFollow, req, res);
  }
  //Update permission

  @Get("list-view")
  handleGetListView(@Query() query: ListChallengeDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.challengeHelper.handleGetListView(query, res, req);
  }

  @Patch("/update")
  async updateByAdmin(@Body() dataUpdate: UpdateChallengeDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.challengeHelper.handleUpdateChallengeByAdmin(dataUpdate, res, req);
  }

  @Get("detail/:id")
  async getDetailChallenge(
    @Query() query: ListChallengeDto,
    @Param("id") id: string,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.challengeHelper.handleGetDetailChallenge(query, id, res, req);
  }

  @Delete("delete/:id")
  async deleteChallenge(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.challengeHelper.handleDeleteChallenge(id, res, req);
  }

  @Get("/list-game")
  async getListGame(@Query() query: ListChallengeGameDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.challengeHelper.getChallengeGameList(query, res, req);
  }

  @Get("/list-activity")
  async getListActivity(@Query() query: ListChallengeActivityDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.challengeHelper.getChallengeActivityList(query, res, req);
  }

  @Post("/create-game")
  @ApiOperation({
    summary:
      "Variable: custome_field & game_activity is JSON.stringify(data). Data of custom_field: name: String; field_type: string; default_value: Number; max_value: String; min_value: String. Data of game_activity is: ame: String; description: string; point_tracking: Number; module_tracking: String;. custom_field and and game_activity is Array of Object",
  })
  async createNewChallengeGame(
    @Body() createChallengeBody: CreateChallengeGameDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.challengeHelper.createNewChallengeGame(createChallengeBody, res, req);
  }

  @Patch("/update-game")
  async updateChallengeGame(
    @Body() dataUpdate: UpdateChallengeGameDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.challengeHelper.updateChallengeGame(dataUpdate, res, req);
  }

  @Post("/create-activity")
  async createNewChallengeActivity(
    @Body() createChallengeBody: CreateChallengeActivityDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.challengeHelper.createNewChallengeActivity(createChallengeBody, res, req);
  }

  @Patch("/update-activity")
  async updateChallengeActivity(
    @Body() dataUpdate: UpdateChallengeActivityDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.challengeHelper.updateChallengeActivity(dataUpdate, res, req);
  }

  @Patch("/admin-update-activity")
  async adminUpdateChallengeActivity(
    @Body() dataUpdate: UpdateChallengeActivityDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.challengeHelper.updateChallengeActivity(dataUpdate, res, req);
  }

  @Get("detail-game/:id")
  async getDetailChallengeGame(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.challengeHelper.handleGetDetailChallengeGame(id, res, req);
  }

  @Delete("delete-game/:id")
  async deleteChallengeGame(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.challengeHelper.handleDeleteChallengeGame(id, res, req);
  }

  @Post("/create-notification")
  async createNewNotification(
    @Body() createChallengeBody: CreateChallengeNotificationDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.challengeHelper.createChallengeNotification(createChallengeBody, res, req);
  }

  @Get("/list-notification")
  async getListnotification(
    @Query() query: ListChallengeNotificationDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.challengeHelper.getListNotification(query, res, req);
  }
}
