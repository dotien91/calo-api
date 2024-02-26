import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreatePodcastDto } from "../dto/create-podcast.dto";
import { CreatePodcastCategoryDto } from "../dto/create-podcast_category.dto";
import { ListPodcastDto } from "../dto/list-podcast.dto";
import { ListPodcastCategoryDto } from "../dto/list-podcast_category.dto";
import { UpdatePodcastDto } from "../dto/update-podcast.dto";
import { UpdatePodcastCategoryDto } from "../dto/update-podcast_category.dto";
import { PodcastHelper } from "../helper/podcast.helper";

@Controller("podcast")
@ApiTags("podcast")
@ApiBearerAuth("ICEO")
export class PodcastController {
  constructor(private readonly podcastHelper: PodcastHelper) {}

  /**
   *
   * @param query
   * @param res
   * @param req
   * @returns
   */
  @Get("/list")
  async getUserPodcast(@Query() query: ListPodcastDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.podcastHelper.getListPodcast(query, res, req);
  }

  /**
   *
   * @param createPodcastBody
   * @param res
   * @param req
   * @returns
   */
  @Post("/create")
  async createNewPodcast(
    @Body() createPodcastBody: CreatePodcastDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.podcastHelper.createNewPodcast(createPodcastBody, res, req);
  }

  /**
   *
   * @param dataUpdate
   * @param res
   * @param req
   * @returns
   */
  @Patch("/update")
  async updateByAdmin(@Body() dataUpdate: UpdatePodcastDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.podcastHelper.handleUpdatePodcastByAdmin(dataUpdate, res, req);
  }

  /**
   *
   * @param id
   * @param res
   * @param req
   * @returns
   */
  @Delete("delete/:id")
  async deletePodcast(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.podcastHelper.handleDeletePodcast(id, res, req);
  }

  /**
   *
   * @param id
   * @param res
   * @param req
   * @returns
   */
  @Get("detail/:id")
  async getDetailPodcast(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.podcastHelper.handleGetDetailPodcast(id, res, req);
  }
  /**
   * ######## FOR CATEGORY ######
   */

  /**
   *
   * @param createPodcastBody
   * @param res
   * @param req
   * @returns
   */
  @Post("/create-category")
  async createCategory(
    @Body() createPodcastBody: CreatePodcastCategoryDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.podcastHelper.createCategory(createPodcastBody, res, req);
  }

  /**
   *
   * @param query
   * @param res
   * @param req
   * @returns
   */
  @Get("/list-category")
  async getUserCategory(@Query() query: ListPodcastCategoryDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.podcastHelper.getPodcastCategoryList(query, res, req);
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
    @Body() dataUpdate: UpdatePodcastCategoryDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.podcastHelper.handleUpdateCategory(dataUpdate, res, req);
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
    return await this.podcastHelper.handleGetDetailCategory(id, res, req);
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
    return await this.podcastHelper.handleDeleteCategory(id, res, req);
  }
}
