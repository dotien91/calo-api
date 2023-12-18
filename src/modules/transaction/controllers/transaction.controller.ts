import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, Req } from "@nestjs/common";
import { TransactionHelper } from "../helper/transaction.helper";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateTransactionDto } from "../dto/create-transaction.dto";
import { ListTransactionDto } from "../dto/list-transaction.dto";
import { UpdateTransactionDto } from "../dto/update-transactions.dto";
import { CreateWithdrawalDto } from "../dto/create-withdrawal.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CreateTransactionBankDto } from "../dto/create-transaction_bank.dto";
import { ListTransactionBankDto } from "../dto/list-transaction_bank.dto";
import { UpdateTransactionBankDto } from "../dto/update-transactions_bank.dto";
import { ListUserIncomeDto } from "../dto/list-user-income.dto";

@Controller("transaction")
@ApiTags('transaction')
@ApiBearerAuth('ICEO')
export class TransactionController {
  constructor(private readonly transactionHelper: TransactionHelper) {
  }

  @Get("/user-list")
  async getUserTransaction(
    @Query() query: ListTransactionDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.transactionHelper.getTransactionListByUser(query, res, req);
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
  async getAdminTransaction(
    @Query() query: ListTransactionDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.transactionHelper.getTransactionListByAdmin(query, res, req);
  }

  @Get("/user-income")
  async getUserIncome(
    @Query() query: ListUserIncomeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.transactionHelper.getUserIncome(query, res, req);
  }

  @Post("/create")
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
  async deleteChallengeGame(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
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
  async updateByAdmin(
    @Body() dataUpdate: UpdateTransactionDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.transactionHelper.handleUpdateTransactionByAdmin(dataUpdate, res, req);
  }

  @Get("detail-transaction/:id")
  async getDetailTransaction(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.transactionHelper.handleGetDetailTransaction(id, res, req);
  }
}
