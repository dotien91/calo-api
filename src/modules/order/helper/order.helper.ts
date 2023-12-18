import { Response, Request } from "express";
import {
  ForbiddenException,
  HttpStatus,
  NotFoundException,
  Injectable,
  BadRequestException,
  Res,
  Req,
  Param,
} from "@nestjs/common";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateOrderDto } from "../dto/create-order.dto";
import { OrderService } from "../services/order.service";
import { ListOrderDto } from "../dto/list-order.dto";
import { PlanService } from "../../../modules/plan/services/plan.service";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UpdateOrderDto } from "../dto/update-order.dto";
import { SubscribeService } from "../../../modules/subscribe/services/subscribe.service";
import axios from "axios";
import { Order } from "../schemas/order.schema";
import { Subscribe } from "../../../modules/subscribe/schemas/subscribe.schema";
import { ChatSocketService } from "../../../modules/chat_socket/chat_socket.service";
import * as moment from "moment";
import { ChannelService } from "../../../modules/channel/services/channel.service";
import { ListPaymentMethodDto } from "../dto/list-payment_method.dto";
import { HandleServiceService } from "../../../modules/plan/services/handle_service.service";
import { CourseLikeService } from "../../../modules/course/services/course_like.service";
import { CourseService } from "../../../modules/course/services/course.service";
import { TransactionService } from "../../../modules/transaction/services/transaction.service";
import { ChannelPermissionService } from "../../../modules/channel/services/channel_permission.service";
import { Course } from "../../../modules/course/schemas/course.schema";
import { ChallengePermissionService } from "../../../modules/challenge/services/challenge_permission.service";
import { ChallengeActivityService } from "../../../modules/challenge/services/challenge_activity.service";
import { CreateChallengeActivityDto } from "../../../modules/challenge/dto/create-challenge_activity.dto";
import { ChallengeService } from "../../../modules/challenge/services/challenge.service";
import { EventHookWorkerService } from "../../../modules/hook/services/hook_do.service";
import { TicketService } from "../../../modules/ticket/services/ticket.service";
import { ChannelPermission } from "../../../modules/channel/schemas/channel_permission.schema";
import { EventHookNotificationService } from "../../../modules/hook/services/hook_notification.service";
import { HandleService } from "../../../modules/plan/schemas/handle_service.schema";
import HookExpress from '../../hook/hook_epress';
import { CreateCourseLikeDto } from "../../../modules/course/dto/create-course_like.dto";

let initHook = false;
/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class OrderHelper {
  constructor(
    private orderService: OrderService,
    private planService: PlanService,
    private handleService: HandleServiceService,
    private userPermissionService: UserPermissionService,
    private subscribeService: SubscribeService,
    private channelService: ChannelService,
    private readonly socketService: ChatSocketService,
    private courseLikeService: CourseLikeService,
    private courseService: CourseService,
    private transactionService: TransactionService,
    private channelPermissionService: ChannelPermissionService,
    private challengePermissionService: ChallengePermissionService,
    private challengeActivitiesService: ChallengeActivityService,
    private challengeService: ChallengeService,
    private readonly eventHookWorkerService: EventHookWorkerService,
    private ticketService: TicketService,
    private readonly eventHookNotificationService: EventHookNotificationService,
  ) {
    if (!initHook) {
      this.initHook();
      initHook = true;
    }
  }

  initHook() {
    HookExpress.add_action('course.add-payment', async (data: CreateCourseLikeDto, courseData: Course) => {
      await this.processCreateOrderCourse(data, courseData);
    })
  }

  /**
   *
   * @param dataJoin
   * @param courseData
   * @returns
   */
  async processCreateOrderCourse(dataJoin: CreateCourseLikeDto, courseData: Course) {
    try {
      let dataToAdd = {
        channel_id: courseData?.channel_id?.toString(),
        payment_method: "transfer",
        user_id: dataJoin?.user_id,
        service_name: courseData.title,
        service_id: courseData?.service_id?.toString(),
        plan_id: courseData?.plan_id?.toString(),
        plan_type: "one_time",
        status: "success",
        short_id: null,
        amount_of_package: 1,
        order_note: "",
        coupon_code: "",
        description: "",
        trans_id: "",
        deep_link: "",
        price: Number(courseData.coin_value)
      };
      let dataCreate: Order = await this.orderService.create(dataToAdd);
      dataCreate = await this.updateOrderAfter(dataCreate?._id?.toString(), "pending");
      return dataCreate;
    } catch (error) {
      console.log(error);
      return true;
    }
  }

  /**
   *
   * @param res
   * @param req
   * @returns
   */
  async handleVnpayIpn(res: Response, req: ExpressRequestDto) {
    try {
      let vnp_Params = req.query;
      let secureHash = vnp_Params["vnp_SecureHash"];

      let orderId = vnp_Params["vnp_TxnRef"];
      let rspCode = vnp_Params["vnp_ResponseCode"];
      let amountOrder = Number(vnp_Params["vnp_Amount"]) / 100;

      let allowedIpdArray = [
        "113.160.92.202",
        "113.52.45.78",
        "116.97.245.130",
        "42.118.107.252",
        "113.20.97.250",
        "203.171.19.146",
        "103.220.87.4",
        "103.220.86.4",
      ];

      let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress;
      if (allowedIpdArray?.indexOf(ipAddr?.toString()) === -1) {
        res.status(200).json({ RspCode: "99", Message: "Unknow error" });
      }

      let dataCreate = {
        ip_address: ipAddr,
        data_log: JSON.stringify(vnp_Params)
      }
      await this.orderService.createVnpayLog(dataCreate);

      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];

      vnp_Params = this.sortObject(vnp_Params);

      let secretKey = process.env.VNPAY_SECRET_KEY;
      let querystring = require("qs");
      let signData = querystring.stringify(vnp_Params, { encode: false });
      let crypto = require("crypto");
      let hmac = crypto.createHmac("sha512", secretKey);
      let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

      let paymentStatus = "0"; // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
      //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
      //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó

      let checkOrderId = false; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
      let checkAmount = false; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
      let dataOrder = await this.orderService.findById(orderId?.toString() || "");

      if (dataOrder) {
        checkOrderId = true;
        if (Number(dataOrder.price) == amountOrder) {
          checkAmount = true;
        }
      } else {
        res.status(200).json({ RspCode: "01", Message: "Order not found" });
      }

      if (secureHash === signed) {
        //kiểm tra checksum
        if (checkOrderId) {
          if (checkAmount) {
            if (paymentStatus == "0") {
              //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
              if (rspCode == "00") {
                if (dataOrder?.status == "success") {
                  res.status(200).json({ RspCode: "02", Message: "Order already confirmed" });
                  return false;
                }
                //thanh cong
                //paymentStatus = '1'
                // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
                let dataUpdate = {
                  _id: orderId?.toString(),
                  status: "success",
                };
                await this.orderService.update(dataUpdate);
                await this.updateOrderAfter(orderId?.toString(), dataOrder?.status?.toString());
                res.status(200).json({ RspCode: "00", Message: "Success" });
              } else {
                //that bai
                //paymentStatus = '2'
                // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
                let dataUpdate = {
                  _id: orderId?.toString(),
                  status: "close",
                };
                await this.orderService.update(dataUpdate);
                res.status(200).json({ RspCode: "00", Message: "Success" });
              }
            } else {
              let dataUpdate = {
                _id: orderId?.toString(),
                status: "close",
              };
              await this.orderService.update(dataUpdate);
              console.log("This order has been updated to the payment status");
              res.status(200).json({ RspCode: "02", Message: "This order has been updated to the payment status" });
            }
          } else {
            let dataUpdate = {
              _id: orderId?.toString(),
              status: "close",
            };
            await this.orderService.update(dataUpdate);
            console.log("Amount invalid");
            res.status(200).json({ RspCode: "04", Message: "Amount invalid" });
          }
        } else {
          // let dataUpdate = {
          //   _id: orderId?.toString(),
          //   status: "close",
          // };
          // await this.orderService.update(dataUpdate);
          // console.log("ORDER NOT FOUND");
          res.status(200).json({ RspCode: "01", Message: "Order not found" });
        }
      } else {
        // let dataUpdate = {
        //   _id: orderId?.toString(),
        //   status: "close",
        // };
        // await this.orderService.update(dataUpdate);
        console.log("Checksum failed");
        res.status(200).json({ RspCode: "97", Message: "Checksum failed" });
      }
    } catch (error) {
      res.status(200).json({ RspCode: "99", Message: "Unknow error" });
    }
  }

  /**
   *
   * @param res
   * @param req
   */
  async handleVnpayReturn(res: Response, req: ExpressRequestDto) {
    try {
      let vnp_Params = req.query;
      // console.log(JSON.stringify(vnp_Params), "JSON.stringify(vnp_Params)");
      if (JSON.stringify(vnp_Params) == "{}") {
        return res.json({ status: "false" }).status(404);
      }

      let secureHash = vnp_Params["vnp_SecureHash"];
      let rspCode = vnp_Params["vnp_ResponseCode"];

      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];

      let orderId = vnp_Params["vnp_TxnRef"];
      let amountOrder = Number(vnp_Params["vnp_Amount"]) / 100;

      let paymentStatus = "0";

      vnp_Params = this.sortObject(vnp_Params);
      // let secretKey = process.env.
      let tmnCode = process.env.VNPAY_TMNCODE;
      let secretKey = process.env.VNPAY_SECRET_KEY;
      let vnpUrl = process.env.VNPAY_URL;
      let returnUrl = process.env.VNPAY_RETURN_URL;

      let querystring = require("qs");
      let signData = querystring.stringify(vnp_Params, { encode: false });
      let crypto = require("crypto");
      let hmac = crypto.createHmac("sha512", secretKey);
      let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

      let checkOrderId = false; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
      let checkAmount = false; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
      let dataOrder = await this.orderService.findById(orderId?.toString() || "");

      let channelId = dataOrder?.channel_id;
      let channelObject = await this.channelService.findOne({ _id: channelId });

      let dataRedirect = (channelObject?.domain || "https://gamifa.vn") + '/r/orders/detail/' + dataOrder?._id?.toString();
      if (dataOrder?.deep_link) {
        dataRedirect = dataOrder?.deep_link + dataOrder?._id?.toString();
      }

      if (dataOrder) {
        checkOrderId = true;
        if (Number(dataOrder.price) == amountOrder) {
          checkAmount = true;
        }
      }

      if (secureHash === signed) {
        //kiểm tra checksum
        if (checkOrderId) {
          if (checkAmount) {
            if (paymentStatus == "0") {
              //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
              if (rspCode == "00") {
                //thanh cong
                //paymentStatus = '1'
                // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
                let dataUpdate = {
                  _id: orderId?.toString(),
                  status: "success",
                };
                await this.orderService.update(dataUpdate);
                await this.updateOrderAfter(orderId?.toString(), dataOrder?.status?.toString());
              } else {
                let dataUpdate = {
                  _id: orderId?.toString(),
                  status: "close",
                };
                await this.orderService.update(dataUpdate);
              }
            } else {
              let dataUpdate = {
                _id: orderId?.toString(),
                status: "close",
              };
              await this.orderService.update(dataUpdate);
            }
          } else {
            let dataUpdate = {
              _id: orderId?.toString(),
              status: "close",
            };
            await this.orderService.update(dataUpdate);
          }
          return res.redirect(dataRedirect);
        } else {
        }
      } else {
        return res.redirect(dataRedirect);
      }
      return res.redirect(dataRedirect);
    } catch (error) {
      return res.redirect(process.env.ORDER_RETURN_URL?.replace("/detail/", ""));
    }
  }

  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewOrder(createOrderData: CreateOrderDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();

      let planObject = await this.planService.findById(createOrderData.plan_id);
      let oldOrder = await this.orderService.findOne({});
      let oldShortId = 1;
      if (oldOrder) {
        oldShortId = Number(oldOrder.short_id) + 1;
      }
      let channelId = req?.channel_id || "";
      if (channelId) {
        createOrderData = { ...createOrderData, ...{ channel_id: channelId } };
      }
      // console.log(Number(planObject?.trial_day), "Number(planObject?.trial_day)");

      //Check Plan Service
      if (!createOrderData?.payment_method && !Number(planObject?.trial_day) && Number(planObject?.price)) {
        throw new ForbiddenException("Payment method need!");
      }

      //Kiểm tra trường hợp có ngày dùng thử
      if (Number(planObject?.trial_day)) {
        //Check Subscribe
        let subscribe = await this.subscribeService.filter(
          {
            user_id: userId,
            service_id: planObject?.service_id?.toString(),
            channel_id: channelId,
          },
          { createdAt: "DESC" },
          1,
          1
        );
        // console.log(subscribe, "subscribe");
        //Trường hợp Đã tồn tại một gói đăng ký của người dùng
        if (subscribe?.length) {
          //Kiểm tra xem Extension đó có phí hay không
          if (Number(planObject?.price)) {
            if (!createOrderData?.payment_method) {
              //Trả về lỗi
              throw new ForbiddenException("Payment method need!");
            } else {
              //Trường hợp này khách thanh toán bình thường nó sẽ chạy tới hàm tiếp theo và sẽ bị tính tiền!
            }
          } else {
            //Trường hợp còn lại là trường hợp miễn phí
            createOrderData = { ...createOrderData, ...{ payment_method: "free" } };
          }
        } else {
          //Trường hợp này là chưa có gói đăng ksy, tiến hành cập nhập cho khách thành free và trạng thái đơn chuyển về thành công!
          createOrderData = { ...createOrderData, ...{ payment_method: "free", status: "success" } };
        }
      }

      //Cập nhập lại payment_method nếu gói miễn phí!
      if (!Number(planObject?.price)) {
        createOrderData = { ...createOrderData, ...{ payment_method: "free" } };
      }

      if (planObject) {
        let dataToAdd = {
          ...createOrderData,
          ...{
            user_id: userId,
            service_name: planObject.handle,
            service_id: planObject.service_id,
            plan_id: planObject._id.toString(),
            plan_type: planObject.type,
            short_id: oldShortId,
            price: Number(planObject.price) * Number(createOrderData.amount_of_package),
          },
        };

        if (planObject?.service_id?.service_type == "channel") {
          dataToAdd = { ...dataToAdd, ...{ trans_id: req?.channel_id?.toString() } };
        }

        if (createOrderData?.payment_method === "vn_pay") {
          // Lấy thời điểm hiện tại
          const currentTime = new Date();

          // Lấy thời điểm hiện tại dưới dạng số miligiây
          const currentTimeInMilliseconds = currentTime.getTime();

          // Cộng thêm 5 giây (5,000 miligiây)
          const newTimeInMilliseconds = currentTimeInMilliseconds + 4000;

          // Tạo đối tượng Date mới với thời điểm sau khi cộng
          const newTime = new Date(newTimeInMilliseconds);
          dataToAdd = { ...dataToAdd, ...{ vnpay_on: newTime } }
        }
        let dataCreate: Order = await this.orderService.create(dataToAdd);

        //Hậu xử lý!
        //Nếu là chuyển khoản thì bay tới trang detail luôn!
        if (dataCreate.payment_method == "transfer") {
          //Return after
          let redirectUrl = `/r/orders/detail/${dataCreate?._id?.toString()}`;
          let dataUpdate = { _id: dataCreate?._id?.toString(), redirect_url: redirectUrl };
          dataCreate = await this.orderService.update(dataUpdate);
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json(dataCreate);
        }

        //Trường hợp này là payment_method là miễn phí!
        if (dataCreate.payment_method == "free") {
          let redirectUrl = `/r/orders/detail/${dataCreate?._id?.toString()}`;
          let dataUpdate = { _id: dataCreate?._id?.toString(), redirect_url: redirectUrl, status: "success" };
          dataCreate = await this.orderService.update(dataUpdate);
          dataCreate = await this.updateOrderAfter(dataCreate?._id?.toString(), "pending");
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json(dataCreate);
        }
        if (dataCreate.payment_method == "vn_pay") {
          let redirectUrl = await this.createVNPayLink(
            req,
            Number(planObject.price) * Number(createOrderData.amount_of_package),
            "",
            "",
            dataCreate?._id?.toString()
          );
          let dataUpdate = { _id: dataCreate?._id?.toString(), redirect_url: redirectUrl?.toString() };
          dataCreate = await this.orderService.update(dataUpdate);
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json(dataCreate);
        }

        if (dataCreate?.status == "success") {
          //Update After


          //Update Channel
          let redirectUrl = `/r/orders/detail/${dataCreate?._id?.toString()}`;
          let dataUpdate = { _id: dataCreate?._id?.toString(), redirect_url: redirectUrl };
          dataCreate = await this.orderService.update(dataUpdate);
          dataCreate = await this.updateOrderAfter(dataCreate?._id?.toString(), "pending");
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json(dataCreate);
        }

        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataCreate);
      } else {
        throw new BadRequestException("Plan not found!");
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getOrderListByAdmin(query: ListOrderDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      //Check User Role
      let userId = userObject._id.toString();
      let channelId = req?.channel_id;
      let userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && (userPermission?.permission?.indexOf("order/list") !== -1))
      ) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "order/list")) {
        havePermission = true;
      }
      if (!havePermission) {
        throw new ForbiddenException("You not have permission for this activity!");
      }


      // if (await this.userPermissionService.isHavePermission(userId, "order/list")) {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }
      let dataToFilter = { ...query };

      //Check Channel
      if (channelId?.toString() !== process.env.DEFAULT_CHANNEL) {
        //Get Service Id
        let dataServiceArray = await this.handleService.filter({ service_type: "extension,channel,domain,mobile" }, {}, 1, 1000);
        let dataServiceId = dataServiceArray?.map((valueService: HandleService, index: number) => {
          return valueService?._id?.toString();
        })
        dataToFilter = { ...dataToFilter, ...{ service_not_in: dataServiceId } }
      }

      if (req?.channel_id) {
        dataToFilter = { ...dataToFilter, ...{ channel_id: req?.channel_id } };
      }
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      let dataReturn = await this.orderService.filter(dataToFilter, orderByOBject, page, limit);
      let dataCount = await this.orderService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .json(dataReturn);
      // } else {
      //   throw new BadRequestException("You haven't permission for this Action!");
      // }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getListPaymentMethod(query: ListPaymentMethodDto, res: Response, req: ExpressRequestDto) {
    try {
      let channelId = req?.channel_id || query?.channel_id;
      if (!channelId) {
        throw new ForbiddenException("Channel is invalid");
      }
      let serviceObject = await this.handleService.findById(query?.service_id);
      let channelObject = await this.channelService.findById(channelId);
      if (serviceObject) {
        if (serviceObject?.service_type == "extension" || serviceObject?.service_type == "channel") {
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json(["vn_pay", "transfer"]);
        } else {
          let dataPayment = channelObject?.payment_method;
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json(["vn_pay", "transfer"]);
        }
      } else {
        throw new ForbiddenException("Channel is invalid");
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getOrderListByUser(query: ListOrderDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();

      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }
      let channelId = req?.channel_id || "";
      let dataToFilter = { ...query, ...{ user_id: userId, channel_id: channelId } };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      let dataReturn = await this.orderService.filter(dataToFilter, orderByOBject, page, limit);
      let dataCount = await this.orderService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleGetDetailOrder(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      //Check Permission
      let dataReturn = await this.orderService.findById(id.toString());
      // if (
      //   (await this.userPermissionService.isHavePermission(userId, "order/list")) ||
      //   dataReturn.user_id?._id.toString() === userId
      // ) {
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
      // } else {
      //   throw new BadRequestException("You haven't permission for this Action!");
      // }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleUpdateOrderByAdmin(dataUpdate: UpdateOrderDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();

      //Check User Role
      let channelId = process.env.DEFAULT_CHANNEL;

      let dataOrderBefore = await this.orderService.findById(dataUpdate?._id?.toString());
      if (dataOrderBefore?.service_id?.service_type === 'course') {
        channelId = req?.channel_id;
      }

      let userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && (userPermission?.permission?.indexOf("order/list") !== -1))
      ) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "order/list")) {
        havePermission = true;
      }
      if (!havePermission) {
        throw new ForbiddenException("You not have permission for this activity!");
      }

      //Check Order
      //Check Permission
      // if (await this.userPermissionService.isHavePermission(userId, "order/update")) {
      let dataReturn = await this.orderService.update(dataUpdate);
      await this.updateOrderAfter(dataReturn._id.toString());
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
      // } else {
      //   throw new BadRequestException("You haven't permission for this Action!");
      // }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleUpdateOrderByUser(dataUpdate: UpdateOrderDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      //Check Permission
      //Check Order Object
      let orderObject = await this.orderService.findById(dataUpdate?._id?.toString());
      if (orderObject) {
        let userCreate = orderObject?.user_id?._id?.toString();
        if (userCreate !== userId) {
          throw new BadRequestException("You haven't permission for this Action!");
        }
        //Update
        if (dataUpdate?.status !== "processing") {
          throw new BadRequestException("You haven't permission for this Action!");
        } else {
          if (dataUpdate?.hasOwnProperty("media_id") && !dataUpdate?.media_id) {
            delete dataUpdate?.media_id;
          }
          let dataReturn = await this.orderService.update(dataUpdate);

          let url = process.env.TELEGRAM_URL;
          // let channelId = dataReturn?.trans_id;
          try {
            setTimeout(async () => {
              // let channel = await this.channelService.findById(channelId);
              let channelObject = await this.channelService?.findById(req?.channel_id);
              let dataToPost = {
                text: `${orderObject?.user_id.display_name} vừa chuyển khoản thành công thanh toán với số tiền:  (${orderObject.price} VND). Vui lòng kiểm tra số dư tài khoản và truy cập vào: ${(channelObject?.domain || "https://gamifa.vn")}/v/order/admin/${dataUpdate?._id}?auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjQyOTUxNzIsImRhdGEiOnsiX2lkIjoiNjRkNWRlMmZhYTJmZWQxNzU4NDUxMGQyIiwia2V5IjoiYzViOTk1NmMxN2ZmNzRkMTQyMTUyMmUzNmRjNzQ4ZWUiLCJzaWduYXR1cmUiOiI3NDc3YjFjZDQxNzNjYzUxODUyYTUzODNjNWQ0ZmExMSIsInNlc3Npb24iOiI2NGU1NzQ4NDg0OGE3ZDc3YmVkZDQyZmEifSwiaWF0IjoxNjkyNzU5MTcyfQ.2guMNJ3SAjQYSIpbSAHVSh0tghAy_N0b7fmAJTgx9P8 để cập nhật trạng thái đơn hàng.`,
              };
              //Update
              await axios.post(url, dataToPost, {}).then(() => { });

              this.eventHookNotificationService.sendNotiNMailPaySuccess({
                send_user_id: orderObject?.channel_id?.user_id?.toString(),
                user_id: channelObject?.user_id?._id.toString(),
                channel_id: orderObject?.channel_id?.toString(),
                path: `/r/orders-admin/detail/${orderObject._id.toString()}`,
                mail_template: "success_pay_order",
                content: (params: any) => {
                  return `${orderObject?.user_id?.display_name} đặt thành công Extension ${orderObject.service_name} kênh ${params?.channel_name}`;
                },
                title: `${orderObject?.user_id.display_name.toLocaleUpperCase()} ĐẶT THÀNH CÔNG ${orderObject.service_name.toLocaleUpperCase()}`,
              })
            }, 500);
          } catch (error) { }

          //Send Telegram
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json(dataReturn);
        }
      } else {
        throw new BadRequestException("You haven't permission for this Action!");
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param orderId
   * @returns
   */
  async updateOrderAfter(orderId: string, beforeStatus: string = "pending"): Promise<Order> {
    let orderObject: Order = await this.orderService.findById(orderId);
    try {

      if (!orderObject) {
        console.log("ORDER NOT FOUND");
        return null;
      }
      // console.log(beforeStatus, "beforeStatus");
      // console.log(orderObject.status, "orderObject.status");
      if (orderObject.status == "success" && beforeStatus == "pending") {
        let amountOfDay = Number(orderObject.plan_id.amount_of_day) * Number(orderObject.amount_of_package);
        const date = new Date();
        date.setDate(date.getDate() + amountOfDay);
        let endTime = date;
        let dataIsTrial = orderObject?.payment_method == "free" ? true : false;
        //Update subscribe
        let dataSubscribe = {
          is_trial: dataIsTrial,
          user_id: orderObject?.user_id?._id.toString(),
          channel_id: orderObject?.channel_id?.toString(),
          service_name: orderObject.service_name,
          service_id: orderObject.service_id?._id.toString(),
          plan_id: orderObject.plan_id._id.toString(),
          coupon_code: orderObject.coupon_code,
          status: "active",
          start_at: new Date(),
          end_at: endTime,
        };
        let dataToCreate = await this.subscribeService.create(dataSubscribe);
        // console.log(orderObject?.service_id, "orderObject?.service_id");
        //Check if service is Extension
        if (
          orderObject?.service_id?.service_type == "extension" ||
          orderObject?.service_id?.service_type == "domain" ||
          orderObject?.service_id?.service_type == "mobile"
        ) {
          if (orderObject?.service_id?.service_type == "extension") {
            this.eventHookNotificationService.sendNotiNMailBuyExtensionSuccess({
              send_user_id: orderObject?.channel_id?.user_id?.toString(),
              user_id: orderObject?.user_id?._id.toString(),
              channel_id: orderObject?.channel_id?._id?.toString(),
              path: `/r/orders/detail/${orderObject._id.toString()}`,
              mail_template: "success_order_extension",
              content: (params: any) => {
                return `${orderObject?.user_id?.display_name} đặt thành công Extension ${orderObject.service_name} kênh ${params?.channel_name}`;
              },
              title: `${orderObject?.user_id.display_name.toLocaleUpperCase()} ĐẶT THÀNH CÔNG ${orderObject.service_name.toLocaleUpperCase()}`,
            })
          }
          //Update for Channel
          let dataUdpate = {
            _id: orderObject?.channel_id?.toString(),
            service_id: orderObject?.service_id?._id?.toString(),
          };
          let dataUpdate = await this.channelService.updateArray(dataUdpate);
          // console.log(dataUpdate, "dataUpdate");
        }
        if (orderObject?.service_id?.service_type == "channel") {
          //Update for Channel
          let dataUdpate = {
            _id: orderObject?.channel_id?.toString(),
            official_status: 1,
          };
          await this.channelService.update(dataUdpate);
          let dataUpdate = {
            _id: orderObject?._id?.toString(),
            product_url: '/r/domain/create'
          }
          orderObject = await this.orderService.update(dataUpdate);
        }

        if (orderObject?.service_id?.service_type === 'extension') {
          let dataUpdate = {
            _id: orderObject?._id?.toString(),
            product_url: orderObject?.service_id?.router_link
          }
          orderObject = await this.orderService.update(dataUpdate);
        }
        if (orderObject?.service_id?.service_type == "mobile") {
          let getTotalAdmin = await this.channelPermissionService.filter({ channel_id: process.env.DEFAULT_CHANNEL, channel_role: "mentor" }, {}, 1, 100);
          let userArray = getTotalAdmin?.map((channelPermissionItem: ChannelPermission, index: Number) => {
            return channelPermissionItem?.user_id?._id?.toString()
          });
          let totalArray = [...[orderObject?.user_id?._id.toString()], ...userArray]
          let contentTicket = `${orderObject.user_id?.display_name} tạo mới một Ticket đặt hàng ứng dụng Mobile mới! Quy trình tạo Ứng dụng gồm các bước sau: \n
1: Tiếp nhận thông tin 1-2 ngày)\n2: Trao đổi & Thống nhất về App (2-5 ngày)\n3: Xây dựng App (3 - 4 tuần)\n4: Gửi bản Demo (1 tuần)\n5: Publish lên Store\nBạn có thể trao đổi với đội ngũ kĩ thuật tại đây, chúng tôi sẵn sàng thảo luận và hỗ trợ bạn. Ticket của bạn sẽ nhận được thông báo và Email khi có cập nhật mới!`;
          //Create Ticket from trans_id
          let dataCreateTicket = {
            post_language: "vi",
            post_content: contentTicket,
            post_title: "Đơn đặt hàng ứng dụng Mobile mới",
            post_category: process.env.TICKET_MOBILE_CATEGORY || "",
            data_id: orderObject?.trans_id?.toString(),
            user_id: totalArray,
            channel_id: [orderObject?.channel_id?.toString(), process.env.DEFAULT_CHANNEL?.toString()],
          }
          let dataTicket = await this.ticketService.create(dataCreateTicket);
          //Return
          //Update Return

          let dataUpdate = {
            _id: orderObject?._id?.toString(),
            redirect_url: '/r/support/' + dataTicket?._id?.toString(),
            product_url: '/r/support/' + dataTicket?._id?.toString()
          }
          orderObject = await this.orderService.update(dataUpdate);

        }

        if (orderObject?.service_id?.service_type == "course") {
          await this.handleUpdateCourseAfter(orderObject);
          let dataUpdate = {
            _id: orderObject?._id?.toString(),
            product_url: '/r/courses/view/' + orderObject?.service_id?.handle?.toString()
          }
          orderObject = await this.orderService.update(dataUpdate);
        }

        this.eventHookNotificationService.sendNotiNMailOrderSuccess({
          send_user_id: orderObject?.channel_id?.user_id?.toString(),
          user_id: orderObject?.user_id?._id.toString(),
          channel_id: orderObject?.channel_id?._id?.toString(),
          path: `/r/orders/detail/${orderObject._id.toString()}`,
          router: "NAVIGATION_PURCHASE_SUCCESS_SCREEN",
          order_id: orderObject?._id?.toString(),
          mail_template: "success_order",
          content: (params: any) => {
            return `${orderObject?.user_id?.display_name} đặt thành công ${orderObject.service_name} kênh ${params?.channel_name}`;
          },
          title: `${orderObject?.user_id.display_name.toLocaleUpperCase()} ĐẶT THÀNH CÔNG ${orderObject.service_name.toLocaleUpperCase()}`,
        })

        // console.log(dataToCreate, "dataToCreate");
        return orderObject;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      return orderObject;
    }
  }

  /**
   *
   * @param orderObject
   */
  async handleUpdateCourseAfter(orderObject: Order) {
    try {
      let dataUpdate = {
        user_id: orderObject?.user_id?._id.toString(),
        course_id: orderObject?.service_id?.handle?.toString(),
      };
      let dataReturn = await this.courseLikeService.update(dataUpdate);

      //Update count Video
      let dataUpdateFilter = {
        _id: orderObject?.service_id?.handle?.toString(),
      };
      let dataCourse = await this.courseService.updateCount(dataUpdateFilter, { join_number: 1 });

      //Update Transaction
      //Channel ID
      let channelId = dataCourse?.channel_id?.toString();
      let dataChannel = await this.channelService.findById(channelId);

      let transactionValue = Number(orderObject?.price);

      //For User
      //Get Current User permission Channel
      let userPermissionFilter = {
        user_id: orderObject?.user_id?._id.toString(),
        channel_id: channelId,
      };
      let dataPermission = await this.channelPermissionService.findOneWithPopulate(userPermissionFilter);
      let bossCommission = 100;

      let userCommision = Number(dataChannel?.user_commission) || 0;
      let mentorCommission = Number(dataChannel?.mentor_commission) || 0;

      let isUserCommision = false;
      if (dataPermission?.from_user) {
        //Check user From
        let dataPermissionFromUser = await this.channelPermissionService.findOneWithPopulate({ user_id: dataPermission?.from_user?.toString(), channelId })
        if (dataPermissionFromUser?.channel_role !== 'mentor') {
          isUserCommision = true;

          bossCommission = bossCommission - userCommision;
          //Check
          let transactionUser = transactionValue * (userCommision / 100);
          transactionUser = Math.round(transactionUser * 100) / 100;
          //Update for Bosss
          await this.handleCreateTransaction(
            dataPermission?.from_user?.toString(),
            transactionUser,
            orderObject,
            dataCourse,
            channelId,
            userCommision
          );
          this.eventHookWorkerService.PlusPointChallengePusher({
            user_id: dataPermission?.from_user?.toString(),
            game_type: "revenue",
            channel_id: channelId,
            point_value: Number(transactionValue),
            display_name: dataPermissionFromUser?.user_id?.display_name.toString(),
          });
          this.eventHookNotificationService.sendNotiMentorReceiveCommission({
            send_user_id: dataChannel?.user_id?._id?.toString(),
            user_id: dataPermission?.from_user?.toString(),
            channel_id: channelId,
            path: `r/mentor/income`,
            mail_template: "commission_receive_mentor",
            content: (params: any) => {
              return `Chúc mừng người dùng ${dataPermissionFromUser?.user_id?.display_name} nhận được hoa hồng từ hóa đơn ${orderObject.service_name} kênh ${params?.channel_name}`;
            },
            title: `${dataPermissionFromUser?.user_id?.display_name.toLocaleUpperCase()} NHẬN ĐƯỢC TIỀN HOA HỒNG`,
          })

        }

      }

      if (dataPermission?.from_mentor) {
        //Check user From
        let dataPermissionFromUser = await this.channelPermissionService.findOneWithPopulate({ user_id: dataPermission?.from_mentor?.toString(), channelId })
        if (dataPermissionFromUser?.channel_role !== 'mentor') {
          if (isUserCommision) {
            mentorCommission = mentorCommission - userCommision;
          }
          bossCommission = bossCommission - mentorCommission;
          //Check
          let transactionUser = transactionValue * (mentorCommission / 100);
          transactionUser = Math.round(transactionUser * 100) / 100;
          //Update for Bosss
          await this.handleCreateTransaction(
            dataPermission?.from_mentor?.toString(),
            transactionUser,
            orderObject,
            dataCourse,
            channelId,
            mentorCommission
          );
          this.eventHookWorkerService.PlusPointChallengePusher({
            user_id: dataPermission?.from_mentor?.toString(),
            game_type: "revenue",
            channel_id: channelId,
            point_value: Number(transactionValue),
            display_name: dataPermissionFromUser?.user_id?.display_name.toString(),
          })

          this.eventHookNotificationService.sendNotiMentorReceiveCommission({
            send_user_id: dataChannel?.user_id?._id?.toString(),
            user_id: dataPermission?.from_mentor?.toString(),
            channel_id: channelId,
            path: `r/mentor/income`,
            mail_template: "commission_receive_mentor",
            content: (params: any) => {
              return `Chúc mừng người dùng ${dataPermissionFromUser?.user_id?.display_name} nhận được hoa hồng từ hóa đơn ${orderObject.service_name} kênh ${params?.channel_name}`;
            },
            title: `${dataPermissionFromUser?.user_id?.display_name.toLocaleUpperCase()} NHẬN ĐƯỢC TIỀN HOA HỒNG`,
          })
        }
      }


      let bossTransactionValue = transactionValue * (bossCommission / 100);
      bossTransactionValue = Math.round(bossTransactionValue * 100) / 100;

      //Plus money for boss
      let bossUserPermissionArray = await this.channelPermissionService.filter({ channel_id: channelId, channel_role: "mentor" }, {}, 1, 100);

      for (let bossItem of bossUserPermissionArray) {
        //Check User Permission
        //Update for Bosss

        await this.handleCreateTransaction(
          bossItem?.user_id?._id?.toString(),
          bossTransactionValue,
          orderObject,
          dataCourse,
          channelId,
          bossCommission
        );
        setTimeout(() => {
          this.eventHookNotificationService.sendNotiUserBuyGoodsForBoss({
            send_user_id: dataChannel?.user_id?._id?.toString(),
            user_id: bossItem?.user_id?._id?.toString(),
            channel_id: channelId,
            path: `r/mentor/income`,
            mail_template: "success_buy_goods",
            content: (params: any) => {
              return `Chúc mừng người dùng ${dataPermission?.user_id?.display_name} thanh toán hóa đơn ${orderObject.service_name} kênh ${params?.channel_name}`;
            },
            title: `${dataPermission?.user_id?.display_name?.toLocaleUpperCase()} THANH TOÁN HÓA ĐƠN`,
          })
        }, 500);

      }


    } catch (error) {
      console.log(error, "error Transation");
    }
  }

  async handleCreateTransaction(
    userIdTransaction: string,
    transactionValue: number,
    orderObject: Order,
    dataCourse: Course,
    channelId: string,
    commmissionValue: number
  ) {
    let dataFilter = {
      user_id: userIdTransaction,
    };
    let newDataTransaction = await this.transactionService.findOne(dataFilter);
    let lastToken = 0;
    if (newDataTransaction) {
      lastToken = Number(newDataTransaction.current_token);
    }
    let currentToken = 0;
    currentToken = lastToken + Number(transactionValue);

    let dataTransactionToAdd = {
      user_id: userIdTransaction,
      channel_id: channelId,
      ref_id: orderObject?.service_id?.handle?.toString(),
      ref_type: "course",
      ref_name: dataCourse?.title?.toString(),
      ref_url: `/r/courses/view/${orderObject?.service_id?.handle?.toString()}`,
      last_coin: 0,
      current_coin: 0,
      last_token: lastToken,
      current_token: currentToken,
      transaction_value: transactionValue,
      commission_value: commmissionValue,
      transaction_type: "output",
      income_value: 0,
      method: "plus",
      note: `Recive ${transactionValue} coin from System ID: ${orderObject?.service_id?.handle?.toString()}`,
      status: "done",
      trans_id: "",
      error_message: "",
      data_payment: "",
      billing_on: new Date(),
      processing_on: null,
      successfully_on: new Date(),
      from_user: orderObject?.user_id?._id.toString(),
      type_system: "system",
    };
    let dataTransaction = await this.transactionService.create(dataTransactionToAdd);
    // setTimeout(() => {

    //   console.log("đã vào cộng điểm!!!");
    //   this.eventHookWorkerService.PlusPointChallengePusher({
    //     user_id: orderObject?.user_id?._id.toString(),
    //     game_type: "revenue",
    //     channel_id: channelId,
    //     point_value: transactionValue,
    //     display_name: orderObject?.user_id?.display_name.toString(),
    //   });
    //   this.eventHookNotificationService.sendNotiMentorReceiveCommission({
    //     user_id: orderObject?.user_id?._id.toString(),
    //     channel_id: channelId,
    //     path: `r/mentor/income`,
    //     mail_template: "commission_receive_mentor",
    //     content: (params: any) => {
    //       return `Chúc mừng người dùng ${dataPermission?.from_user?.display_name} nhận được hoa hồng từ hóa đơn ${orderObject.service_name} kênh ${params?.channel_name}`;
    //     },
    //     title: `${dataPermission?.from_user?.display_name.toLocaleUpperCase()} NHẬN ĐƯỢC TIỀN HOA HỒNG`,
    //   })
    // }, 300);
  }

  /**
   *
   * @param orderObject
   * @param subscribeObject
   */
  async updateEsim(orderObject: Order, subscribeObject: Subscribe) {
    try {
      //Handle EsimObject
      let planNote = orderObject?.plan_id?.note;
      let planObject = orderObject?.plan_id?.options;
      let urlAxios = "";
      let authCode = "";
      let packageName = "";
      let bodyData = "";
      let contentType = "application/json";
      for (let itemOption of planObject) {
        if (itemOption?.key === "url") {
          urlAxios = itemOption?.value;
        }
        if (itemOption?.key === "auth") {
          authCode = itemOption?.value;
        }
        if (itemOption?.key === "package_name") {
          packageName = itemOption?.value;
        }
        if (itemOption?.key === "body_data") {
          bodyData = itemOption?.value;
        }
        if (itemOption?.key === "content_type") {
          contentType = itemOption?.value;
        }
      }

      const config = {
        headers: {
          "Content-Type": contentType,
          Authorization: authCode,
        },
      };

      let params: any = "";
      try {
        // let dataToLogin = JSON.parse(bodyData);
        params = bodyData;
      } catch (error) {
        params = "";
      }
      let dataReturn = await axios
        .post(urlAxios, params, config)
        .then((response) => {
          if (response?.data) {
            return response?.data;
          } else {
            return null;
          }
        })
        .catch((error) => {
          return error;
          return null;
        });

      if (dataReturn) {
        switch (planNote) {
          case "airalo":
            //Update to Air Alo
            break;
          default:
            //Update to
            let dataUpdate = {
              manual1: dataReturn?.purchase?.esim?.manual1,
              manual2: dataReturn?.purchase?.esim?.manual2,
              phone: dataReturn?.purchase?.esim?.phone,
              serial: dataReturn?.purchase?.esim?.serial,
              expiryDate: dataReturn?.purchase?.esim?.expiryDate,
              qrCodeString: dataReturn?.purchase?.esim?.qrCodeString,
              dataClient: JSON.stringify(dataReturn),
            };
            dataUpdate = { ...dataUpdate, ...{ _id: subscribeObject?._id } };
            await this.subscribeService.update(dataUpdate);

            //@ts-ignore
            // let dataSendSocket = {...subscribeObject?.toObject(), ...{dataUpdate}}

            let dataSendSocket = await this.subscribeService.findById(subscribeObject?._id);
            //Update socket
            this.socketService.handleSendOrder(dataSendSocket, orderObject?.user_id?._id?.toString());
            break;
        }
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async createVNPayLink(
    req: ExpressRequestDto,
    amount: number,
    bankCode: string,
    locale: string = "",
    orderId: string
  ) {
    process.env.TZ = "Asia/Ho_Chi_Minh";

    let date = new Date();
    let createDate = moment(date).format("YYYYMMDDHHmmss");

    let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress;

    let tmnCode = process.env.VNPAY_TMNCODE;
    let secretKey = process.env.VNPAY_SECRET_KEY;
    let vnpUrl = process.env.VNPAY_URL;
    let returnUrl = process.env.VNPAY_RETURN_URL;
    // let orderId = moment(date).format("DDHHmmss");

    if (locale === null || locale === "") {
      locale = "vn";
    }
    let currCode = "VND";
    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = locale;
    vnp_Params["vnp_CurrCode"] = currCode;
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderId;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;
    if (bankCode !== null && bankCode !== "") {
      vnp_Params["vnp_BankCode"] = bankCode;
    }

    vnp_Params = this.sortObject(vnp_Params);
    let querystring = require("qs");
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
    return vnpUrl;
  }

  sortObject(obj: any) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
  }
}
