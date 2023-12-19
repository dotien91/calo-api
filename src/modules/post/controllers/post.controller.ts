import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, Req, UseGuards } from "@nestjs/common";
import { PostHelper } from "../helper/post.helper";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreatePostDto } from "../dto/create-post.dto";
import { ListPostDto } from "../dto/list-post.dto";
import { UpdatePostDto } from "../dto/update-post.dto";
import { PostCategoryHelper } from "../helper/post_category.helper";
import { ListCategoryDto } from "../dto/list-category.dto";
import { CreateCategoryDto } from "../dto/create-category.dto";
import { UpdateCategoryDto } from "../dto/update-category.dto";
import { CreatePostCrawlDto } from "../dto/create-post_crawl.dto";
import { CreatePostPromptDto } from "../dto/create-post_prompt.dto";
import { UpdatePostPromptDto } from "../dto/update-post_prompt.dto";
import { CreateImportPromptDto } from "../dto/create-import_prompt.dto";
import { Controllers } from "../../../modules/index.i";
import { Permission } from "../../../decorators/auth.decorator";

@Controller(Controllers.POST)
@Permission()
export class PostController {
  constructor(private readonly postHelper: PostHelper, private readonly categoryHelper: PostCategoryHelper) {
    setTimeout(async () => {
      //await this.handleCrawl();
      //await this.updateCategory();
      //await this.updateDownload();
      //await this.updateCrawl();
      //await this.updateImage();
    }, 1000);
  }

  async handleCrawl() {
    await this.postHelper.updateCrawlData();
  }

  async updateCrawl() {
    await this.postHelper.updateCrawlFirst();
  }

  async updateCategory() {
    await this.postHelper.updateCategory();
  }

  async updateDownload() {
    await this.postHelper.updateDownload();
  }
  async updateImage() {
    await this.postHelper.updateImage();
  }

  @Get("/list")
  async getUserPost(@Query() query: ListPostDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.postHelper.getPostListByAdmin(query, res, req);
  }

  @Get("/list-prompt")
  async getUserPostPrompt(@Query() query: ListPostDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.postHelper.getPostListPrompt(query, res, req);
  }

  @Get("/admin-list")
  async getAdminPost(@Query() query: ListPostDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.postHelper.getPostListByAdmin(query, res, req);
  }

  @Post("/create")
  async createNewPost(@Body() createPostBody: CreatePostDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.postHelper.createNewPost(createPostBody, res, req);
  }

  @Post("/create-prompt")
  async createNewPostPrompt(
    @Body() createPostBody: CreatePostPromptDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.postHelper.createNewPostPrompt(createPostBody, res, req);
  }

  @Post("/import-prompt")
  async importPrompt(@Body() dataImport: CreateImportPromptDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.postHelper.importPrompt(dataImport, res, req);
  }

  @Post("/create-crawl")
  async createNewCrawlPost(
    @Body() createPostBody: CreatePostCrawlDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.postHelper.createNewCrawlPost(createPostBody, res, req);
  }

  @Patch("/update")
  async updateByAdmin(@Body() dataUpdate: UpdatePostDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.postHelper.handleUpdatePostByAdmin(dataUpdate, res, req);
  }

  @Patch("/update-prompt")
  async updatePromptByAdmin(
    @Body() dataUpdate: UpdatePostPromptDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.postHelper.handleUpdatePostPromptByAdmin(dataUpdate, res, req);
  }

  @Get("detail/:id")
  async getDetailPost(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.postHelper.handleGetDetailPost(id, res, req);
  }

  @Get("detail-prompt/:id")
  async getDetailPostPrompt(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.postHelper.handleGetDetailPostPrompt(id, res, req);
  }

  @Delete("delete/:id")
  async deletePost(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.postHelper.handleDeletePost(id, res, req);
  }

  @Delete("delete-prompt/:id")
  async deletePostPrompt(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.postHelper.handleDeletePostPrompt(id, res, req);
  }

  @Get("/list-category")
  async getUserCategory(@Query() query: ListCategoryDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.categoryHelper.getCategoryListByUser(query, res, req);
  }

  @Get("/update-crawl-data")
  async updateCrawlData(@Query() query: ListCategoryDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.postHelper.updateCrawlData();
  }

  @Get("/admin-list-category")
  async getAdminCategory(@Query() query: ListCategoryDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.categoryHelper.getCategoryListByAdmin(query, res, req);
  }

  @Post("/create-category")
  async createNewCategory(
    @Body() createPostBody: CreateCategoryDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.categoryHelper.createNewCategory(createPostBody, res, req);
  }

  @Patch("/update-category")
  async updateByAdminCategory(
    @Body() dataUpdate: UpdateCategoryDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.categoryHelper.handleUpdateCategoryByAdmin(dataUpdate, res, req);
  }

  @Get("detail-category/:id")
  async getDetailCategory(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.categoryHelper.handleGetDetailCategory(id, res, req);
  }

  @Delete("delete-category/:id")
  async deleteCategory(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.categoryHelper.handleDeleteCategory(id, res, req);
  }
}
