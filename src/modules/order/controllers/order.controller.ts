import { Body, Controller, Get, Param, Post, Query, Req, Res } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { EmailService } from "../../email/services/email.service";
import { EmailPattern } from "../../email/services/email.service.i";
import { NotificationHelper } from "../../notification/helper/notification.helper";
import { NotificationRouter } from "../../notification/interfaces/notification.interface";
import { UserLoginHelper } from "../../user/helper/user_login.helper";
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
  constructor(
    private readonly orderHelper: OrderHelper,
    private readonly userLoginHelper: UserLoginHelper,
    private readonly notificationHelper: NotificationHelper,
    private readonly emailService: EmailService
  ) {
    const jwt = this.userLoginHelper.generateJwt(process.env.INFO_SESSION, true);
    if (typeof jwt !== "boolean") {
      this.authCode = jwt;
    }
  }
  private COUNTER = {};
  private authCode = "";

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkPendingOrder() {
    const newCounter = {};
    const pendingOrders = await this.orderHelper.getPendingOrders();

    for (const order of pendingOrders) {
      const orderId = order._id.toString();
      if (!this.COUNTER[orderId]) newCounter[orderId] = 1;
      else newCounter[orderId] = this.COUNTER[orderId] + 1;

      if (newCounter[orderId] === 3 || newCounter[orderId] === 7) {
        // send notification
        const dataToSendNotification = {
          data_id: orderId,
          // TODO: update path
          path: `/v/checkout`,
        };
        const dataNotification = {
          user_id: order.user_id._id.toString(),
          title: `You have orders in your cart, please check it`,
          content: "",
          param: JSON.stringify(dataToSendNotification),
          type_action: "link",
          router: NotificationRouter.NAVIGATION_CHECKOUT_SCREEN,
          click_action: "",
          image: "",
        };
        this.notificationHelper.handleSendNotification(dataNotification, this.authCode);

        // send email
        this.emailService.send({
          eventName: EmailPattern.PENDING_ORDER,
          email: order.user_id.user_email,
          replacePattern: {
            display_name: order.user_id.display_name,
            total: (order.price - order.coupon_price) * order.amount_of_package,
          },
        });

        if (newCounter[orderId] === 7) newCounter[orderId] = 0;
      }
    }

    this.COUNTER = newCounter;
  }

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
