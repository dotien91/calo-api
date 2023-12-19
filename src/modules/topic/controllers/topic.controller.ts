import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, Req } from "@nestjs/common";
import { TopicHelper } from "../helper/topic.helper";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateTopicDto } from "../dto/create-topic.dto";
import { ListTopicDto } from "../dto/list-topic.dto";
import { UpdateTopicDto } from "../dto/update-topic.dto";
import { TopicPostHelper } from "../helper/topic_post.helper";
import { ListTopicPostDto } from "../dto/list-topic_post.dto";
import { CreateTopicPostDto } from "../dto/create-topic_post.dto";
import { UpdateTopicPostDto } from "../dto/update-topic_post.dto";
import { ListTopicJoinDto } from "../dto/list-topic_join.dto";

@Controller("topic")
export class TopicController {
  constructor(private readonly topicHelper: TopicHelper, private readonly postHelper: TopicPostHelper) {}

  @Get("/list")
  async getUserTopic(@Query() query: ListTopicDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.topicHelper.getTopicListByUser(query, res, req);
  }

  @Post("/create")
  async createNewTopic(@Body() createTopicBody: CreateTopicDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.topicHelper.createNewTopic(createTopicBody, res, req);
  }

  @Post("/admin-update")
  async updateByAdmin(@Body() dataUpdate: UpdateTopicDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.topicHelper.handleUpdateTopicByAdmin(dataUpdate, res, req);
  }

  @Get("detail/:id")
  async getDetailTopic(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.topicHelper.handleGetDetailTopic(id, res, req);
  }

  @Get("/post-list")
  async getUserPost(@Query() query: ListTopicPostDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.postHelper.getPostListByAdmin(query, res, req);
  }

  @Get("/join-list")
  async getJoinList(@Query() query: ListTopicJoinDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.topicHelper.getJoinList(query, res, req);
  }

  @Get("/post-admin-list")
  async getAdminPost(@Query() query: ListTopicPostDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.postHelper.getPostListByAdmin(query, res, req);
  }

  @Post("/post-create")
  async createNewPost(@Body() createPostBody: CreateTopicPostDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.postHelper.createNewPost(createPostBody, res, req);
  }

  @Patch("/post-update")
  async updatePostByAdmin(@Body() dataUpdate: UpdateTopicPostDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.postHelper.handleUpdatePostByAdmin(dataUpdate, res, req);
  }

  @Get("post-detail/:id")
  async getDetailPost(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.postHelper.handleGetDetailPost(id, res, req);
  }

  @Delete("post-delete/:id")
  async deletePost(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.postHelper.handleDeletePost(id, res, req);
  }

  @Delete("delete/:id")
  async deleteTopic(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.topicHelper.handleDeleteTopic(id, res, req);
  }
}
