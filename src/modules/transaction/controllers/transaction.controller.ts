import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { Permissions } from "../../../decorators/auth.decorator";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { UserRoles } from "../../../modules/user/interfaces/user.interface";
import { CreateTransactionDto } from "../dto/create-transaction.dto";
import { CreateTransactionBankDto } from "../dto/create-transaction_bank.dto";
import { CreateWithdrawalDto } from "../dto/create-withdrawal.dto";
import { ListTransactionDto } from "../dto/list-transaction.dto";
import { ListTransactionBankDto } from "../dto/list-transaction_bank.dto";
import { ListUserIncomeDto } from "../dto/list-user-income.dto";
import { UpdateTransactionDto } from "../dto/update-transactions.dto";
import { UpdateTransactionBankDto } from "../dto/update-transactions_bank.dto";
import { TransactionHelper } from "../helper/transaction.helper";

@Controller("transaction")
@ApiTags("transaction")
@ApiBearerAuth("ICEO")
export class TransactionController {
  constructor(private readonly transactionHelper: TransactionHelper) {}

  @Get("/user-list")
  async getUserTransaction(@Query() query: ListTransactionDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.transactionHelper.getTransactionListByUser(query, res, req);
  }

  @Get("/filter")
  async getFilterByUser(@Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.transactionHelper.getFilterByUser(res, req);
  }

  @Get("/list-bank")
  async getListTransactionBank(
    @Query() query: ListTransactionBankDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.transactionHelper.getListTransactionBank(query, res, req);
  }

  @Get("/admin-list")
  @Permissions(UserRoles.ADMIN)
  async getAdminTransaction(@Query() query: ListTransactionDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.transactionHelper.getTransactionListByAdmin(query, res, req);
  }

  @Get("/user-income")
  async getUserIncome(@Query() query: ListUserIncomeDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.transactionHelper.getUserIncome(query, res, req);
  }

  @Post("/create")
  @Permissions(UserRoles.ADMIN)
  async createNewTransaction(
    @Body() createTransactionBody: CreateTransactionDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.transactionHelper.createNewTransaction(createTransactionBody, res, req);
  }

  @Patch("/update-bank")
  async updateBankTransaction(
    @Body() createTransactionBody: UpdateTransactionBankDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.transactionHelper.updateTransactionBank(createTransactionBody, res, req);
  }

  @Post("/create-bank")
  async createNewTransactionBank(
    @Body() createTransactionBody: CreateTransactionBankDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.transactionHelper.createNewTransactionBank(createTransactionBody, res, req);
  }

  @Delete("delete-bank/:id")
  async deleteTransactionBank(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.transactionHelper.handleDeleteTransactionBank(id, res, req);
  }

  @Post("/withdrawal")
  async createWithdrawal(
    @Body() createTransactionBody: CreateWithdrawalDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.transactionHelper.createWithdrawal(createTransactionBody, res, req);
  }

  @Patch("/admin-update")
  @Permissions(UserRoles.ADMIN)
  async updateByAdmin(@Body() dataUpdate: UpdateTransactionDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.transactionHelper.handleUpdateTransactionByAdmin(dataUpdate, res, req);
  }

  @Get("/admin-update")
  async updateByAdminTelegram(
    @Query() dataUpdate: UpdateTransactionDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.transactionHelper.handleUpdateTransactionByAdminTelegram(dataUpdate, res, req);
  }

  @Get("detail-transaction/:id")
  async getDetailTransaction(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.transactionHelper.handleGetDetailTransaction(id, res, req);
  }
}
