import { ForbiddenException, HttpStatus, Injectable } from "@nestjs/common";
import axios from "axios";
import { Response } from "express";
import Verifier from "google-play-billing-validator";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { JwtHelperService } from "../../../modules/core/services/jwt_helper.service";
// import { OrderHelper } from "../../../modules/order/helper/OrderHelper";
import { Order } from "../../../modules/order/schemas/order.schema";
import { OrderService } from "../../../modules/order/services/order.service";
import { PlanService } from "../../../modules/plan/services/plan.service";
import { SubscribeService } from "../../../modules/subscribe/services/subscribe.service";
import { TransactionHelper } from "../../../modules/transaction/helper/transaction.helper";
import { UserService } from "../../../modules/user/services/user.service";
import { CreatePurchaseAppleDto } from "../dto/create-purchase_apple.dto";
import { CreatePurchaseGoogleDto } from "../dto/create-purchase_google.dto";
import { PurchaseService } from "../services/purchase.service";

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class PurchaseHelper {
  constructor(
    private planService: PlanService,
    private subscribeService: SubscribeService,
    private purchaseService: PurchaseService,
    private orderService: OrderService,
    // private orderHelper: OrderHelper,
    private appUserService: UserService,
    private jwtHelper: JwtHelperService,
    private transactionHelper: TransactionHelper
  ) {}

  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewPurchaseGoogle(createPurchaseData: CreatePurchaseGoogleDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      const authCode = req?.auth_code;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      const orderObject = await this.orderService.findById(createPurchaseData?.local_order_id);
      if (!orderObject) {
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json({});
      }

      if (orderObject?.user_id?._id.toString() !== userId) {
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json({});
      }

      if (orderObject.status === "success") {
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json({});
      }
      //Validate Google
      const dataValidate = await this.validateGoogle(createPurchaseData, orderObject);

      if (dataValidate === "success") {
        //Update Order
        const dataUpdate = {
          _id: createPurchaseData?.local_order_id.toString(),
          status: "success",
          payment_method: orderObject.payment_method,
          order_note: orderObject.order_note,
        };
        await this.orderService.update(dataUpdate);
        // if (orderObject.plan_type !== "coin") {
        //   //Update Subscribe
        //   await this.orderHelper.updateOrderAfter(createPurchaseData?.local_order_id);
        // }
        // await this.sendNotificationPublisher(userObject, req, res, userObject?.country?.toString());
        const timeToSave = new Date(Number(createPurchaseData?.purchase_time) * 1000);
        if (timeToSave.getTime() > 0) {
        } else {
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json({});
        }
        const dataToAdd = {
          ...createPurchaseData,
          ...{
            purchase_time: timeToSave,
            validate_status: dataValidate,
            purchase_method: "google",
          },
        };
        const dataCreate = await this.purchaseService.create(dataToAdd);

        for (const orderItem of orderObject.items) {
          if (orderItem.plan_type === "coin") {
            await this.transactionHelper.handleUpdateTransactionAfter(orderObject, userObject, dataCreate, authCode);
          }
        }
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataCreate);
      } else {
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json({});
      }
    } catch (error) {
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json({});
    }
  }

  /**
   *
   * @param id
   * @param res
   * @param req
   */
  async validatePurchase(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const purchaseObject = await this.purchaseService.findById(id);
      console.log(purchaseObject);
      if (purchaseObject?.local_order_id?.payment_method == "google_payment") {
        const createPurchaseData: any = {
          order_id: purchaseObject.order_id,
          local_order_id: purchaseObject.local_order_id._id.toString(),
          product_id: purchaseObject.product_id,
          purchase_token: purchaseObject.purchase_token,
          purchase_time: purchaseObject.purchase_time,
          purchase_state: purchaseObject.purchase_state,
          acknowledged: purchaseObject.acknowledged,
          package_name: purchaseObject.package_name,
          quantity: purchaseObject.quantity,
          developer_payload: purchaseObject.developer_payload.toString() || "abc",
        };
        const orderObject = purchaseObject.local_order_id;
        //Validate with Google
        const dataValidate = await this.validateGoogle(createPurchaseData, orderObject);
        console.log(dataValidate);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataValidate);
      } else {
        //Validate with Apple
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json({});
      }
    } catch (error) {
      console.log(error);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json({});
    }
  }

  /**
   * @author Tony Vu
   * @param dataCreate
   * @param res
   * @param req
   * @returns
   */
  async createNewPurchaseApple(dataCreate: CreatePurchaseAppleDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      const authCode = req?.auth_code;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      const orderObject = await this.orderService.findById(dataCreate?.local_order_id);
      if (!orderObject) {
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json({});
      }

      if (orderObject?.user_id?._id.toString() !== userId) {
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json({});
      }

      if (orderObject.status === "success") {
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json({});
      }

      const data = JSON.stringify({
        "receipt-data": String(dataCreate?.purchase_token || ""),
      });
      const config = {
        method: "post",
        url: process.env.APPLE_VERIFY_PURCHASE || "https://sandbox.itunes.apple.com/verifyReceipt",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };
      const response = await axios(config);

      //Update Order
      const dataUpdate = {
        _id: dataCreate?.local_order_id.toString(),
        status: "success",
        payment_method: orderObject.payment_method,
        order_note: orderObject.order_note,
      };
      await this.orderService.update(dataUpdate);

      // await this.sendNotificationPublisher(userObject, req, res, userObject?.country?.toString());

      console.log(">> Paid from Apple: >>" + response.data.environment);
      const timeToSave = new Date(Number(dataCreate?.purchase_time) * 1000);
      if (timeToSave.getTime() > 0) {
      } else {
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json({});
      }

      const dataToAdd = {
        ...dataCreate,
        ...{
          purchase_time: timeToSave,
          validate_status: true,
          purchase_method: "apple",
        },
      };

      const dataReturn = await this.purchaseService.create(dataToAdd);

      for (const orderItem of orderObject.items) {
        if (orderItem.plan_type === "coin") {
          await this.transactionHelper.handleUpdateTransactionAfter(orderObject, userObject, dataReturn, authCode);
        }
      }

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataToAdd);
    } catch (error) {
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json({});
    }
  }

  /**
   *
   * @param dataCreate
   * @param orderObject
   * @returns
   */
  async validateAppleCron(dataCreate: CreatePurchaseAppleDto, orderObject: Order) {
    const data = JSON.stringify({
      "receipt-data": String(dataCreate?.purchase_token || ""),
      password: process.env.APPLE_SUBSCRIBE_SHARED_SECRET,
    });
    const config = {
      method: "post",
      url: process.env.APPLE_VERIFY_PURCHASE || "https://sandbox.itunes.apple.com/verifyReceipt",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };
    const response = await axios(config)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.log(error);
        return null;
      });
    if (response && response.data) {
      const dataReturn = response.data;
      if (dataReturn && Number(dataReturn.status) === 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   * @author Tony Vu
   * @param dataCreate
   * @returns
   */
  async validateGoogle(dataCreate: CreatePurchaseGoogleDto, orderObject: Order) {
    const options = {
      email: process.env.GOOGLE_IAP_SERVICE_ACCOUNT,
      key: process.env.GOOGLE_IAP_SERVICE_PRIVATE_KEY,
    };

    const verifier = new Verifier(options);
    let receipt = {
      packageName: dataCreate?.package_name,
      productId: dataCreate?.product_id,
      purchaseToken: dataCreate?.purchase_token,
    };

    try {
      for (const orderItem of orderObject.items) {
        if (orderItem?.plan_type === "recurring") {
          receipt = {
            ...receipt,
            ...{
              developerPayload: dataCreate?.developer_payload ? dataCreate.developer_payload : "abc",
            },
          };
          const checkResult: any = await verifier.verifySub(receipt);
          console.log(checkResult);
          if (checkResult.isSuccessful === false) throw new Error(checkResult.errorMessage);
        } else {
          const checkResult: any = await verifier.verifyINAPP(receipt);
          console.log(checkResult);
          if (checkResult.isSuccessful === false) throw new Error(checkResult.errorMessage);
          if (checkResult.payload.purchaseState !== 0) throw new Error("payment_pending");
        }
      }

      return "success";
    } catch (e) {
      console.log(e);
      //Update Order
      const dataUpdate = {
        _id: dataCreate?.local_order_id.toString(),
        status: "error",
        payment_method: orderObject.payment_method,
        order_note: orderObject.order_note,
      };
      await this.orderService.update(dataUpdate);
      throw new Error(e.errorMessage);
    }
  }

  /**
   * @author Tony Vu
   * @param dataCreate
   * @returns
   */
  async validateGoogleCron(dataCreate: CreatePurchaseGoogleDto, orderObject: Order) {
    const options = {
      email: process.env.GOOGLE_IAP_SERVICE_ACCOUNT,
      key: process.env.GOOGLE_IAP_SERVICE_PRIVATE_KEY,
    };

    const verifier = new Verifier(options);
    let receipt = {
      packageName: dataCreate?.package_name,
      productId: dataCreate?.product_id,
      purchaseToken: dataCreate?.purchase_token,
    };

    try {
      for (const orderItem of orderObject.items) {
        if (orderItem?.plan_type === "recurring") {
          receipt = {
            ...receipt,
            ...{
              developerPayload: dataCreate?.developer_payload ? dataCreate.developer_payload : "abc",
            },
          };
          const checkResult: any = await verifier.verifySub(receipt);
          //console.log(checkResult);
          if (checkResult.isSuccessful === false) return false;
        } else {
          const checkResult: any = await verifier.verifyINAPP(receipt);
          //console.log(checkResult);
          if (checkResult.isSuccessful === false) return false;
          if (checkResult.payload.purchaseState !== 0) return false;
        }
      }

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  /**
   * @author Tony Vu
   */
  async handleCronJob() {
    const dataFilter = {
      status_array: ["success", "trial"],
      plan_type: "recurring",
    };
    const dataOrder = await this.orderService.filter(dataFilter, {}, 1, 10000);
    console.log(dataOrder.length, ">>>> LENGTH");
    if (dataOrder) {
      for (const itemOrder of dataOrder) {
        for (const orderItem of itemOrder.items) {
          if (orderItem.plan_type === "onetime") {
            continue;
          }
          const purchaseData: any = await this.purchaseService.findOne({ local_order_id: itemOrder._id.toString() });
          if (purchaseData) {
            //Update by Google or Apple
            let dataValidate = null;

            if (itemOrder.payment_method === "google_payment") {
              dataValidate = await this.validateGoogleCron(purchaseData, itemOrder);
            } else {
              dataValidate = await this.validateAppleCron(purchaseData, itemOrder);
            }
            if (dataValidate) {
              const subscribeData = await this.subscribeService.filter(
                { service_name: orderItem.service_name.toString(), user_id: itemOrder?.user_id?._id.toString() },
                {},
                1,
                10
              );
              if (subscribeData) {
                let lastEnd = 0;
                for (const subscribeItem of subscribeData) {
                  const dataEnd = new Date(subscribeItem.end_at.toString());
                  const dataEndNumber = dataEnd.getTime();
                  if (dataEndNumber > lastEnd) {
                    lastEnd = dataEndNumber;
                  }
                }
                const totalData = Date.now() - lastEnd;
                const dataHour = totalData / (1000 * 60 * 60);
                if (dataHour < 3) {
                  //Create new Sub
                  const amountOfDay = Number(orderItem.plan_id.amount_of_day);
                  const date = new Date();
                  date.setDate(date.getDate() + amountOfDay);
                  const endTime = date;
                  //Update subscribe
                  const dataSubscribe = {
                    user_id: itemOrder?.user_id?._id.toString(),
                    service_name: orderItem.service_name,
                    service_id: orderItem.service_id.toString(),
                    plan_id: orderItem.plan_id._id.toString(),
                    status: "active",
                    start_at: new Date(),
                    end_at: endTime,
                  };
                  console.log("create Sub", 454);
                  await this.subscribeService.create(dataSubscribe);
                }
              } else {
                //Create New Purchase
                //Create new Sub
                const amountOfDay = Number(orderItem.plan_id.amount_of_day);
                const date = new Date();
                date.setDate(date.getDate() + amountOfDay);
                const endTime = date;
                //Update subscribe
                const dataSubscribe = {
                  user_id: itemOrder?.user_id?._id.toString(),
                  service_name: orderItem.service_name,
                  service_id: orderItem.service_id.toString(),
                  plan_id: orderItem.plan_id._id.toString(),
                  status: "active",
                  start_at: new Date(),
                  end_at: endTime,
                };
                console.log("create Sub", 476);
                //await this.subscribeService.create(dataSubscribe);
              }

              //@ts-ignore
              const dataStartSub = new Date(itemOrder.createdAt.toString());

              const dataStart = dataStartSub.getTime();

              const currentDay = Date.now();
              const dataDay = (currentDay - dataStart) / (1000 * 60 * 60 * 24);
              //Update to Success
              //Update Order to trial-false
              const dataUpdate = {
                _id: itemOrder._id?.toString(),
                status: "success",
              };
              await this.orderService.update(dataUpdate);
            } else {
              //When Validate is False
              //Check
              const subscribeData = await this.subscribeService.filter(
                { service_name: orderItem?.service_name.toString(), user_id: itemOrder?.user_id?._id.toString() },
                {},
                1,
                10
              );
              if (subscribeData) {
                let dataStart = 0;
                let lastTestSubscribe = null;
                for (const subscribeItem of subscribeData) {
                  const dataStartSub = new Date(subscribeItem.start_at.toString());
                  if (dataStartSub.getTime() > dataStart) {
                    dataStart = dataStartSub.getTime();
                    lastTestSubscribe = subscribeItem;
                  }
                }
                const currentDay = Date.now();
                const dataDay = (currentDay - dataStart) / (1000 * 60 * 60 * 24);
                if (dataDay < 3) {
                  //Do no thing
                } else {
                  //Update Order to trial-false
                  const dataUpdate = {
                    _id: itemOrder._id?.toString(),
                    status: "trial_false",
                  };
                  await this.orderService.update(dataUpdate);
                  //Update subscribe
                  if (lastTestSubscribe) {
                    const dataUpdate = {
                      _id: lastTestSubscribe._id.toString(),
                      status: "deactivate",
                      end_at: new Date(),
                    };
                    await this.subscribeService.update(dataUpdate);
                  }
                }
              } else {
                //Update Order to trial-false
                const dataUpdate = {
                  _id: itemOrder._id?.toString(),
                  status: "done",
                };
                await this.orderService.update(dataUpdate);
              }
            }
          }
        }
      }
    }
  }

  // /**
  //  *
  //  * @param userId
  //  * @param cityName
  //  * @param countryName
  //  */
  // async sendNotificationPublisher(partnerObject: User, req: ExpressRequestDto, res: Response, countryName: string) {
  //   setTimeout(async () => {
  //     const supportAccount = await this.appUserService.findOne({ _id: process.env.INFO_USER_PREMIUM });
  //     //Create new
  //     const dataCreateReturnRoom = await this.chatRoomHelper.handleCreateRoom(
  //       supportAccount,
  //       partnerObject._id.toString(),
  //       "personal",
  //       "",
  //       true
  //     );

  //     if (!dataCreateReturnRoom) {
  //       console.log("Not found");
  //     } else {
  //       //@ts-ignore
  //       const updatedAt = new Date(dataCreateReturnRoom?.updatedAt).getTime();
  //       const currentTime = new Date().getTime();

  //       //console.log(currentTime - updatedAt);
  //       const leftTime = currentTime - updatedAt;
  //       //@ts-ignore
  //       if (leftTime < 2592000000 && Number(dataCreateReturnRoom?.chat_history_count) > 0) {
  //         console.log("Not return");
  //         return null;
  //       }

  //       let chatContent = "";
  //       const tokenReturn = this.jwtHelper.generateJwt(
  //         process.env.INFO_USER,
  //         supportAccount?.user_email?.toString(),
  //         process.env.INFO_SESSION,
  //         true
  //       );
  //       if (process.env.BRANCH_NAME === "whiteg") {
  //         if (countryName === "Vietnam") {
  //           chatContent = `❤️ Chào mừng bạn đến với Đội hỗ trợ Premium. Hy vọng bạn có thêm kinh nghiệm về WhiteG. Nếu bạn có bất kỳ vấn đề gì, xin vui lòng liên hệ với chúng tôi tại đây. Chúc một ngày tốt lành, chàng trai của tôi!
  //           —-
  // 💬 WhiteG - Gay chat & call
  // 🐦 Twitter: https://twitter.com/whiteGappinio
  // 🫘 Instagram: https://twitter.com/whiteGappinio`;
  //         } else {
  //           chatContent = `❤️ Welcome to our Premium support. Hope you have more experience on WhiteG. If you have any problems, please contact us here. Have a good day, my boy!
  // —-
  // 💬 WhiteG - Gay chat & call
  // 🐦 Twitter: https://twitter.com/whiteGappinio
  // 🫘 Instagram: https://twitter.com/whiteGappinio`;
  //         }
  //       } else {
  //         if (countryName === "Vietnam") {
  //           chatContent = `❤️ Chào mừng bạn đến với Đội hỗ trợ Premium. Hy vọng bạn có thêm kinh nghiệm về WhiteG. Nếu bạn có bất kỳ vấn đề gì, xin vui lòng liên hệ với chúng tôi tại đây. Chúc một ngày tốt lành, tình yêu của tôi!
  //           —-
  // 💬 Honee - Dating, Chat & Meet`;
  //         } else {
  //           chatContent = `❤️ Welcome to our Premium support. Hope you have more experience on WhiteG. If you have any problems, please contact us here. Have a good day, my honey!
  // —-
  // 💬 Honee - Dating, Chat & Meet`;
  //         }
  //       }

  //       const createChatHistoryDto = {
  //         chat_room_id: dataCreateReturnRoom?.chat_room_id?._id?.toString(),
  //         chat_content: chatContent,
  //       };

  //       req.user_id = supportAccount?._id.toString();
  //       req.user_object = supportAccount;
  //       req.session_id = process.env.INFO_SESSION;
  //       req.auth_code = tokenReturn.toString();

  //       // const dataReturnHistory: any = await this.chatHistoryHelper.createNewHistory(
  //       //   req,
  //       //   res,
  //       //   createChatHistoryDto,
  //       //   false,
  //       //   true
  //       // );
  //     }
  //   }, 2000);

  //   return true;
  // }
}
