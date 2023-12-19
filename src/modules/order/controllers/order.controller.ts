import { Body, Controller, Get, Param, Post, Query, Req, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateOrderDto } from "../dto/create-order.dto";
import { ListOrderDto } from "../dto/list-order.dto";
import { ListPaymentMethodDto } from "../dto/list-payment_method.dto";
import { UpdateOrderDto } from "../dto/update-order.dto";
import { UpdateOrderUserDto } from "../dto/update-order_user.dto";
import { OrderHelper } from "../helper/order.helper";

@Controller("order")
@ApiTags("order")
@ApiBearerAuth("ICEO")
export class OrderController {
  constructor(private readonly orderHelper: OrderHelper) {}

  @Get("/user-list")
  async getUserOrder(@Query() query: ListOrderDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.orderHelper.getOrderListByUser(query, res, req);
  }

  @Get("/admin-list")
  async getAdminOrder(@Query() query: ListOrderDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.orderHelper.getOrderListByAdmin(query, res, req);
  }

  @Get("/list-payment-method")
  async getListPaymentMethod(
    @Query() query: ListPaymentMethodDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.orderHelper.getListPaymentMethod(query, res, req);
  }

  @Post("/create")
  async createNewOrder(@Body() createOrderBody: CreateOrderDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.orderHelper.createNewOrder(createOrderBody, res, req);
  }

  @Post("/admin-update")
  async updateByAdmin(@Body() dataUpdate: UpdateOrderDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.orderHelper.handleUpdateOrderByAdmin(dataUpdate, res, req);
  }

  @Post("/user-update")
  async updateByUser(@Body() dataUpdate: UpdateOrderUserDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.orderHelper.handleUpdateOrderByUser(dataUpdate, res, req);
  }

  @Get("detail-order/:id")
  async getDetailOrder(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.orderHelper.handleGetDetailOrder(id, res, req);
  }

  @Get("vnpay_return")
  async handleVnPayReturn(@Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.orderHelper.handleVnpayReturn(res, req);
  }

  @Get("vnpay_ipn")
  async handleVnPayIpn(@Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.orderHelper.handleVnpayIpn(res, req);
  }
}
