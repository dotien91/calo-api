import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { Response } from "express";
import * as momentBase from "moment";
import * as moment from "moment-timezone";
import { HttpClientService } from "../../../base/http-client/http.base";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { AddCoinToUserData, AddPointToUserData } from "../../../modules/hook/interfaces/hook.interface";
import { EventHookNotificationService } from "../../../modules/hook/services/hook_notification.service";
import { NotificationHelper } from "../../../modules/notification/helper/notification.helper";
import { NotificationService } from "../../../modules/notification/services/notification.service";
import { Order } from "../../../modules/order/schemas/order.schema";
import { Purchase } from "../../../modules/purchase/schemas/purchase.schema";
import { SocketService } from "../../../modules/socket/services/socket.service";
import { SocketPath } from "../../../modules/socket/services/socket.service.i";
import { User } from "../../../modules/user/schemas/user.schema";
import { UserService } from "../../../modules/user/services/user.service";
import { UserPointHistoryService } from "../../../modules/user/services/user_point_history.service";
import { filterDuplicateObject, formatWithCommas } from "../../../utils/utils";
import { CreateTransactionDto } from "../dto/create-transaction.dto";
import { CreateTransactionBankDto } from "../dto/create-transaction_bank.dto";
import { CreateWithdrawalDto } from "../dto/create-withdrawal.dto";
import { ListTransactionDto } from "../dto/list-transaction.dto";
import { ListTransactionBankDto } from "../dto/list-transaction_bank.dto";
import { ListUserIncomeDto } from "../dto/list-user-income.dto";
import { UpdateTransactionDto } from "../dto/update-transactions.dto";
import { UpdateTransactionBankDto } from "../dto/update-transactions_bank.dto";
import { TransactionRefType, TransactionStatus, TransactionValueType } from "../interfaces/transaction.interface";
import { TransactionService } from "../services/transaction.service";
import { TransactionBankService } from "../services/transaction_bank.service";
/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class TransactionHelper {
  constructor(
    private transactionService: TransactionService,
    private transactionBankService: TransactionBankService,
    private userService: UserService,
    private eventHookNotificationService: EventHookNotificationService,
    private socketService: SocketService,
    private notificationHelper: NotificationHelper,
    private notificationService: NotificationService,
    private userPointHistoryService: UserPointHistoryService,
    private httpService: HttpClientService
  ) {}

  private readonly logger = new Logger("chat_history_controller");

  /**
   *
   *
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewTransaction(createTransactionData: CreateTransactionDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      const authCode = req?.auth_code;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      if (
        Number(createTransactionData.transaction_value) <= 0 ||
        Number(createTransactionData.transaction_value) > 1000000000
      ) {
        throw new BadRequestException("Error while Transaction!");
      }

      const userId = userObject._id.toString();

      const dataFilter = {
        user_id: createTransactionData.user_id,
      };
      const newDataTransaction = await this.transactionService.findOne(dataFilter);
      let lastCoin = 0;
      let lastToken = 0;
      if (newDataTransaction) {
        lastCoin = Number(newDataTransaction.current_coin);
        lastToken = Number(newDataTransaction.current_token);
      }

      let currentCoin = 0;
      if (createTransactionData.method === "plus") {
        currentCoin = lastCoin + Number(createTransactionData.transaction_value);
      } else {
        currentCoin = lastCoin - Number(createTransactionData.transaction_value);
        if (currentCoin < 0) {
          currentCoin = 0;
        }
      }
      createTransactionData = {
        ...createTransactionData,
        ...{
          current_coin: currentCoin,
          last_coin: lastCoin,
          note: `Top-up ${createTransactionData.transaction_value} coin from System ID: ${userId}`,
          billing_on: new Date(),
          successfully_on: new Date(),
          last_token: lastToken,
          current_token: lastToken,
          transaction_value: createTransactionData.transaction_value,
          transaction_value_type: TransactionValueType.COIN,
        },
      };

      const userToUpdate = await this.userService.findById(createTransactionData.user_id, {});

      //@ts-ignore
      await this.sendSocketUpdateCoin(userToUpdate?._id?.toString(), currentCoin, lastToken, authCode);

      const dataCreate = await this.transactionService.create(createTransactionData);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataCreate);
    } catch (error) {
      throw new NotFoundException(error.message);
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
  async updateTransactionBank(createTransactionData: UpdateTransactionBankDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      const authCode = req?.auth_code;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      //Check Permission
      const transactionBankObject = await this.transactionBankService.findById(createTransactionData?._id?.toString());

      if (transactionBankObject?.user_id?._id?.toString() !== userObject?._id?.toString()) {
        throw new BadRequestException("You haven't permission for this Action!");
      }
      const dataCreate = await this.transactionBankService.update(createTransactionData);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataCreate);
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
  async handleDeleteTransactionBank(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      //Check Permission
      const transactionBankObject = await this.transactionBankService.findById(id);

      if (transactionBankObject?.user_id?._id?.toString() !== userObject?._id?.toString()) {
        throw new BadRequestException("You haven't permission for this Action!");
      }
      const dataReturn = await this.transactionBankService.remove(id);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
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
  async createNewTransactionBank(
    createTransactionData: CreateTransactionBankDto,
    res: Response,
    req: ExpressRequestDto
  ) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const transactionBank = await this.transactionBankService.findOne({
        bank_name: createTransactionData.bank_name,
        bank_number: createTransactionData.bank_number,
        bank_account_name: createTransactionData.bank_account_name,
      });
      if (transactionBank) throw new Error("Duplicate Transaction Bank");

      createTransactionData = { ...createTransactionData, ...{ user_id: userObject?._id?.toString() } };
      const dataCreate = await this.transactionBankService.create(createTransactionData);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataCreate);
    } catch (error) {
      throw new NotFoundException(error.message);
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
  async createWithdrawal(createTransactionData: CreateWithdrawalDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      const authCode = req?.auth_code;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      if (
        Number(createTransactionData.transaction_value) <= 0 ||
        Number(createTransactionData.transaction_value) > 1000000000
      ) {
        throw new BadRequestException("Error while Transaction!");
      }

      const transactionBank = await this.transactionBankService.findOne({
        _id: createTransactionData.transaction_bank,
      });
      if (!transactionBank) throw new Error("Invalid transaction bank ID");

      //Only Admin Create Transaction
      //Check Admin
      const userId = userObject._id.toString();

      //Check Transaction
      const dataFilter = {
        user_id: userId,
      };
      const newDataTransaction = await this.transactionService.findOne(dataFilter);
      let lastCoin = 0;
      let lastToken = 0;
      if (newDataTransaction) {
        lastToken = Number(newDataTransaction.current_token);
        lastCoin = Number(newDataTransaction.current_coin);
      }

      if (Number(createTransactionData.transaction_value) <= lastToken) {
      } else {
        //Not enough Token to withdrawal
        throw new BadRequestException("Not enough Token to withdraw!");
      }

      let currentToken = 0;
      currentToken = lastToken - Number(createTransactionData.transaction_value);

      const newDataCreate = {
        ...createTransactionData,
        ...{
          user_id: userId,
          current_coin: lastCoin,
          last_coin: lastCoin,
          current_token: currentToken,
          last_token: lastToken,
          note: `Withdrawal ${createTransactionData.transaction_value} token from System ID: ${userId}`,
          billing_on: new Date(),
          processing_on: new Date(),
          method: "minus",
          status: TransactionStatus.PROCESSING,
          trans_id: "",
          transaction_value: createTransactionData.transaction_value,
          transaction_value_type: TransactionValueType.TOKEN,
          income_value: Number(createTransactionData.transaction_value),
        },
      };

      // Update request user token
      this.userService.update({ _id: userObject?._id?.toString(), current_token: currentToken });

      // send notification to user
      const notification = {
        title: "translation.transaction.accountBalance.title",
        user_id: userId,
        content: "translation.transaction.accountBalance.content",
        image: "",
        type_action: "link",
        channel: "user",
        replace_pattern: {
          current_token: currentToken,
        },
      };
      this.notificationHelper.handleSendNotification(notification, req?.auth_code);

      const dataCreate = await this.transactionService.create(newDataCreate);

      // send notification to telegram group
      (() => {
        let baseUrl = "http://localhost:3900";
        switch (process.env.APP_NAME) {
          case "ieltshunter": {
            baseUrl = "https://api.live.ieltshunter.io";
            break;
          }
          case "ikigai": {
            baseUrl = "https://api.live.ieltshunter.io";
            break;
          }
          default: {
            baseUrl = "https://api.live.ieltshunter.io";
            break;
          }
        }
        this.httpService.get$(`https://api.telegram.org/${process.env.TELEGRAM_BOT_ID}/sendMessage?`, {
          chat_id: process.env.TELEGRAM_ROOM_ID,
          text: `
          <b>===================</b>\n<b>THÔNG BÁO GIAO DỊCH</b>\nLoại: <b>Rút tiền</b>\nGiá trị giao dịch: ${formatWithCommas(
            createTransactionData.transaction_value
          )}\nNgân hàng: ${transactionBank.bank_name}\nTên tài khoản: ${
            transactionBank.bank_account_name
          }\nSố tài khoản: ${transactionBank.bank_number}\n<a href="${
            baseUrl + `/api/transaction/admin-update?_id=${dataCreate._id.toString()}&status=${TransactionStatus.DONE}`
          }">Duyệt giao dịch ✅</a>\n<a href="${
            baseUrl +
            `/api/transaction/admin-update?_id=${dataCreate._id.toString()}&status=${TransactionStatus.REJECT}`
          }">Từ chối giao dịch ⛔️</a>`,
          parse_mode: "HTML",
        });
      })();

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataCreate);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param query
   * @param res
   * @param req
   * @returns
   */
  async getUserIncome(query: ListUserIncomeDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      if (!query?.user_id) {
        query = { ...query, ...{ user_id: userObject?._id?.toString() } };
      } else {
      }

      let timeZone = "Asia/Ho_Chi_Minh";
      if (query?.time_zone) {
        timeZone = query?.time_zone;
      }
      const currentTime = moment();
      currentTime.tz(timeZone).format("YYYY-MM-DD");
      const currentDate = momentBase(new Date(currentTime?.toString())).format("YYYY-MM-DD");
      const todayIOS = moment(currentDate).tz(timeZone);

      const yesterDay = new Date(currentDate);
      yesterDay.setDate(yesterDay.getDate() - 1);

      const sevenDay = new Date(currentDate);
      sevenDay.setDate(sevenDay.getDate() - 7);

      const firstDayOfWeek = todayIOS.clone().startOf("week").add(1, "day");
      const firstDayOfMonth = todayIOS.clone().startOf("month");

      const firstDayOfLastMonth = todayIOS.clone().subtract(1, "month").startOf("month");

      let filterToday = {
        from: todayIOS?.toString(),
        to: new Date().toISOString(),
      };
      filterToday = { ...filterToday, ...query };

      const todayCount = await this.transactionService.getUserIncome(filterToday, {}, 1, 1);

      let filterYesterday = {
        from: yesterDay?.toString(),
        to: todayIOS?.toString(),
      };
      filterYesterday = { ...filterYesterday, ...query };
      const yesterdayCount = await this.transactionService.getUserIncome(filterYesterday, {}, 1, 1);

      let filterCurrentWeek = {
        from: firstDayOfWeek?.toString(),
        to: new Date().toISOString(),
      };
      filterCurrentWeek = { ...filterCurrentWeek, ...query };
      const currentWeekCount = await this.transactionService.getUserIncome(filterCurrentWeek, {}, 1, 1);

      let filterCurrentMonth = {
        from: firstDayOfMonth?.toString(),
        to: new Date().toISOString(),
      };
      filterCurrentMonth = { ...filterCurrentMonth, ...query };
      const currentMonthCount = await this.transactionService.getUserIncome(filterCurrentMonth, {}, 1, 1);

      let filterLastMonth = {
        from: firstDayOfLastMonth?.toString(),
        to: firstDayOfMonth?.toString(),
      };
      filterLastMonth = { ...filterLastMonth, ...query };
      const lastMonthCount = await this.transactionService.getUserIncome(filterLastMonth, {}, 1, 1);
      const dataReturn = {
        today: todayCount[0] || { sum: 0, total_coin: 0, total_token: 0 },
        yesterday: yesterdayCount[0] || { sum: 0, total_coin: 0, total_token: 0 },
        current_week: currentWeekCount[0] || { sum: 0, total_coin: 0, total_token: 0 },
        current_month: currentMonthCount[0] || { sum: 0, total_coin: 0, total_token: 0 },
        last_month: lastMonthCount[0] || { sum: 0, total_coin: 0, total_token: 0 },
      };
      const dataCount = 0;
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
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getTransactionListByAdmin(query: ListTransactionDto, res: Response, req: ExpressRequestDto) {
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

      const dataReturn = await this.transactionService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.transactionService.count(dataToFilter);
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
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getListTransactionBank(query: ListTransactionBankDto, res: Response, req: ExpressRequestDto) {
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

      const dataReturn = await this.transactionBankService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.transactionBankService.count(dataToFilter);
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
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getTransactionListByUser(query: ListTransactionDto, res: Response, req: ExpressRequestDto) {
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
      let dataToFilter = { ...query, ...{ user_id: userId } };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      dataToFilter = { ...dataToFilter, ...{ transaction_type: "output" } };
      if (query?.search) {
        //Search User First
        const dataSearch = {
          search: query?.search,
        };
        const dataUserArray = await this.userService.filter(dataSearch, {}, page, limit);
        const ids = dataUserArray.map((itemValue, index) => {
          return itemValue?._id?.toString();
        });
        if (ids && ids.length) {
          dataToFilter = { ...dataToFilter, ...{ user_ids: ids } };
        } else {
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": 0 })
            .status(HttpStatus.OK)
            .json([]);
        }
      }

      const dataReturn: any = await this.transactionService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.transactionService.count(dataToFilter);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getFilterByUser(res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();

      const limit = 1000;
      const page = 1;
      let orderByOBject = {};
      let dataToFilter = { user_id: userId, transaction_type: "output" };

      const dataReturn: any = await this.transactionService.filter(dataToFilter, orderByOBject, page, limit);
      for (const index in dataReturn) {
        dataReturn[index] = dataReturn[index]?.toObject();
      }

      const product_list = dataReturn
        .filter((transaction) => [TransactionRefType.COURSE, TransactionRefType.PRODUCT].includes(transaction.ref_type))
        .map((transaction: any) => ({
          _id: transaction.ref_id?._id,
          name: transaction.ref_id?.title || transaction.ref_id?.name,
          url: transaction.ref_id?.avatar?.media_thumbnail || transaction.ref_id?.avatar?.media_url,
        }));

      const order_referral_user_list = dataReturn
        .filter(
          (transaction) =>
            [TransactionRefType.COURSE, TransactionRefType.PRODUCT].includes(transaction.ref_type) &&
            transaction.referral_user
        )
        .map((transaction: any) => ({
          _id: transaction.referral_user?._id,
          name: transaction.referral_user?.display_name,
          avatar: transaction.referral_user?.user_avatar_thumbnail || transaction.referral_user?.user_avatar,
        }));
      const finalDataReturn = {
        product_list: filterDuplicateObject(product_list),
        referral_user_list: filterDuplicateObject([...order_referral_user_list]),
      };

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(finalDataReturn);
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
  async handleGetDetailTransaction(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      //Check Permission
      const dataReturn = await this.transactionService.findById(id.toString());
      if (dataReturn.user_id.toString() === userId) {
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new BadRequestException("You haven't permission for this Action!");
      }
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
  async handleUpdateTransactionByAdmin(dataUpdate: UpdateTransactionDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      //Check Permission
      const dataReturn = await this.transactionService.update(dataUpdate);
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

  async handleUpdateTransactionByAdminTelegram(
    dataUpdate: UpdateTransactionDto,
    res: Response,
    req: ExpressRequestDto
  ) {
    try {
      const oldTransaction = await this.transactionService.findOne({ _id: dataUpdate._id });
      if (!oldTransaction) throw new Error("Not found transaction");

      if (oldTransaction.status !== TransactionStatus.PROCESSING) throw new Error("This transaction already committed");

      switch (dataUpdate.status) {
        case TransactionStatus.DONE: {
          await this.transactionService.update(dataUpdate);
          break;
        }
        case TransactionStatus.REJECT: {
          const newestTransaction = await this.transactionService.findOne({
            user_id: oldTransaction.user_id.toString(),
          });

          await Promise.all([
            this.transactionService.update({
              _id: dataUpdate._id,
              status: TransactionStatus.DONE,
            }),
            this.transactionService.create({
              user_id: newestTransaction.user_id.toString(),
              transaction_value: oldTransaction.income_value,
              method: "plus",
              status: TransactionStatus.DONE,
              current_coin: newestTransaction.current_coin,
              last_coin: newestTransaction.last_coin,
              note: `Reject withdrawal ${
                oldTransaction.income_value
              } token from System ID: ${newestTransaction.user_id.toString()}`,
              billing_on: new Date(),
              successfully_on: new Date(),
              last_token: newestTransaction.current_token,
              current_token: newestTransaction.current_token + newestTransaction.income_value,
              transaction_value_type: TransactionValueType.TOKEN,
            }),
          ]);

          // send notification to user
          const notification = {
            title: "translation.transaction.accountBalance.title",
            user_id: newestTransaction.user_id.toString(),
            content: "translation.transaction.accountBalance.content",
            image: "",
            type_action: "link",
            channel: "user",
            replace_pattern: {
              current_token: newestTransaction.current_token + newestTransaction.income_value,
            },
          };
          this.notificationHelper.handleSendNotification(notification, req?.auth_code);

          break;
        }
      }

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json({ successfully: true });
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param orderData
   * @param userObject
   * @param purchase
   * @param auth
   * @returns
   */
  async handleUpdateTransactionAfter(orderData: Order, userObject: User, purchase: Purchase, auth: string) {
    try {
      const dataFilter = {
        ref_id: orderData,
        ref_type: "Order",
      };
      const dataTransaction = await this.transactionService.findOne(dataFilter);
      if (!dataTransaction) {
        const dataFilterLastCoin = {
          user_id: userObject._id.toString(),
        };
        const dataTransactionLastCoinObject = await this.transactionService.findOne(dataFilterLastCoin);
        let lastCoin = 0;
        let currentToken = 0;
        if (dataTransactionLastCoinObject) {
          lastCoin = Number(dataTransactionLastCoinObject.current_coin);
          currentToken = Number(dataTransactionLastCoinObject.current_token);
        }

        for (const orderItem of orderData.items) {
          const dataValue = Number(orderItem.plan_id.amount_of_coin);

          const newCoin = lastCoin + dataValue;
          const noteTransaction = `Top-up ${dataValue} coin from Order ID: #${orderData._id.toString()} at: ${new Date().toISOString()}. Created by User: #${userObject._id.toString()}.`;

          //Create New Transaction
          const dataCreate = {
            ref_id: orderData._id.toString(),
            ref_type: "Order",
            method: "plus",
            current_token: currentToken,
            last_token: currentToken,
            current_coin: newCoin,
            last_coin: lastCoin,
            transaction_value: dataValue,
            transaction_value_type: TransactionValueType.COIN,
            user_id: userObject._id.toString(),
            note: noteTransaction,
            status: "done",
            data_payment: JSON.stringify(purchase),
            trans_id: purchase._id.toString(),
            successfully_on: new Date(),
            billing_on: new Date(),
          };

          await this.userService.update({ _id: userObject?._id?.toString(), current_coin: newCoin });
          await this.sendSocketUpdateCoin(userObject?._id?.toString(), newCoin, currentToken, auth);
          await this.transactionService.create(dataCreate);
        }
        return null;
      } else {
        return null;
      }
    } catch (error) {
      //Not Return
      console.log(error, "ERROR in 240 line, transaction helper");
      return null;
    }
  }

  async handleProcessUpdateCoinHook(data: AddCoinToUserData, auth: string) {
    try {
      const dataFilterLastCoin = {
        user_id: data.userId,
      };
      const dataTransactionLastCoinObject = await this.transactionService.findOne(dataFilterLastCoin);
      let lastCoin = 0;
      if (dataTransactionLastCoinObject) {
        lastCoin = Number(dataTransactionLastCoinObject.current_coin);
      }

      let dataValue = 0;
      let newCoin = lastCoin;
      let noteTransaction = "";
      const method = "plus";
      if (data.coin) {
        dataValue = data.coin;
        noteTransaction = `Transaction ${dataValue} coin for message at: ${new Date().toISOString()}.`;
        newCoin = lastCoin + dataValue;
      }

      //Create New Transaction
      const dataCreate = {
        ref_id: data.refObject._id.toString(),
        ref_type: data.refType,
        method: method,
        current_coin: newCoin,
        last_coin: lastCoin,
        transaction_value: dataValue,
        transaction_value_type: TransactionValueType.COIN,
        user_id: data.userId,
        from_user: data.fromUserId,
        note: noteTransaction,
        status: "done",
        data_payment: "",
        trans_id: data.refObject._id.toString(),
        successfully_on: new Date(),
        billing_on: new Date(),
      };

      await this.userService.update({ _id: data.userId, current_coin: newCoin });
      await this.sendSocketUpdateCoin(data.userId, newCoin, 0, auth);
      await this.transactionService.create(dataCreate);
    } catch (error) {
      console.log(error);
    }
  }

  async handleProcessUpdatePointHook(data: AddPointToUserData, authCode: string) {
    const isSameAction = await this.userPointHistoryService.findOne({
      user_id: data.user_id,
      entity_id: data.entity_id,
      entity_target: data.entity_target,
      entity_action: data.entity_action,
    });
    if (isSameAction) throw new Error("User already earned point from this action");
    else {
      const [, newUserData] = await Promise.all([
        this.userPointHistoryService.create(data),
        this.userService.updateUserPoint(data.user_id, data.point),
      ]);
      const dataForSending = {
        user_id: data.user_id,
        point: String(newUserData.point),
        is_level_up: String(newUserData.is_level_up),
      };
      const params = new URLSearchParams(dataForSending);
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Authorization": authCode,
      };

      const dataNotification = await this.socketService
        .send(SocketPath.UPDATE_POINT, headers, params)
        .then((response) => {
          if (response?.data) {
            return true;
          } else {
            return false;
          }
        })
        .catch((error) => {
          return false;
        });
      return dataNotification;
    }
  }

  /**
   *
   * @param userObject
   * @param coinNumber
   * @param tokenNumber
   * @param authCode
   * @returns
   */
  async sendSocketUpdateCoin(userId: string, coinNumber: number, tokenNumber: number, authCode: string) {
    try {
      const dataToUpdate: any = {
        user_id: userId,
        current_coin: coinNumber,
        current_token: tokenNumber,
      };
      const dataUpdateUser = await this.userService.update(dataToUpdate);

      if (coinNumber !== 0) {
        const params = new URLSearchParams(dataToUpdate);
        const headers = {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Authorization": authCode,
        };
        await this.socketService
          .send(SocketPath.UPDATE_COIN, headers, params)
          .then((response) => {
            if (response?.data) {
              this.logger.log("Send Message Successfully" + JSON.stringify(response.data));
              return true;
            } else {
              return false;
            }
          })
          .catch((error) => {
            this.logger.log("Send Message Error: " + JSON.stringify(error.response.data));
            return false;
          });
      }

      return dataUpdateUser;
    } catch (error) {
      console.log(error);
    }
  }
}
