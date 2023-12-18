import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Query,
  Req,
  BadRequestException,
} from "@nestjs/common";
import { PostHelper } from "../helper/post.helper";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { PostCategoryHelper } from "../helper/post_category.helper";
import { CreateUserPromptDto } from "../dto/create-user_prompt.dto";
import { ListPostDto } from "../dto/list-post.dto";
import { PromptHistoryHelper } from "../helper/prompt_history.helper";
import { ListPromptHistoryDto } from "../dto/list-prompt_history.dto";
import { CreatePromptHistoryDto } from "../dto/create-prompt_history.dto";

@Controller("post-user")
export class PostUserController {
  constructor(
    private readonly postHelper: PostHelper,
    private readonly categoryHelper: PostCategoryHelper,
    private readonly promptHistoryHelper: PromptHistoryHelper
  ) { }

  @Post("/create-user-prompt")
  async createNewUserPrompt(
    @Body() createUserPrompt: CreateUserPromptDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.postHelper.createNewUserPrompt(createUserPrompt, res, req);
  }

  @Get("/list-user-prompt")
  async getUserPostPrompt(@Query() query: ListPostDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.postHelper.getPostUserList(query, res, req);
  }

  @Get("/history/list")
  async getPromptHistory(@Query() query: ListPromptHistoryDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.promptHistoryHelper.getPromptHistory(query, res, req);
  }

  @Post("/history/create")
  async create(
    @Req() req: ExpressRequestDto,
    @Res() res: Response,
    @Body() createChatHistoryDto: CreatePromptHistoryDto
  ) {
    try {
      return this.promptHistoryHelper.createNewPromptHistory(createChatHistoryDto, res, req);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get("/history-detail/:id")
  async findAll(
    @Req() req: ExpressRequestDto,
    @Res() res: Response,
    @Param("id") id: string
  ) {
    try {
      return this.promptHistoryHelper.getDetailPromptHistory(id, res, req);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
