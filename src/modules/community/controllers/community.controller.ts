import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateCommunityDto } from "../dto/create-community.dto";
import { CreateCommunityCategoryDto } from "../dto/create-community_category.dto";
import { CreateCommunityCommentDto } from "../dto/create-community_comment.dto";
import { CreateCommunityCommentLikeDto, CreateCommunityLikeDto } from "../dto/create-community_like.dto";
import { CreateCommunityPollDto } from "../dto/create-community_poll.dto";
import { FilterListVote } from "../dto/filter-list_vote.dto";
import { ListCommunityDto } from "../dto/list-community.dto";
import { ListCommunityCategoryDto } from "../dto/list-community_category.dto";
import { ListCommunityCommentDto } from "../dto/list-community_comment.dto";
import { ListCommunityLikeDto } from "../dto/list-community_like.dto";
import { UpdateCommunityDto } from "../dto/update-community.dto";
import { UpdateCommunityCategoryDto } from "../dto/update-community_category.dto";
import { UpdateCommunityCommentDto } from "../dto/update-community_comment.dto";
import { CommunityHelper } from "../helper/community.helper";

@Controller("community")
@ApiTags("homepage")
@ApiBearerAuth("ICEO")
export class CommunityController {
  constructor(private readonly communityHelper: CommunityHelper) {}

  /**
   * ######## FOR REQUEST ######
   */

  /**
   *
   * @param query
   * @param res
   * @param req
   * @returns
   */
  @Get("/list")
  @ApiOperation({ summary: 'order_type is in "time", "most_popular", "most_upvote", "trending"' })
  async getUserCommunity(@Query() query: ListCommunityDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.communityHelper.getListCommunity(query, res, req);
  }

  /**
   *
   * @param query
   * @param res
   * @param req
   * @returns
   */
  @Get("/list-like")
  @ApiOperation({ summary: 'order_type is in "time", "most_popular", "most_upvote", "trending"' })
  async getListLike(@Query() query: ListCommunityLikeDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.communityHelper.getListCommunityLike(query, res, req);
  }

  /**
   *
   * @param createCommunityBody
   * @param res
   * @param req
   * @returns
   */
  @Post("/create")
  async createNewCommunity(
    @Body() createCommunityBody: CreateCommunityDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.communityHelper.createNewCommunity(createCommunityBody, res, req);
  }

  /**
   *
   * @param dataUpdate
   * @param res
   * @param req
   * @returns
   */
  @Patch("/update")
  async updateByAdmin(@Body() dataUpdate: UpdateCommunityDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.communityHelper.handleUpdateCommunityByAdmin(dataUpdate, res, req);
  }

  /**
   *
   * @param id
   * @param res
   * @param req
   * @returns
   */
  @Delete("delete/:id")
  async deleteCommunity(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.communityHelper.handleDeleteCommunity(id, res, req);
  }

  /**
   *
   * @param id
   * @param res
   * @param req
   * @returns
   */
  @Get("detail/:id")
  async getDetailCommunity(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.communityHelper.handleGetDetailCommunity(id, res, req);
  }

  /**
   * ######## FOR COMMENT ######
   */

  /**
   *
   * @param query
   * @param res
   * @param req
   * @returns
   */
  @Get("/list-comment")
  async getListComment(@Query() query: ListCommunityCommentDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.communityHelper.getListCommunityComment(query, res, req);
  }

  /**
   *
   * @param dataUpdate
   * @param res
   * @param req
   * @returns
   */
  @Patch("/update-comment")
  async updateCommunityComment(
    @Body() dataUpdate: UpdateCommunityCommentDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.communityHelper.handleUpdateCommunityComment(dataUpdate, res, req);
  }

  /**
   *
   * @param createCommunityBody
   * @param res
   * @param req
   * @returns
   */
  @Post("/create-comment")
  async createNewComment(
    @Body() createCommunityBody: CreateCommunityCommentDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.communityHelper.createNewComment(createCommunityBody, res, req);
  }

  /**
   *
   * @param createCommunityBody
   * @param res
   * @param req
   * @returns
   */
  @Post("/create-like")
  async createLike(
    @Body() createCommunityBody: CreateCommunityLikeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.communityHelper.createLike(createCommunityBody, res, req);
  }

  /**
   *
   * @param createCommunityBody
   * @param res
   * @param req
   * @returns
   */
  @Post("/create-dislike")
  async createDislike(
    @Body() createCommunityBody: CreateCommunityLikeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.communityHelper.createDislike(createCommunityBody, res, req);
  }

  /**
   *
   * @param createCommunityBody
   * @param res
   * @param req
   * @returns
   */
  @Post("/create-like-comment")
  async createLikeComment(
    @Body() createCommunityBody: CreateCommunityCommentLikeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.communityHelper.createLikeComment(createCommunityBody, res, req);
  }

  /**
   *
   * @param createCommunityBody
   * @param res
   * @param req
   * @returns
   */
  @Post("/create-dislike-comment")
  async createDislikeComment(
    @Body() createCommunityBody: CreateCommunityCommentLikeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.communityHelper.createDislikeComment(createCommunityBody, res, req);
  }

  /**
   *
   * @param id
   * @param res
   * @param req
   * @returns
   */
  @Delete("delete-comment/:id")
  async deleteComment(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.communityHelper.handleDeleteComment(id, res, req);
  }

  /**
   *
   * @param id
   * @param res
   * @param req
   * @returns
   */
  @Get("detail-comment/:id")
  async handleGetDetailComment(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.communityHelper.handleGetDetailComment(id, res, req);
  }

  /**
   * ######## FOR CATEGORY ######
   */

  /**
   *
   * @param createCommunityBody
   * @param res
   * @param req
   * @returns
   */
  @Post("/create-category")
  async createCategory(
    @Body() createCommunityBody: CreateCommunityCategoryDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.communityHelper.createCategory(createCommunityBody, res, req);
  }

  /**
   *
   * @param query
   * @param res
   * @param req
   * @returns
   */
  @Get("/list-category")
  async getUserCategory(@Query() query: ListCommunityCategoryDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.communityHelper.getCommunityCategoryList(query, res, req);
  }

  /**
   *
   * @param dataUpdate
   * @param res
   * @param req
   * @returns
   */
  @Patch("/update-category")
  async updateCategory(
    @Body() dataUpdate: UpdateCommunityCategoryDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.communityHelper.handleUpdateCategory(dataUpdate, res, req);
  }

  /**
   *
   * @param id
   * @param res
   * @param req
   * @returns
   */
  @Get("detail-category/:id")
  async getDetailCategory(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.communityHelper.handleGetDetailCategory(id, res, req);
  }

  /**
   *
   * @param id
   * @param res
   * @param req
   * @returns
   */
  @Delete("delete-category/:id")
  async deleteCategory(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.communityHelper.handleDeleteCategory(id, res, req);
  }

  @Post("/create-poll")
  async createNewCommunityPool(
    @Body() createCommunityBody: CreateCommunityPollDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.communityHelper.createNewCommunityPoll(createCommunityBody, res, req);
  }

  @Post("vote-poll")
  async voteCommunityPool(
    @Body() createCommunityBody: CreateCommunityPollDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.communityHelper.voteCommunityPoll(createCommunityBody, res, req);
  }

  @Post("un-vote-poll")
  async unVoteCommunityPool(
    @Body() createCommunityBody: CreateCommunityPollDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.communityHelper.unVoteCommunityPoll(createCommunityBody, res, req);
  }

  @Get("list-vote")
  async handleGetListVote(@Query() query: FilterListVote, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.communityHelper.handleGetListVote(query, res, req);
  }
}
