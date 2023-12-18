import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, Req } from "@nestjs/common";
import { TicketHelper } from "../helper/ticket.helper";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateTicketDto } from "../dto/create-ticket.dto";
import { ListTicketDto } from "../dto/list-ticket.dto";
import { UpdateTicketDto } from "../dto/update-ticket.dto";
import { ListTicketCommentDto } from "../dto/list-ticket_comment.dto";
import { CreateTicketCommentDto } from "../dto/create-ticket_comment.dto";
import { UpdateTicketCommentDto } from "../dto/update-ticket_comment.dto";
import { CreateTicketCategoryDto } from "../dto/create-ticket_category.dto";
import { ListTicketCategoryDto } from "../dto/list-ticket_category.dto";
import { UpdateTicketCategoryDto } from "../dto/update-ticket_category.dto";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

@Controller("ticket")
@ApiTags('ticket')
@ApiBearerAuth('ICEO')
export class TicketController {
  constructor(
    private readonly ticketHelper: TicketHelper
  ) { }

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
  async getUserTicket(@Query() query: ListTicketDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.ticketHelper.getListTicket(query, res, req);
  }

  /**
   *
   * @param createTicketBody
   * @param res
   * @param req
   * @returns
   */
  @Post("/create")
  async createNewTicket(@Body() createTicketBody: CreateTicketDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.ticketHelper.createNewTicket(createTicketBody, res, req);
  }

  /**
   *
   * @param dataUpdate
   * @param res
   * @param req
   * @returns
   */
  @Patch("/update")
  async updateByAdmin(@Body() dataUpdate: UpdateTicketDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.ticketHelper.handleUpdateTicketByAdmin(dataUpdate, res, req);
  }

  /**
   *
   * @param id
   * @param res
   * @param req
   * @returns
   */
  @Delete("delete/:id")
  async deleteTicket(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.ticketHelper.handleDeleteTicket(id, res, req);
  }

  /**
  *
  * @param id
  * @param res
  * @param req
  * @returns
  */
  @Get("detail/:id")
  async getDetailTicket(@Query() query: ListTicketDto, @Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.ticketHelper.handleGetDetailTicket(id, query, res, req);
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
  async getListComment(@Query() query: ListTicketCommentDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.ticketHelper.getListTicketComment(query, res, req);
  }

  /**
   *
   * @param dataUpdate
   * @param res
   * @param req
   * @returns
   */
  @Patch("/update-comment")
  async updateTicketComment(@Body() dataUpdate: UpdateTicketCommentDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.ticketHelper.handleUpdateTicketComment(dataUpdate, res, req);
  }

  /**
   *
   * @param createTicketBody
   * @param res
   * @param req
   * @returns
   */
  @Post("/create-comment")
  async createNewComment(
    @Body() createTicketBody: CreateTicketCommentDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.ticketHelper.createNewComment(createTicketBody, res, req);
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
    return await this.ticketHelper.handleDeleteComment(id, res, req);
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
    return await this.ticketHelper.handleGetDetailComment(id, res, req);
  }


  /**
  * ######## FOR CATEGORY ######
  */

  /**
   *
   * @param createTicketBody
   * @param res
   * @param req
   * @returns
   */
  @Post("/create-category")
  async createCategory(
    @Body() createTicketBody: CreateTicketCategoryDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.ticketHelper.createCategory(createTicketBody, res, req);
  }

  /**
   *
   * @param query
   * @param res
   * @param req
   * @returns
   */
  @Get("/list-category")
  async getUserCategory(@Query() query: ListTicketCategoryDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.ticketHelper.getTicketCategoryList(query, res, req);
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
    @Body() dataUpdate: UpdateTicketCategoryDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.ticketHelper.handleUpdateCategory(dataUpdate, res, req);
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
    return await this.ticketHelper.handleGetDetailCategory(id, res, req);
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
    return await this.ticketHelper.handleDeleteCategory(id, res, req);
  }
}
