import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, Req } from "@nestjs/common";
import { QuestionHelper } from "../helper/question.helper";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateQuestionDto } from "../dto/create-question.dto";
import { ListQuestionDto } from "../dto/list-question.dto";
import { UpdateQuestionDto } from "../dto/update-question.dto";
import { AnswerHelper } from "../helper/answer.helper";
import { ListAnswerDto } from "../dto/list-answer.dto";
import { CreateAnswerDto } from "../dto/create-answer.dto";
import { UpdateAnswerDto } from "../dto/update-answer.dto";

@Controller("question")
export class QuestionController {
  constructor(private readonly topicHelper: QuestionHelper, private readonly postHelper: AnswerHelper) {}

  @Get("/list")
  async getUserQuestion(@Query() query: ListQuestionDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.topicHelper.getQuestionListByUser(query, res, req);
  }

  @Post("/create")
  async createNewQuestion(
    @Body() createQuestionBody: CreateQuestionDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.topicHelper.createNewQuestion(createQuestionBody, res, req);
  }

  @Patch("/admin-update")
  async updateByAdmin(@Body() dataUpdate: UpdateQuestionDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.topicHelper.handleUpdateQuestionByAdmin(dataUpdate, res, req);
  }

  @Get("detail/:id")
  async getDetailQuestion(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.topicHelper.handleGetDetailQuestion(id, res, req);
  }

  @Get("/answer-list")
  async getUserPost(@Query() query: ListAnswerDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.postHelper.getPostListByAdmin(query, res, req);
  }

  @Get("/answer-admin-list")
  async getAdminPost(@Query() query: ListAnswerDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.postHelper.getPostListByAdmin(query, res, req);
  }

  @Post("/answer-create")
  async createNewPost(@Body() createPostBody: CreateAnswerDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.postHelper.createNewPost(createPostBody, res, req);
  }

  @Patch("/answer-update")
  async updatePostByAdmin(@Body() dataUpdate: UpdateAnswerDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.postHelper.handleUpdatePostByAdmin(dataUpdate, res, req);
  }

  @Get("answer-detail/:id")
  async getDetailPost(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.postHelper.handleGetDetailPost(id, res, req);
  }

  @Delete("answer-delete/:id")
  async deletePost(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.postHelper.handleDeletePost(id, res, req);
  }

  @Delete("delete-question/:id")
  async removePlan(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.topicHelper.removeQuestion(id, res, req);
  }
}
