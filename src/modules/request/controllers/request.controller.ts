import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, Req } from "@nestjs/common";
import { RequestHelper } from "../helper/request.helper";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateRequestDto } from "../dto/create-request.dto";
import { ListRequestDto } from "../dto/list-request.dto";
import { UpdateRequestDto } from "../dto/update-request.dto";
import { ListRequestCommentDto } from "../dto/list-request_comment.dto";
import { CreateRequestCommentDto } from "../dto/create-request_comment.dto";
import { UpdateRequestCommentDto } from "../dto/update-request_comment.dto";
import { CreateRequestCategoryDto } from "../dto/create-request_category.dto";
import { ListRequestCategoryDto } from "../dto/list-request_category.dto";
import { UpdateRequestCategoryDto } from "../dto/update-request_category.dto";
import { CreateRequestLikeDto } from "../dto/create-request_like.dto";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateRequestPollDto } from "../dto/create-request_poll.dto";
import { FilterListVote } from "../dto/filter-list_vote.dto";
import { ListRequestLikeDto } from "../dto/list-request_like.dto";

@Controller("request")
@ApiTags("homepage")
@ApiBearerAuth("ICEO")
export class RequestController {
  constructor(private readonly requestHelper: RequestHelper) {}

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
  async getUserRequest(@Query() query: ListRequestDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.requestHelper.getListRequest(query, res, req);
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
  async getListLike(@Query() query: ListRequestLikeDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.requestHelper.getListRequestLike(query, res, req);
  }

  /**
   *
   * @param createRequestBody
   * @param res
   * @param req
   * @returns
   */
  @Post("/create")
  async createNewRequest(
    @Body() createRequestBody: CreateRequestDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.requestHelper.createNewRequest(createRequestBody, res, req);
  }

  /**
   *
   * @param dataUpdate
   * @param res
   * @param req
   * @returns
   */
  @Patch("/update")
  async updateByAdmin(@Body() dataUpdate: UpdateRequestDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.requestHelper.handleUpdateRequestByAdmin(dataUpdate, res, req);
  }

  /**
   *
   * @param id
   * @param res
   * @param req
   * @returns
   */
  @Delete("delete/:id")
  async deleteRequest(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.requestHelper.handleDeleteRequest(id, res, req);
  }

  /**
   *
   * @param id
   * @param res
   * @param req
   * @returns
   */
  @Get("detail/:id")
  async getDetailRequest(
    @Query() query: ListRequestDto,
    @Param("id") id: string,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.requestHelper.handleGetDetailRequest(id, query, res, req);
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
  async getListComment(@Query() query: ListRequestCommentDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.requestHelper.getListRequestComment(query, res, req);
  }

  /**
   *
   * @param dataUpdate
   * @param res
   * @param req
   * @returns
   */
  @Patch("/update-comment")
  async updateRequestComment(
    @Body() dataUpdate: UpdateRequestCommentDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.requestHelper.handleUpdateRequestComment(dataUpdate, res, req);
  }

  /**
   *
   * @param createRequestBody
   * @param res
   * @param req
   * @returns
   */
  @Post("/create-comment")
  async createNewComment(
    @Body() createRequestBody: CreateRequestCommentDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.requestHelper.createNewComment(createRequestBody, res, req);
  }

  /**
   *
   * @param createRequestBody
   * @param res
   * @param req
   * @returns
   */
  @Post("/create-like")
  async createLike(
    @Body() createRequestBody: CreateRequestLikeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.requestHelper.createLike(createRequestBody, res, req);
  }

  /**
   *
   * @param createRequestBody
   * @param res
   * @param req
   * @returns
   */
  @Post("/create-dislike")
  async createDislike(
    @Body() createRequestBody: CreateRequestLikeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.requestHelper.createDislike(createRequestBody, res, req);
  }

  /**
   *
   * @param createRequestBody
   * @param res
   * @param req
   * @returns
   */
  @Post("/create-like-comment")
  async createLikeComment(
    @Body() createRequestBody: CreateRequestLikeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.requestHelper.createLikeComment(createRequestBody, res, req);
  }

  /**
   *
   * @param createRequestBody
   * @param res
   * @param req
   * @returns
   */
  @Post("/create-dislike-comment")
  async createDislikeComment(
    @Body() createRequestBody: CreateRequestLikeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.requestHelper.createDislikeComment(createRequestBody, res, req);
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
    return await this.requestHelper.handleDeleteComment(id, res, req);
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
    return await this.requestHelper.handleGetDetailComment(id, res, req);
  }

  /**
   * ######## FOR CATEGORY ######
   */

  /**
   *
   * @param createRequestBody
   * @param res
   * @param req
   * @returns
   */
  @Post("/create-category")
  async createCategory(
    @Body() createRequestBody: CreateRequestCategoryDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.requestHelper.createCategory(createRequestBody, res, req);
  }

  /**
   *
   * @param query
   * @param res
   * @param req
   * @returns
   */
  @Get("/list-category")
  async getUserCategory(@Query() query: ListRequestCategoryDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.requestHelper.getRequestCategoryList(query, res, req);
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
    @Body() dataUpdate: UpdateRequestCategoryDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.requestHelper.handleUpdateCategory(dataUpdate, res, req);
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
    return await this.requestHelper.handleGetDetailCategory(id, res, req);
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
    return await this.requestHelper.handleDeleteCategory(id, res, req);
  }

  @Post("/create-poll")
  async createNewRequestPool(
    @Body() createRequestBody: CreateRequestPollDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.requestHelper.createNewRequestPoll(createRequestBody, res, req);
  }

  @Post("vote-poll")
  async voteRequestPool(
    @Body() createRequestBody: CreateRequestPollDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.requestHelper.voteRequestPoll(createRequestBody, res, req);
  }

  @Post("un-vote-poll")
  async unVoteRequestPool(
    @Body() createRequestBody: CreateRequestPollDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.requestHelper.unVoteRequestPoll(createRequestBody, res, req);
  }

  @Get("list-vote")
  async handleGetListVote(@Query() query: FilterListVote, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.requestHelper.handleGetListVote(query, res, req);
  }

  @Get("share/:id")
  async plusPointShareAction(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.requestHelper.plusPointNNotiShareAction(id, res, req);
  }
}
