import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { ThreadGuard } from "../decorators/thread.decorator";
import { CreateThreadDTO, ListThreadDto, UpdateThreadDTO } from "../dtos/thread.dto";
import {
  CreateThreadCommentDTO,
  HandleGiveMarkDTO,
  ListThreadCommentDto,
  UpdateThreadCommentDTO,
  UploadCommentDTO,
} from "../dtos/thread_comment.dto";
import { ThreadHelper } from "../helpers/thread.helper";
import { ThreadCommentHelper } from "../helpers/thread_comment.helper";

@Controller("thread")
@UseGuards(ThreadGuard)
export class ThreadController {
  constructor(private readonly threadHelper: ThreadHelper, private readonly threadCommentHelper: ThreadCommentHelper) {}

  // thread apis
  @Get("list")
  async listThread(@Query() query: ListThreadDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.threadHelper.list(query, res, req);
  }

  @Post("create")
  async createNewThread(
    @Body() createThreadData: CreateThreadDTO,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.threadHelper.createThread(createThreadData, res, req);
  }

  @Patch("update")
  async updateThread(@Body() updateThreadData: UpdateThreadDTO, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.threadHelper.updateThread(updateThreadData, res, req);
  }

  @Delete("delete/:id")
  async removeThread(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.threadHelper.removeThread(id, res, req);
  }

  @Get("detail/:id")
  async handleGetDetailThread(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.threadHelper.handleGetDetailThread(id, res, req);
  }

  // thread comment
  @Get("comment/list")
  async listThreadComment(@Query() query: ListThreadCommentDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.threadCommentHelper.list(query, res, req);
  }

  @Post("comment/create")
  async createNewThreadComment(
    @Body() createThreadData: CreateThreadCommentDTO,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.threadCommentHelper.createThreadComment(createThreadData, res, req);
  }

  @Post("comment/upload")
  async uploadComment(@Body() createThreadData: UploadCommentDTO, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.threadCommentHelper.uploadComment(createThreadData, res, req);
  }

  @Patch("comment/update")
  async updateThreadComment(
    @Body() updateThreadData: UpdateThreadCommentDTO,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.threadCommentHelper.updateThreadComment(updateThreadData, res, req);
  }

  @Patch("comment/mark")
  async updateThreadCommentMark(
    @Body() updateThreadData: HandleGiveMarkDTO,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.threadCommentHelper.updateThreadCommentMark(updateThreadData, res, req);
  }

  @Delete("comment/delete/:id")
  async removeThreadComment(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.threadCommentHelper.removeThreadComment(id, res, req);
  }

  @Get("comment/detail/:id")
  async handleGetDetailThreadComment(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.threadCommentHelper.handleGetDetailThreadComment(id, res, req);
  }
}
