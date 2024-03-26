import { BadRequestException, ForbiddenException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import axios from "axios";
import { Response } from "express";
import * as moment from "moment";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { Coupon } from "../../../modules/coupon/schemas/coupon.schema";
import { CouponService } from "../../../modules/coupon/services/coupon.service";
import { AddMemberCourseClassDto } from "../../../modules/course/dto/create-course_class.dto";
import { CreateCourseOneOneStudentDto } from "../../../modules/course/dto/create-course_one_one.dto";
import { CourseService } from "../../../modules/course/services/course.service";
import { CourseUserService } from "../../../modules/course/services/course_user.service";
import { EmailService } from "../../../modules/email/services/email.service";
import { AddPointToUserData } from "../../../modules/hook/interfaces/hook.interface";
import { EventHookWorkerService } from "../../../modules/hook/services/hook_do.service";
import { EventHookNotificationService } from "../../../modules/hook/services/hook_notification.service";
import { HandleServiceService } from "../../../modules/plan/services/handle_service.service";
import { PlanService } from "../../../modules/plan/services/plan.service";
import {
  RedeemMissionActionTarget,
  RedeemMissionActionType,
} from "../../../modules/redeem/interfaces/redeem.interface.i";
import { RedeemUserService } from "../../../modules/redeem/services/redeem_user.service";
import { ReferralService } from "../../../modules/referral/services/referral.service";
import { Subscribe } from "../../../modules/subscribe/schemas/subscribe.schema";
import { SubscribeService } from "../../../modules/subscribe/services/subscribe.service";
import { TelegramService } from "../../../modules/telegram/services/telegram.service";
import {
  TransactionRefType,
  TransactionValueType,
} from "../../../modules/transaction/interfaces/transaction.interface";
import { TransactionService } from "../../../modules/transaction/services/transaction.service";
import {
  UserPointHistory_EntityAction,
  UserPointHistory_EntityTarget,
} from "../../../modules/user/interfaces/user.interface";
import { User } from "../../../modules/user/schemas/user.schema";
import { UserService } from "../../../modules/user/services/user.service";
import { CourseHelper } from "../../course/helper/course.helper";
import { EmailPattern } from "../../email/services/email.service.i";
import { NotificationRouter } from "../../notification/interfaces/notification.interface";
import { CreateOrderDto, PlanObject } from "../dto/create-order.dto";
import { ListOrderDto } from "../dto/list-order.dto";
import { ListPaymentMethodDto } from "../dto/list-payment_method.dto";
import { UpdateOrderDto } from "../dto/update-order.dto";
import { OrderPaymentMethod, PayloadType } from "../interfaces/order.interface";
import { Order } from "../schemas/order.schema";
import { OrderService } from "../services/order.service";

const initHook = false;
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
    private subscribeService: SubscribeService,
    private transactionService: TransactionService,
    private courseUserService: CourseUserService,
    private courseService: CourseService,
    private emailService: EmailService,
    private userService: UserService,
    private couponService: CouponService,
    private eventHookWorkerService: EventHookWorkerService,
    private eventHookNotificationService: EventHookNotificationService,
    private courseHelper: CourseHelper,
    private referralService: ReferralService,
    private redeemUserService: RedeemUserService,
    private telegramService: TelegramService
  ) {
    // if (!initHook) {
    //   this.initHook();
    //   initHook = true;
    // }
  }

  // initHook() {
  //   HookExpress.add_action("course.add-payment", async (data: CreateCourseLikeDto, courseData: Course) => {
  //     await this.processCreateOrderCourse(data, courseData);
  //   });
  // }

  // /**
  //  *
  //  * @param dataJoin
  //  * @param courseData
  //  * @returns
  //  */
  // async processCreateOrderCourse(dataJoin: CreateCourseLikeDto, courseData: Course) {
  //   try {
  //     const dataToAdd = {
  //       channel_id: courseData?.channel_id?.toString(),
  //       payment_method: "transfer",
  //       user_id: dataJoin?.user_id,
  //       service_name: courseData.title,
  //       service_id: courseData?.service_id?.toString(),
  //       plan_id: courseData?.plan_id?.toString(),
  //       plan_type: "one_time",
  //       status: "success",
  //       short_id: null,
  //       amount_of_package: 1,
  //       order_note: "",
  //       coupon_code: "",
  //       description: "",
  //       trans_id: "",
  //       deep_link: "",
  //       price: Number(courseData.price),
  //     };
  //     let dataCreate: Order = await this.orderService.create(dataToAdd);
  //     dataCreate = await this.updateOrderAfter(dataCreate?._id?.toString(), "pending");
  //     return dataCreate;
  //   } catch (error) {
  //     console.log(error);
  //     return true;
  //   }
  // }

  /**
   *
   * @param res
   * @param req
   * @returns
   */
  async handleVnpayIpn(res: Response, req: ExpressRequestDto) {
    try {
      let vnp_Params = req.query;
      const secureHash = vnp_Params["vnp_SecureHash"];

      const orderId = vnp_Params["vnp_TxnRef"];
      const rspCode = vnp_Params["vnp_ResponseCode"];
      const amountOrder = Number(vnp_Params["vnp_Amount"]) / 100;

      const allowedIpdArray = ["113.160.92.202"];
      if (process.env.NODE_ENV === "production") {
        allowedIpdArray.push(
          ...[
            "113.52.45.78",
            "116.97.245.130",
            "42.118.107.252",
            "113.20.97.250",
            "203.171.19.146",
            "103.220.87.4",
            "103.220.86.4",
          ]
        );
      }

      const ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress;
      if (allowedIpdArray?.indexOf(ipAddr?.toString()) === -1) {
        return res.status(200).json({ RspCode: "99", Message: "Unknow error" });
      }

      const dataCreate = {
        ip_address: ipAddr,
        data_log: JSON.stringify(vnp_Params),
      };
      await this.orderService.createVnpayLog(dataCreate);

      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];

      vnp_Params = this.sortObject(vnp_Params);

      const secretKey = process.env.VNPAY_SECRET_KEY;
      const querystring = require("qs");
      const signData = querystring.stringify(vnp_Params, { encode: false });
      const crypto = require("crypto");
      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

      const paymentStatus = "0"; // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
      //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
      //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó

      let checkOrderId = false; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
      let checkAmount = false; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
      const dataOrder = await this.orderService.findById(orderId?.toString() || "");

      if (dataOrder) {
        checkOrderId = true;
        if (Number(dataOrder.price) == amountOrder) {
          checkAmount = true;
        }
      } else {
        return res.status(200).json({ RspCode: "01", Message: "Order Not Found" });
      }

      if (secureHash === signed) {
        const isPendingOrder = dataOrder.status === "pending";
        //kiểm tra checksum
        if (checkOrderId) {
          if (checkAmount) {
            if (paymentStatus == "0") {
              //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
              if (rspCode == "00") {
                if (dataOrder?.status == "success") {
                  res.status(200).json({ RspCode: "02", Message: "Order already confirmed" });
                }
                //thanh cong
                //paymentStatus = '1'
                // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
                const dataUpdate = {
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
                const dataUpdate = {
                  _id: orderId?.toString(),
                  status: "close",
                };
                if (isPendingOrder) await this.orderService.update(dataUpdate);
                res.status(200).json({ RspCode: "00", Message: "Success" });
              }
            } else {
              const dataUpdate = {
                _id: orderId?.toString(),
                status: "close",
              };
              if (isPendingOrder) await this.orderService.update(dataUpdate);
              res.status(200).json({ RspCode: "02", Message: "This order has been updated to the payment status" });
            }
          } else {
            const dataUpdate = {
              _id: orderId?.toString(),
              status: "close",
            };
            if (isPendingOrder) await this.orderService.update(dataUpdate);
            res.status(200).json({ RspCode: "04", Message: "Invalid amount" });
          }
        } else {
          // let dataUpdate = {
          //   _id: orderId?.toString(),
          //   status: "close",
          // };
          // await this.orderService.update(dataUpdate);
          // console.log("ORDER NOT FOUND");
          res.status(200).json({ RspCode: "01", Message: "Order Not Found" });
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

      const secureHash = vnp_Params["vnp_SecureHash"];
      const rspCode = vnp_Params["vnp_ResponseCode"];

      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];

      const orderId = vnp_Params["vnp_TxnRef"];
      const amountOrder = Number(vnp_Params["vnp_Amount"]) / 100;

      const paymentStatus = "0";

      vnp_Params = this.sortObject(vnp_Params);
      // let secretKey = process.env.
      const tmnCode = process.env.VNPAY_TMNCODE;
      const secretKey = process.env.VNPAY_SECRET_KEY;
      const vnpUrl = process.env.VNPAY_URL;
      const returnUrl = process.env.VNPAY_RETURN_URL;

      const querystring = require("qs");
      const signData = querystring.stringify(vnp_Params, { encode: false });
      const crypto = require("crypto");
      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

      let checkOrderId = false; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
      let checkAmount = false; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
      const dataOrder = await this.orderService.findById(orderId?.toString() || "");

      let dataRedirect = "https://ieltshunter.io" + "/orders/detail/" + dataOrder?._id?.toString();
      if (dataOrder?.deep_link) {
        dataRedirect = dataOrder?.deep_link;
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
                const dataUpdate = {
                  _id: orderId?.toString(),
                  status: "success",
                };
                await this.orderService.update(dataUpdate);
                await this.updateOrderAfter(orderId?.toString(), dataOrder?.status?.toString());
              } else {
                const dataUpdate = {
                  _id: orderId?.toString(),
                  status: "close",
                };
                await this.orderService.update(dataUpdate);
              }
            } else {
              const dataUpdate = {
                _id: orderId?.toString(),
                status: "close",
              };
              await this.orderService.update(dataUpdate);
            }
          } else {
            const dataUpdate = {
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
  // async createNewOrder(createOrderData: CreateOrderDto, res: Response, req: ExpressRequestDto) {
  //   try {
  //     const userObject = req?.user_object;
  //     if (!userObject) {
  //       throw new ForbiddenException("User is invalid");
  //     }
  //     const userId = userObject._id.toString();

  //     const planObject = await this.planService.findById(createOrderData.plan_id);
  //     const oldOrder = await this.orderService.findOne({});
  //     let oldShortId = 1;
  //     if (oldOrder) {
  //       oldShortId = Number(oldOrder.short_id) + 1;
  //     }
  //     const channelId = req?.channel_id || "";
  //     if (channelId) {
  //       createOrderData = { ...createOrderData, ...{ channel_id: channelId } };
  //     }

  //     //Check Plan Service
  //     if (!createOrderData?.payment_method && !Number(planObject?.trial_day) && Number(planObject?.price)) {
  //       throw new ForbiddenException("Payment method need!");
  //     }

  //     //Kiểm tra trường hợp có ngày dùng thử
  //     if (Number(planObject?.trial_day)) {
  //       //Check Subscribe
  //       const subscribe = await this.subscribeService.filter(
  //         {
  //           user_id: userId,
  //           service_id: planObject?.service_id?.toString(),
  //           channel_id: channelId,
  //         },
  //         { createdAt: "DESC" },
  //         1,
  //         1
  //       );
  //       // console.log(subscribe, "subscribe");
  //       //Trường hợp Đã tồn tại một gói đăng ký của người dùng
  //       if (subscribe?.length) {
  //         //Kiểm tra xem Extension đó có phí hay không
  //         if (Number(planObject?.price)) {
  //           if (!createOrderData?.payment_method) {
  //             //Trả về lỗi
  //             throw new ForbiddenException("Payment method need!");
  //           } else {
  //             //Trường hợp này khách thanh toán bình thường nó sẽ chạy tới hàm tiếp theo và sẽ bị tính tiền!
  //           }
  //         } else {
  //           //Trường hợp còn lại là trường hợp miễn phí
  //           createOrderData = { ...createOrderData, ...{ payment_method: "free" } };
  //         }
  //       } else {
  //         //Trường hợp này là chưa có gói đăng ksy, tiến hành cập nhập cho khách thành free và trạng thái đơn chuyển về thành công!
  //         createOrderData = { ...createOrderData, ...{ payment_method: "free", status: "success" } };
  //       }
  //     }

  //     //Cập nhập lại payment_method nếu gói miễn phí!
  //     if (!Number(planObject?.price)) {
  //       createOrderData = { ...createOrderData, ...{ payment_method: "free" } };
  //     }

  //     if (planObject) {
  //       let couponProduct = null;

  //       if (createOrderData.coupon_product_id)
  //         couponProduct = await this.couponService.findOne({ _id: createOrderData.coupon_product_id });

  //       const orderPrice = this.getOrderPrice(couponProduct, planObject.price, createOrderData.amount_of_package);

  //       let dataToAdd = {
  //         ...createOrderData,
  //         ...{
  //           user_id: userId,
  //           service_name: planObject.handle,
  //           service_id: planObject.service_id,
  //           plan_id: planObject._id.toString(),
  //           plan_type: planObject.type,
  //           short_id: oldShortId,
  //           price: orderPrice,
  //           coupon_product_id: createOrderData.coupon_product_id,
  //         },
  //       };

  //       if (planObject?.service_id?.service_type == "channel") {
  //         dataToAdd = { ...dataToAdd, ...{ trans_id: req?.channel_id?.toString() } };
  //       }

  //       if (createOrderData?.payment_method === "vn_pay") {
  //         // Lấy thời điểm hiện tại
  //         const currentTime = new Date();

  //         // Lấy thời điểm hiện tại dưới dạng số miligiây
  //         const currentTimeInMilliseconds = currentTime.getTime();

  //         // Cộng thêm 5 giây (5,000 miligiây)
  //         const newTimeInMilliseconds = currentTimeInMilliseconds + 4000;

  //         // Tạo đối tượng Date mới với thời điểm sau khi cộng
  //         const newTime = new Date(newTimeInMilliseconds);
  //         dataToAdd = { ...dataToAdd, ...{ vnpay_on: newTime } };
  //       }
  //       let dataCreate: Order = await this.orderService.create(dataToAdd);

  //       //Hậu xử lý!
  //       //Nếu là chuyển khoản thì bay tới trang detail luôn!
  //       if (dataCreate.payment_method == "transfer") {
  //         //Return after
  //         const redirectUrl = `/r/orders/detail/${dataCreate?._id?.toString()}`;
  //         const dataUpdate = { _id: dataCreate?._id?.toString(), redirect_url: redirectUrl };
  //         dataCreate = await this.orderService.update(dataUpdate);
  //         return res
  //           .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
  //           .status(HttpStatus.OK)
  //           .json(dataCreate);
  //       }

  //       //Trường hợp này là payment_method là miễn phí!
  //       if (dataCreate.payment_method == "free") {
  //         const redirectUrl = `/r/orders/detail/${dataCreate?._id?.toString()}`;
  //         const dataUpdate = { _id: dataCreate?._id?.toString(), redirect_url: redirectUrl, status: "success" };
  //         dataCreate = await this.orderService.update(dataUpdate);
  //         dataCreate = await this.updateOrderAfter(dataCreate?._id?.toString(), "pending");
  //         return res
  //           .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
  //           .status(HttpStatus.OK)
  //           .json(dataCreate);
  //       }
  //       if (dataCreate.payment_method == "vn_pay") {
  //         const redirectUrl = await this.createVNPayLink(req, orderPrice, "", "", dataCreate?._id?.toString());
  //         const dataUpdate = { _id: dataCreate?._id?.toString(), redirect_url: redirectUrl?.toString() };
  //         dataCreate = await this.orderService.update(dataUpdate);
  //         return res
  //           .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
  //           .status(HttpStatus.OK)
  //           .json(dataCreate);
  //       }

  //       if (dataCreate?.status == "success") {
  //         //Update After

  //         //Update Channel
  //         const redirectUrl = `/r/orders/detail/${dataCreate?._id?.toString()}`;
  //         const dataUpdate = { _id: dataCreate?._id?.toString(), redirect_url: redirectUrl };
  //         dataCreate = await this.orderService.update(dataUpdate);
  //         dataCreate = await this.updateOrderAfter(dataCreate?._id?.toString(), "pending");
  //         return res
  //           .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
  //           .status(HttpStatus.OK)
  //           .json(dataCreate);
  //       }

  //       return res
  //         .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
  //         .status(HttpStatus.OK)
  //         .json(dataCreate);
  //     } else {
  //       throw new BadRequestException("Plan not found!");
  //     }
  //   } catch (error) {
  //     throw new NotFoundException(error.message);
  //   }
  // }

  getOrderPrice(couponProduct: Coupon, productPrice: number, productAmount = 1) {
    let price = productPrice * productAmount || 0;

    if (couponProduct) {
      price = this.couponService.getPrice(price, couponProduct);
    }

    return price;
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
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }
      const dataToFilter = { ...query };

      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const dataReturn = await this.orderService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.orderService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getOrdersByStatus(status: string) {
    try {
      const dataReturn = await this.orderService.getOrdersByStatus(status);
      return dataReturn;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getListPaymentMethod(query: ListPaymentMethodDto, res: Response, req: ExpressRequestDto) {
    try {
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json([OrderPaymentMethod.VNPAY, OrderPaymentMethod.TRANSFER]);
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
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();

      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }
      const dataToFilter = { ...query, ...{ user_id: userId } };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const dataReturn = await this.orderService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.orderService.count(dataToFilter);
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
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      //Check Permission
      const dataReturn = await this.orderService.findById(id.toString());

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
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
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      // const userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      // let havePermission = false;
      // if (
      //   userPermission?.channel_role == "mentor" ||
      //   userPermission?.channel_role == "super_admin" ||
      //   (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("order/list") !== -1)
      // ) {
      //   havePermission = true;
      // }
      // if (await this.userPermissionService.isHavePermission(userId, "order/list")) {
      //   havePermission = true;
      // }
      // if (!havePermission) {
      //   throw new ForbiddenException("You not have permission for this activity!");
      // }

      //Check Order
      //Check Permission
      // if (await this.userPermissionService.isHavePermission(userId, "order/update")) {
      const dataReturn = await this.orderService.update(dataUpdate);
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

  // /**
  //  * @author Tony Vu
  //  * @param id
  //  * @param res
  //  * @param req
  //  * @returns
  //  */
  async handleUpdateOrderByUser(dataUpdate: UpdateOrderDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      //Check Permission
      //Check Order Object
      const orderObject = await this.orderService.findById(dataUpdate?._id?.toString());
      if (orderObject) {
        const userCreate = orderObject?.user_id?._id?.toString();
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
          const dataReturn = await this.orderService.update(dataUpdate);

          try {
            setTimeout(async () => {
              // const adminUsers = await this.userService.findAll({
              //   user_role: "admin",
              // });
              // for (const adminUser of adminUsers) {
              //   this.eventHookNotificationService.sendNotiNMailPaySuccess({
              //     user_id: adminUser._id.toString(),
              //     path: `/orders/detail/${orderObject._id.toString()}`,
              //     content: (params: any) => {
              //       return `${orderObject?.user_id?.display_name} has successfully placed an order ${orderObject.items
              //         .map((item) => item.service_name)
              //         .toString()}`;
              //     },
              //     title: `${orderObject?.user_id.display_name.toLocaleUpperCase()} HAS SUCCESSFULLY PLACED AN ORDER ${orderObject.items
              //       .map((item) => item.service_name.toLocaleUpperCase())
              //       .toString()}`,
              //   });
              // }

              this.telegramService.sendMessage({
                chat_id: process.env.TELEGRAM_ROOM_ID,
                text: `<b>===================</b>\n<b>THÔNG BÁO GIAO DỊCH</b>\nLoại: <b>Chuyển khoản</b>\nMã đơn hàng: ${orderObject.short_id}\nGhi chú đơn hàng: ${dataUpdate.order_note}`,
                parse_mode: "HTML",
              });
            }, 500);
          } catch (error) {}

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
        return null;
      }

      if (orderObject.status == "success" && beforeStatus == "pending") {
        let dataToCreate = null;
        for (const orderItem of orderObject.items) {
          const amountOfDay = Number(orderItem.plan_id.amount_of_day);
          const date = new Date();
          date.setDate(date.getDate() + amountOfDay);
          const endTime = date;
          const dataIsTrial = orderObject.payment_method == "free" ? true : false;
          //Update subscribe
          const dataSubscribe = {
            is_trial: dataIsTrial,
            user_id: orderObject.user_id?._id.toString(),
            service_name: orderItem.service_name,
            service_id: orderItem.service_id?._id.toString(),
            plan_id: orderItem.plan_id._id.toString(),
            status: "active",
            start_at: new Date(),
            end_at: endTime,
          };
          dataToCreate = await this.subscribeService.create(dataSubscribe);

          // handle transaction
          this.handleUpdateOrderAfterTransaction(
            orderObject.user_id._id.toString(),
            orderItem.plan_id.user_id.toString(),
            orderItem.amount_of_package * orderItem.plan_id.price,
            orderItem.plan_id.ref_id.toString(),
            orderItem.type,
            orderObject.invitation_code
          );

          //Check if service is Extension
          if (orderItem.service_id?.service_type == "course") {
            await this.handleUpdateCourseAfter(orderObject);
            const dataUpdate = {
              _id: orderObject._id?.toString(),
              product_url: "/r/courses/view/" + orderItem.service_id?.handle?.toString(),
            };
            orderObject = await this.orderService.update(dataUpdate);
          }

          // check order payload to add member to class
          if (orderItem.payload) {
            if (orderItem.payload.type === PayloadType.CLASS) {
              const data = orderItem.payload.data;
              await this.courseHelper.addMemberToClass(data, null, null);
            } else if (orderItem.payload.type === PayloadType.ONE_ONE) {
              const data = orderItem.payload.data;
              await this.courseHelper.createCourseCalendarStudent(data, null, null);
            }
          }

          // send notification to user who own the course
          if (orderItem.type === TransactionRefType.COURSE) {
            const planCourseData = await this.planService.getCourseByPlanId(orderItem.plan_id?._id.toString());
            this.eventHookNotificationService.sendNotiNMailOrderSuccess({
              user_id: planCourseData[0]?.course[0]?.user_id.toString(),
              // TODO: update path
              path: `/r/course/${orderObject._id.toString()}`,
              router: NotificationRouter.NAVIGATION_PURCHASE_SUCCESS_COURSE_SCREEN,
              order_id: orderObject._id?.toString(),
              content: (params: any) => {
                return `${orderObject.user_id?.display_name} has successfully placed an order for ${orderObject.items
                  .map((item) => item.service_name)
                  .toString()}`;
              },
              title: `${orderObject.user_id.display_name.toLocaleUpperCase()} HAS SUCCESSFULLY PLACED AN ORDER FOR ${orderObject.items
                .map((item) => item.service_name.toLocaleUpperCase())
                .toString()}`,
            });
          }

          // update point for user
          // update coin for referral user
          if ([TransactionRefType.COURSE, TransactionRefType.PRODUCT].includes(orderItem.type)) {
            const entityTarget =
              orderItem.type === TransactionRefType.COURSE
                ? UserPointHistory_EntityTarget.COURSE
                : UserPointHistory_EntityTarget.PRODUCT;
            const redeemTarget =
              orderItem.type === TransactionRefType.COURSE
                ? orderObject.payment_method === "free"
                  ? RedeemMissionActionTarget.FREE_COURSE
                  : RedeemMissionActionTarget.COURSE
                : RedeemMissionActionTarget.PRODUCT;

            // update point for user
            const data: AddPointToUserData = {
              user_id: orderObject.user_id._id.toString(),
              point: orderObject.payment_method === "free" ? 10 : Math.floor(orderObject.price / 10000),
              entity_id: orderItem?.plan_id._id?.toString(),
              entity_target: entityTarget,
              entity_action: UserPointHistory_EntityAction.BUY,
            };
            this.eventHookWorkerService.AddPointToUser(data);

            // update redeem for user
            this.redeemUserService.updateUserRedeem(orderObject.user_id, RedeemMissionActionType.BUY, redeemTarget);

            // update coin for referral user
            // update redeem mission for user
            if (orderObject.invitation_code) {
              // update coin for referral user
              this.referralService.processBuyProductBonusForReferralUser(
                orderObject.invitation_code,
                orderObject.user_id,
                orderObject.price,
                orderItem.plan_id.ref_id.toString()
              );

              // update redeem mission for user
              const referralUser = await this.userService.findOne({
                invitation_code: orderObject.invitation_code,
              });
              if (referralUser)
                this.redeemUserService.updateUserRedeem(referralUser, RedeemMissionActionType.BUY, redeemTarget);
            }
          }
        }

        // should update coupon total
        if (orderObject.coupon_product_id) {
          const couponProduct = await this.couponService.findOne({ _id: orderObject.coupon_product_id });
          if (couponProduct) {
            if (couponProduct.total > 0)
              this.couponService.update({
                _id: orderObject.coupon_product_id,
                total: couponProduct.total - 1,
              });
          }
        }

        // send notification to user who bought the course
        this.eventHookNotificationService.sendNotiNMailOrderSuccess({
          user_id: orderObject.user_id?._id.toString(),
          path: `/r/orders/detail/${orderObject._id.toString()}`,
          router: NotificationRouter.NAVIGATION_PURCHASE_SUCCESS_SCREEN,
          order_id: orderObject._id?.toString(),
          content: (params: any) => {
            return `${orderObject.user_id?.display_name} has successfully placed an order for ${orderObject.items
              .map((item) => item.service_name)
              .toString()}`;
          },
          title: `${orderObject.user_id.display_name.toLocaleUpperCase()} HAS SUCCESSFULLY PLACED AN ORDER FOR ${orderObject.items
            .map((item) => item.service_name.toLocaleUpperCase())
            .toString()}`,
        });

        // send success_order email to user who bought the course
        this.emailService.send({
          eventName: EmailPattern.SUCCESS_ORDER,
          email: orderObject.user_id.user_email,
          language: orderObject.user_id.default_language,
          replacePattern: {
            display_name: orderObject.user_id.display_name,
            course_name: orderObject.items.map((item) => item.service_name).toString(),
            course_start_time: moment(dataToCreate.start_at.toString())
              .tz(orderObject.user_id.timezone || "UTC")
              .format("DD-MM-YYYY HH:mm"),
            course_end_time: moment(dataToCreate.end_at.toString())
              .tz(orderObject.user_id.timezone || "UTC")
              .format("DD-MM-YYYY HH:mm"),
          },
        });

        // send invoice_order email to user who bought the course
        this.emailService.send({
          eventName: EmailPattern.INVOICE_ORDER,
          email: orderObject.user_id.user_email,
          language: orderObject.user_id.default_language,
          replacePattern: {
            display_name: orderObject.user_id.display_name,
            order_id: orderObject._id.toString(),
            order_name: orderObject.items?.map((item) => item.service_name)?.toString(),
            order_price: orderObject.price,
            order_date: moment()
              .tz(orderObject.user_id.timezone || "UTC")
              .format("DD-MM-YYYY HH:mm"),
          },
        });

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
      for (const orderItem of orderObject.items) {
        if (orderItem.type === TransactionRefType.COURSE) {
          const dataUpdate = {
            user_id: orderObject?.user_id?._id.toString(),
            course_id: orderItem?.service_id?.handle?.toString(),
          };
          const dataReturn = await this.courseUserService.update(dataUpdate);

          //Update count Video
          const dataUpdateFilter = {
            _id: orderItem?.service_id?.handle?.toString(),
          };
          const dataCourse = await this.courseService.updateCount(dataUpdateFilter, { join_number: 1 });
        }
      }
      //Update Transaction

      //For User
      //Get Current User permission
      // const channelId = dataCourse?.channel_id?.toString();
      // const userPermissionFilter = {
      //   user_id: orderObject?.user_id?._id.toString(),
      //   channel_id: channelId,
      // };
      // const dataPermission = await this.channelPermissionService.findOneWithPopulate(userPermissionFilter);
      // let bossCommission = 100;

      // const dataChannel = await this.channelService.findById(channelId);
      // const userCommision = Number(dataChannel?.user_commission) || 0;
      // let mentorCommission = Number(dataChannel?.mentor_commission) || 0;

      // let isUserCommision = false;
      // const transactionValue = Number(orderObject?.price);

      // if (dataPermission?.from_user) {
      //   //Check user From
      //   const dataPermissionFromUser = await this.channelPermissionService.findOneWithPopulate({
      //     user_id: dataPermission?.from_user?.toString(),
      //     channelId,
      //   });
      //   if (dataPermissionFromUser?.channel_role !== "mentor") {
      //     isUserCommision = true;

      //     bossCommission = bossCommission - userCommision;
      //     //Check
      //     let transactionUser = transactionValue * (userCommision / 100);
      //     transactionUser = Math.round(transactionUser * 100) / 100;
      //     //Update for Bosss
      //     await this.handleCreateTransaction(
      //       dataPermission?.from_user?.toString(),
      //       transactionUser,
      //       orderObject,
      //       dataCourse,
      //       channelId,
      //       userCommision
      //     );
      //     this.eventHookWorkerService.PlusPointChallengePusher({
      //       user_id: dataPermission?.from_user?.toString(),
      //       game_type: "revenue",
      //       channel_id: channelId,
      //       point_value: Number(transactionValue),
      //       display_name: dataPermissionFromUser?.user_id?.display_name.toString(),
      //     });
      //     this.eventHookNotificationService.sendNotiMentorReceiveCommission({
      //       send_user_id: dataChannel?.user_id?._id?.toString(),
      //       user_id: dataPermission?.from_user?.toString(),
      //       channel_id: channelId,
      //       path: `r/mentor/income`,
      //       mail_template: "commission_receive_mentor",
      //       content: (params: any) => {
      //         return `Chúc mừng người dùng ${dataPermissionFromUser?.user_id?.display_name} nhận được hoa hồng từ hóa đơn ${orderObject.service_name} kênh ${params?.channel_name}`;
      //       },
      //       title: `${dataPermissionFromUser?.user_id?.display_name.toLocaleUpperCase()} NHẬN ĐƯỢC TIỀN HOA HỒNG`,
      //     });
      //   }
      // }

      // if (dataPermission?.from_mentor) {
      //   //Check user From
      //   const dataPermissionFromUser = await this.channelPermissionService.findOneWithPopulate({
      //     user_id: dataPermission?.from_mentor?.toString(),
      //     channelId,
      //   });
      //   if (dataPermissionFromUser?.channel_role !== "mentor") {
      //     if (isUserCommision) {
      //       mentorCommission = mentorCommission - userCommision;
      //     }
      //     bossCommission = bossCommission - mentorCommission;
      //     //Check
      //     let transactionUser = transactionValue * (mentorCommission / 100);
      //     transactionUser = Math.round(transactionUser * 100) / 100;
      //     //Update for Bosss
      //     await this.handleCreateTransaction(
      //       dataPermission?.from_mentor?.toString(),
      //       transactionUser,
      //       orderObject,
      //       dataCourse,
      //       channelId,
      //       mentorCommission
      //     );
      //     this.eventHookWorkerService.PlusPointChallengePusher({
      //       user_id: dataPermission?.from_mentor?.toString(),
      //       game_type: "revenue",
      //       channel_id: channelId,
      //       point_value: Number(transactionValue),
      //       display_name: dataPermissionFromUser?.user_id?.display_name.toString(),
      //     });

      //     this.eventHookNotificationService.sendNotiMentorReceiveCommission({
      //       send_user_id: dataChannel?.user_id?._id?.toString(),
      //       user_id: dataPermission?.from_mentor?.toString(),
      //       channel_id: channelId,
      //       path: `r/mentor/income`,
      //       mail_template: "commission_receive_mentor",
      //       content: (params: any) => {
      //         return `Chúc mừng người dùng ${dataPermissionFromUser?.user_id?.display_name} nhận được hoa hồng từ hóa đơn ${orderObject.service_name} kênh ${params?.channel_name}`;
      //       },
      //       title: `${dataPermissionFromUser?.user_id?.display_name.toLocaleUpperCase()} NHẬN ĐƯỢC TIỀN HOA HỒNG`,
      //     });
      //   }
      // }

      //Plus money for boss
      // let bossTransactionValue = transactionValue * (bossCommission / 100);
      // bossTransactionValue = Math.round(bossTransactionValue * 100) / 100;

      // const bossUserPermissionArray = await this.channelPermissionService.filter(
      //   { channel_id: channelId, channel_role: "mentor" },
      //   {},
      //   1,
      //   100
      // );

      // for (const bossItem of bossUserPermissionArray) {
      //   //Check User Permission
      //   //Update for Bosss

      //   await this.handleCreateTransaction(
      //     bossItem?.user_id?._id?.toString(),
      //     bossTransactionValue,
      //     orderObject,
      //     dataCourse,
      //     channelId,
      //     bossCommission
      //   );
      //   setTimeout(() => {
      //     this.eventHookNotificationService.sendNotiUserBuyGoodsForBoss({
      //       send_user_id: dataChannel?.user_id?._id?.toString(),
      //       user_id: bossItem?.user_id?._id?.toString(),
      //       channel_id: channelId,
      //       path: `r/mentor/income`,
      //       mail_template: "success_buy_goods",
      //       content: (params: any) => {
      //         return `Chúc mừng người dùng ${dataPermission?.user_id?.display_name} thanh toán hóa đơn ${orderObject.service_name} kênh ${params?.channel_name}`;
      //       },
      //       title: `${dataPermission?.user_id?.display_name?.toLocaleUpperCase()} THANH TOÁN HÓA ĐƠN`,
      //     });
      //   }, 500);
      // }
    } catch (error) {
      console.log(error, "error Transation");
    }
  }

  // async handleCreateTransaction(
  //   userIdTransaction: string,
  //   transactionValue: number,
  //   orderObject: Order,
  //   dataCourse: Course,
  //   channelId: string,
  //   commmissionValue: number
  // ) {
  //   const dataFilter = {
  //     user_id: userIdTransaction,
  //   };
  //   const newDataTransaction = await this.transactionService.findOne(dataFilter);
  //   let lastToken = 0;
  //   if (newDataTransaction) {
  //     lastToken = Number(newDataTransaction.current_token);
  //   }
  //   let currentToken = 0;
  //   currentToken = lastToken + Number(transactionValue);

  //   for (const orderItem of orderObject.items) {
  //     const dataTransactionToAdd = {
  //       user_id: userIdTransaction,
  //       channel_id: channelId,
  //       ref_id: orderItem?.service_id?.handle?.toString(),
  //       ref_type: "Course",
  //       ref_name: dataCourse?.title?.toString(),
  //       ref_url: `/r/courses/view/${orderItem?.service_id?.handle?.toString()}`,
  //       last_coin: 0,
  //       current_coin: 0,
  //       last_token: lastToken,
  //       current_token: currentToken,
  //       transaction_value: transactionValue,
  //       commission_value: commmissionValue,
  //       transaction_type: "output",
  //       income_value: 0,
  //       method: "plus",
  //       note: `Recive ${transactionValue} coin from System ID: ${orderItem?.service_id?.handle?.toString()}`,
  //       status: "done",
  //       trans_id: "",
  //       error_message: "",
  //       data_payment: "",
  //       billing_on: new Date(),
  //       processing_on: null,
  //       successfully_on: new Date(),
  //       from_user: orderObject?.user_id?._id.toString(),
  //       type_system: "system",
  //     };
  //     const dataTransaction = await this.transactionService.create(dataTransactionToAdd);
  //   }
  //   // setTimeout(() => {

  //   //   console.log("đã vào cộng điểm!!!");
  //   //   this.eventHookWorkerService.PlusPointChallengePusher({
  //   //     user_id: orderObject?.user_id?._id.toString(),
  //   //     game_type: "revenue",
  //   //     channel_id: channelId,
  //   //     point_value: transactionValue,
  //   //     display_name: orderObject?.user_id?.display_name.toString(),
  //   //   });
  //   //   this.eventHookNotificationService.sendNotiMentorReceiveCommission({
  //   //     user_id: orderObject?.user_id?._id.toString(),
  //   //     channel_id: channelId,
  //   //     path: `r/mentor/income`,
  //   //     mail_template: "commission_receive_mentor",
  //   //     content: (params: any) => {
  //   //       return `Chúc mừng người dùng ${dataPermission?.from_user?.display_name} nhận được hoa hồng từ hóa đơn ${orderObject.service_name} kênh ${params?.channel_name}`;
  //   //     },
  //   //     title: `${dataPermission?.from_user?.display_name.toLocaleUpperCase()} NHẬN ĐƯỢC TIỀN HOA HỒNG`,
  //   //   })
  //   // }, 300);
  // }

  /**
   *
   * @param orderObject
   * @param subscribeObject
   */
  async updateEsim(orderObject: Order, subscribeObject: Subscribe) {
    try {
      for (const orderItem of orderObject.items) {
        const planNote = orderItem?.plan_id?.note;
        const planObject = orderItem?.plan_id?.options;
        let urlAxios = "";
        let authCode = "";
        let packageName = "";
        let bodyData = "";
        let contentType = "application/json";
        for (const itemOption of planObject) {
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
        const dataReturn = await axios
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

              // const dataSendSocket = await this.subscribeService.findById(subscribeObject?._id);
              //Update socket
              // this.socketService.handleSendOrder(dataSendSocket, orderObject?.user_id?._id?.toString());
              break;
          }
        }
        return true;
      }
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

    const date = new Date();
    const createDate = moment(date).format("YYYYMMDDHHmmss");

    const ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress;

    const tmnCode = process.env.VNPAY_TMNCODE;
    const secretKey = process.env.VNPAY_SECRET_KEY;
    let vnpUrl = process.env.VNPAY_URL;
    const returnUrl = process.env.VNPAY_RETURN_URL;
    // let orderId = moment(date).format("DDHHmmss");

    if (locale === null || locale === "") {
      locale = "vn";
    }
    const currCode = "VND";
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
    const querystring = require("qs");
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
    return vnpUrl;
  }

  sortObject(obj: any) {
    const sorted = {};
    const str = [];
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

  async createNewOrder(data: CreateOrderDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();

      // check order payload
      try {
        await this.checkOrderPayload(data.plan_objects);
      } catch (e) {
        throw new BadRequestException(e.message);
      }

      if (data.coupon_product_id) {
        const coupon = await this.couponService.findOne({ _id: data.coupon_product_id });
        if (!this.couponService.isUsedAble(coupon)) throw new Error("Coupon is expired or not available yet");
      }

      const planObjects = await this.planService.findAll({
        _id: { $in: data.plan_objects.map((plan) => plan.plan_id) },
      });
      const lastOrder = await this.orderService.findOne({});
      let oldShortId = 1;
      if (lastOrder) {
        oldShortId = Number(lastOrder.short_id) + 1;
      }

      //Check Plan Service
      if (!data?.payment_method) {
        throw new ForbiddenException("Payment method need!");
      }

      if (planObjects.length) {
        let dataToAdd = null;
        let couponProduct = null;
        let orderPrice = 0;
        const orderItems = [];

        for (const planObject of planObjects) {
          const currentPlan = data.plan_objects.find((plan) => plan.plan_id === planObject._id.toString());

          const item: any = {
            service_name: planObject.name,
            service_id: planObject.service_id,
            plan_id: planObject._id,
            plan_type: planObject.type,
            type: currentPlan.type,
            amount_of_package: currentPlan.amount_of_package,
          };

          if (currentPlan.type === TransactionRefType.COURSE) {
            item.payload = currentPlan.payload;
          }

          orderItems.push(item);
          orderPrice += planObject.price * currentPlan.amount_of_package;
        }
        dataToAdd = {
          ...data,
          ...{
            user_id: userId,
            items: orderItems,
            short_id: oldShortId,
            coupon_product_id: data.coupon_product_id,
          },
        };
        if (data?.payment_method === "vn_pay") {
          // Lấy thời điểm hiện tại
          const currentTime = new Date();

          // Lấy thời điểm hiện tại dưới dạng số miligiây
          const currentTimeInMilliseconds = currentTime.getTime();

          // Cộng thêm 5 giây (5,000 miligiây)
          const newTimeInMilliseconds = currentTimeInMilliseconds + 4000;

          // Tạo đối tượng Date mới với thời điểm sau khi cộng
          const newTime = new Date(newTimeInMilliseconds);
          dataToAdd = { ...dataToAdd, ...{ vnpay_on: newTime } };
        }

        if (data.coupon_product_id) couponProduct = await this.couponService.findOne({ _id: data.coupon_product_id });
        orderPrice = this.getOrderPrice(couponProduct, orderPrice);
        dataToAdd = {
          ...dataToAdd,
          price: orderPrice,
        };
        let dataCreate: Order = await this.orderService.create(dataToAdd);

        //Hậu xử lý!
        //Nếu là chuyển khoản thì bay tới trang detail luôn!
        if (dataCreate.payment_method == "transfer") {
          //Return after
          const redirectUrl = `/r/orders/detail/${dataCreate?._id?.toString()}`;
          const dataUpdate = { _id: dataCreate?._id?.toString(), redirect_url: redirectUrl };
          dataCreate = await this.orderService.update(dataUpdate);
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json(dataCreate);
        }
        if (dataCreate.payment_method == "vn_pay") {
          const redirectUrl = await this.createVNPayLink(req, orderPrice, "", "", dataCreate?._id?.toString());
          const dataUpdate = { _id: dataCreate?._id?.toString(), redirect_url: redirectUrl?.toString() };
          dataCreate = await this.orderService.update(dataUpdate);
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json(dataCreate);
        }

        if (dataCreate?.status == "success") {
          //Update After

          //Update Channel
          const redirectUrl = `/r/orders/detail/${dataCreate?._id?.toString()}`;
          const dataUpdate = { _id: dataCreate?._id?.toString(), redirect_url: redirectUrl };
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
        throw new BadRequestException("No plan not found!");
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async checkOrderPayload(plan_objects: PlanObject[]) {
    let isValid = false;
    for (const planObject of plan_objects) {
      switch (planObject.payload.type) {
        case PayloadType.CLASS: {
          isValid = await this.courseHelper.checkMemberToClassV2(planObject.payload.data as AddMemberCourseClassDto);
          break;
        }
        case PayloadType.ONE_ONE: {
          isValid = await this.courseHelper.checkCourseCalendarStudentV2(
            planObject.payload.data as CreateCourseOneOneStudentDto
          );
          break;
        }
        default: {
          isValid = true;
          break;
        }
      }
    }
    return isValid;
  }

  async handleUpdateOrderAfterTransaction(
    fromUserId: string,
    targetUserId: string,
    tokenValue: number,
    refId: string,
    refType: string,
    invitationCode?: string
  ) {
    try {
      let referralUser: User = undefined;
      const dataFilter = {
        user_id: targetUserId,
      };
      const oldDataTransaction = await this.transactionService.findOne(dataFilter);
      let lastCoin = 0;
      let lastToken = 0;
      if (oldDataTransaction) {
        lastToken = Number(oldDataTransaction.current_token);
        lastCoin = Number(oldDataTransaction.current_coin);
      }
      if (invitationCode) {
        referralUser = await this.userService.findOne({ invitation_code: invitationCode });
      }
      const newDataCreate = {
        user_id: targetUserId,
        from_user: fromUserId,
        referral_user: referralUser?._id?.toString(),
        current_coin: lastCoin,
        last_coin: lastCoin,
        current_token: lastToken + tokenValue,
        last_token: lastToken,
        note: `Withdrawal ${tokenValue} token from System ID: ${targetUserId}`,
        billing_on: new Date(),
        processing_on: new Date(),
        successfully_on: new Date(),
        method: "plus",
        trans_id: "",
        ref_id: refId,
        ref_type: refType,
        status: "done",
        transaction_value: tokenValue,
        transaction_value_type: TransactionValueType.TOKEN,
      };
      this.transactionService.create(newDataCreate);
      this.userService.update({ _id: targetUserId, current_token: newDataCreate.current_token });
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
