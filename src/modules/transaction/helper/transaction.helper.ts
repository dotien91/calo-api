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
  Logger,
  forwardRef,
  Inject
} from "@nestjs/common";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateTransactionDto } from "../dto/create-transaction.dto";
import { TransactionService } from "../services/transaction.service";
import { ListTransactionDto } from "../dto/list-transaction.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UpdateTransactionDto } from "../dto/update-transactions.dto";
import { Order } from "../../../modules/order/schemas/order.schema";
import { User } from "../../../modules/user/schemas/user.schema";
import { Purchase } from "../../../modules/purchase/schemas/purchase.schema";
import { CreateWithdrawalDto } from "../dto/create-withdrawal.dto";
import axios from "axios";
import { UserOptionService } from "../../../modules/user/services/user_option.service";
import { Callkit } from "../../../modules/callkit/schemas/callkit.schema";
import { ChatRoom } from "../../../modules/chat_room/schemas/chat_room.schema";
import { Gift } from "../../../modules/gift/schemas/gift.schema";
import { UserService } from "../../../modules/user/services/user.service";
import { ChannelPermissionService } from "../../../modules/channel/services/channel_permission.service";
import { CreateTransactionBankDto } from "../dto/create-transaction_bank.dto";
import { TransactionBankService } from "../services/transaction_bank.service";
import { ListTransactionBankDto } from "../dto/list-transaction_bank.dto";
import { UpdateTransactionBankDto } from "../dto/update-transactions_bank.dto";
import { ListUserIncomeDto } from "../dto/list-user-income.dto";
import * as moment from "moment-timezone";
import * as momentBase from "moment";
import { EventHookNotificationService } from "../../../modules/hook/services/hook_notification.service";
import { ChannelService } from "../../../modules/channel/services/channel.service";
/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class TransactionHelper {
  public get channelPermissionService(): ChannelPermissionService {
    return this._channelPermissionService;
  }
  public set channelPermissionService(value: ChannelPermissionService) {
    this._channelPermissionService = value;
  }
  constructor(
    private transactionService: TransactionService,
    private transactionBankService: TransactionBankService,
    private userPermissionService: UserPermissionService,
    private userOptionService: UserOptionService,
    @Inject(forwardRef(() => ChannelPermissionService))
    private _channelPermissionService: ChannelPermissionService,
    private userService: UserService,
    private readonly eventHookNotificationService: EventHookNotificationService,
    private readonly channelService: ChannelService,
  ) { }

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
      let userObject = req?.user_object;
      let authCode = req?.auth_code;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      if (
        Number(createTransactionData.transaction_value) <= 0 ||
        Number(createTransactionData.transaction_value) > 1000000000
      ) {
        throw new BadRequestException("Error while Transaction!");
      }

      let headerObject = req?.headers;
      if (headerObject && headerObject["x-channel"]) {
        let channelId = headerObject["x-channel"]?.toString();
        createTransactionData = { ...createTransactionData, ...{ channel_id: channelId } };
      }

      //Only Admin Create Transaction
      //Check Admin
      let userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "transaction/create")) {
        //Check Transaction
        let dataFilter = {
          user_id: createTransactionData.user_id,
        };
        let newDataTransaction = await this.transactionService.findOne(dataFilter);
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
          },
        };

        let userToUpdate = await this.userOptionService.findById(createTransactionData.user_id, {});

        //@ts-ignore
        await this.handleProcessUpdateCoin(userToUpdate, currentCoin, lastToken, authCode);

        let dataCreate = await this.transactionService.create(createTransactionData);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataCreate);
      } else {
        throw new BadRequestException("You haven't permission for this Action!");
      }
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
      let userObject = req?.user_object;
      let authCode = req?.auth_code;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      //Check Permission
      let transactionBankObject = await this.transactionBankService.findById(createTransactionData?._id?.toString());

      if (transactionBankObject?.user_id?._id?.toString() !== userObject?._id?.toString()) {
        throw new BadRequestException("You haven't permission for this Action!");
      }
      let dataCreate = await this.transactionBankService.update(createTransactionData);
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
      let userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      //Check Permission
      let transactionBankObject = await this.transactionBankService.findById(id);

      if (transactionBankObject?.user_id?._id?.toString() !== userObject?._id?.toString()) {
        throw new BadRequestException("You haven't permission for this Action!");
      }
      let dataReturn = await this.transactionBankService.remove(id);
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
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let headerObject = req?.headers;
      let channelId = createTransactionData?.channel_id;
      if (headerObject && headerObject["x-channel"]) {
        channelId = headerObject["x-channel"]?.toString();
      }
      if (channelId) {
        createTransactionData = { ...createTransactionData, ...{ channel_id: channelId } };
      }
      createTransactionData = { ...createTransactionData, ...{ user_id: userObject?._id?.toString() } };
      let dataCreate = await this.transactionBankService.create(createTransactionData);
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
      let userObject = req?.user_object;
      let authCode = req?.auth_code;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let channelId = req?.channel_id || createTransactionData?.channel_id || "";
      if (
        Number(createTransactionData.transaction_value) <= 0 ||
        Number(createTransactionData.transaction_value) > 1000000000
      ) {
        throw new BadRequestException("Error while Transaction!");
      }

      //Only Admin Create Transaction
      //Check Admin
      let userId = userObject._id.toString();

      if (createTransactionData.user_id) {
        //Check data
        if (await this.userPermissionService.isHavePermission(userId, "transaction/create")) {
          userId = createTransactionData.user_id;
        } else {
          throw new BadRequestException("You haven't permission for this Action!");
        }
      }

      //if (await this.userPermissionService.isHavePermission(userId, "transaction/create")) {
      //Check Transaction
      let dataFilter = {
        user_id: userId,
      };
      let newDataTransaction = await this.transactionService.findOne(dataFilter);
      console.log(newDataTransaction, "newDataTransaction");
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

      let newDataCreate = {
        ...createTransactionData,
        ...{
          user_id: userId,
          current_coin: lastCoin,
          last_coin: lastCoin,
          current_token: currentToken,
          last_token: lastToken,
          channel_id: channelId,
          note: `Withdrawal ${createTransactionData.transaction_value} token from System ID: ${userId}`,
          billing_on: new Date(),
          processing_on: new Date(),
          method: "minus",
          status: "processing",
          trans_id: "",
        },
      };

      await this.handleProcessUpdateCoin(userObject, lastCoin, currentToken, authCode);
      //Send Notification

      const channel = await this.channelService.findById(channelId);

      this.eventHookNotificationService.sendNotiUserWithdrawMoneyForBoss({
        send_user_id: req?.user_id?.toString(),
        user_id: channel?.user_id?._id.toString(),
        channel_id: channelId,
        path: `/r/mentor/payment-management`,
        mail_template: "success_buy_goods",
        content: (params: any) => {
          return `${userObject?.display_name} RÚT TIỀN `;
        },
        title: `${userObject?.display_name.toLocaleUpperCase()} RÚT TIỀN`,
      })

      let dataCreate = await this.transactionService.create(newDataCreate);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataCreate);
      // } else {
      //   throw new BadRequestException("You haven't permission for this Action!");
      // }
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
      let userObject = req?.user_object;
      let authCode = req?.auth_code;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let headerObject = req?.headers;
      let channelId: string = query?.channel_id;
      if (headerObject && headerObject["x-channel"]) {
        channelId = headerObject["x-channel"]?.toString();
      }

      let userPermission = await this.channelPermissionService.findOne({
        user_id: userObject?._id?.toString(),
        channel_id: channelId,
      });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && (userPermission?.permission?.indexOf("challenge/delete") !== -1))
      ) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userObject?._id?.toString(), "challenge/delete")) {
        havePermission = true;
      }

      if (!query?.user_id) {
        query = { ...query, ...{ user_id: userObject?._id?.toString() } };
      } else {
        //Check permission
        if (!havePermission) {
          throw new ForbiddenException("You not have permission for this activity!");
        }
      }

      let timeZone = "Asia/Ho_Chi_Minh";
      if (query?.time_zone) {
        timeZone = query?.time_zone;
      }
      var currentTime = moment();
      currentTime.tz(timeZone).format("YYYY-MM-DD");
      let currentDate = momentBase(new Date(currentTime?.toString())).format("YYYY-MM-DD");
      let todayIOS = moment(currentDate).tz(timeZone);

      let yesterDay = new Date(currentDate);
      yesterDay.setDate(yesterDay.getDate() - 1);

      let sevenDay = new Date(currentDate);
      sevenDay.setDate(sevenDay.getDate() - 7);

      let firstDayOfWeek = todayIOS.clone().startOf("week").add(1, "day");
      let firstDayOfMonth = todayIOS.clone().startOf("month");

      let firstDayOfLastMonth = todayIOS.clone().subtract(1, "month").startOf("month");

      let filterToday = {
        from: todayIOS?.toString(),
        to: new Date().toISOString(),
      };
      filterToday = { ...filterToday, ...query };

      let todayCount = await this.transactionService.getUserIncome(filterToday, {}, 1, 1);

      let filterYesterday = {
        from: yesterDay?.toString(),
        to: todayIOS?.toString(),
      };
      filterYesterday = { ...filterYesterday, ...query };
      let yesterdayCount = await this.transactionService.getUserIncome(filterYesterday, {}, 1, 1);

      let filterCurrentWeek = {
        from: firstDayOfWeek?.toString(),
        to: new Date().toISOString(),
      };
      filterCurrentWeek = { ...filterCurrentWeek, ...query };
      let currentWeekCount = await this.transactionService.getUserIncome(filterCurrentWeek, {}, 1, 1);

      let filterCurrentMonth = {
        from: firstDayOfMonth?.toString(),
        to: new Date().toISOString(),
      };
      filterCurrentMonth = { ...filterCurrentMonth, ...query };
      let currentMonthCount = await this.transactionService.getUserIncome(filterCurrentMonth, {}, 1, 1);

      let filterLastMonth = {
        from: firstDayOfLastMonth?.toString(),
        to: firstDayOfMonth?.toString(),
      };
      filterLastMonth = { ...filterLastMonth, ...query };
      let lastMonthCount = await this.transactionService.getUserIncome(filterLastMonth, {}, 1, 1);
      let dataReturn = {
        today: todayCount[0] || { sum: 0 },
        yesterday: yesterdayCount[0] || { sum: 0 },
        current_week: currentWeekCount[0] || { sum: 0 },
        current_month: currentMonthCount[0] || { sum: 0 },
        last_month: lastMonthCount[0] || { sum: 0 },
      };
      let dataCount = 0;
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
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();

      let headerObject = req?.headers;
      let channelId: string = query?.channel_id;
      if (headerObject && headerObject["x-channel"]) {
        channelId = headerObject["x-channel"]?.toString();
      }

      let userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && (userPermission?.permission?.indexOf("mentor/list") !== -1))
      ) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "mentor/list")) {
        havePermission = true;
      }

      if (!havePermission) {
        throw new ForbiddenException("You not have permission for this action!");
      }
      if (havePermission) {
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
        delete dataToFilter.page;
        delete dataToFilter.limit;
        delete dataToFilter.order_by;

        if (channelId) {
          dataToFilter = { ...dataToFilter, ...{ channel_id: channelId } };
        }
        let dataReturn = await this.transactionService.filter(dataToFilter, orderByOBject, page, limit);
        let dataCount = await this.transactionService.count(dataToFilter);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new BadRequestException("You haven't permission for this Action!");
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
  async getListTransactionBank(query: ListTransactionBankDto, res: Response, req: ExpressRequestDto) {
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
      let dataToFilter = { ...query, ...{ user_id: userId } };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      let headerObject = req?.headers;
      let channelId: string = query?.channel_id;
      if (headerObject && headerObject["x-channel"]) {
        channelId = headerObject["x-channel"]?.toString();
      }
      if (channelId) {
        dataToFilter = { ...dataToFilter, ...{ channel_id: channelId } };
      }

      let dataReturn = await this.transactionBankService.filter(dataToFilter, orderByOBject, page, limit);
      let dataCount = await this.transactionBankService.count(dataToFilter);
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
      let dataToFilter = { ...query, ...{ user_id: userId } };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      let headerObject = req?.headers;
      let channelId: string = query?.channel_id;
      if (headerObject && headerObject["x-channel"]) {
        channelId = headerObject["x-channel"]?.toString();
      }
      if (channelId) {
        dataToFilter = { ...dataToFilter, ...{ channel_id: channelId } };
      }

      dataToFilter = { ...dataToFilter, ...{ transaction_type: "output" } };
      if (query?.search) {
        //Search User First
        let dataSearch = {
          search: query?.search,
          channel_permission: channelId,
        };
        let dataUserArray = await this.userService.filter(dataSearch, {}, page, limit);
        let ids = dataUserArray.map((itemValue, index) => {
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

      let dataReturn = await this.transactionService.filter(dataToFilter, orderByOBject, page, limit);
      let dataCount = await this.transactionService.count(dataToFilter);
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
  async handleGetDetailTransaction(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      //Check Permission
      let dataReturn = await this.transactionService.findById(id.toString());
      if (
        (await this.userPermissionService.isHavePermission(userId, "transaction/list")) ||
        dataReturn.user_id.toString() === userId
      ) {
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
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      //Check Permission
      // if (await this.userPermissionService.isHavePermission(userId, "order/update")) {
      let dataReturn = await this.transactionService.update(dataUpdate);
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
   *
   * @param orderData
   * @param userObject
   * @param purchase
   * @param auth
   * @returns
   */
  async handleUpdateTransactionAfter(orderData: Order, userObject: User, purchase: Purchase, auth: string) {
    try {
      let dataFilter = {
        ref_id: orderData,
        ref_type: "order",
      };
      let dataTransaction = await this.transactionService.findOne(dataFilter);
      if (!dataTransaction) {
        let dataFilterLastCoin = {
          user_id: userObject._id.toString(),
        };
        let dataTransactionLastCoinObject = await this.transactionService.findOne(dataFilterLastCoin);
        let lastCoin = 0;
        let currentToken = 0;
        if (dataTransactionLastCoinObject) {
          lastCoin = Number(dataTransactionLastCoinObject.current_coin);
          currentToken = Number(dataTransactionLastCoinObject.current_token);
        }

        let dataValue = Number(orderData.plan_id.amount_of_coin);

        let newCoin = lastCoin + dataValue;
        let noteTransaction = `Top-up ${dataValue} coin from Order ID: #${orderData._id.toString()} at: ${new Date().toISOString()}. Created by User: #${userObject._id.toString()}.`;

        //Create New Transaction
        let dataCreate = {
          ref_id: orderData._id.toString(),
          ref_type: "order",
          method: "plus",
          current_token: currentToken,
          last_token: currentToken,
          current_coin: newCoin,
          last_coin: lastCoin,
          transaction_value: dataValue,
          user_id: userObject._id.toString(),
          note: noteTransaction,
          status: "done",
          data_payment: JSON.stringify(purchase),
          trans_id: purchase._id.toString(),
          successfully_on: new Date(),
          billing_on: new Date(),
        };

        await this.handleProcessUpdateCoin(userObject, newCoin, currentToken, auth);
        let dataToReturn = await this.transactionService.create(dataCreate);
        return dataToReturn;
      } else {
        return null;
      }
    } catch (error) {
      //Not Return
      console.log(error, "ERROR in 240 line, transaction helper");
      return null;
    }
  }

  /**
   *
   * @param userObject
   * @param coinToUpdate
   * @param tokenToUpdate
   * @param totalCall
   * @param callObject
   * @param auth
   */
  async handleProcessUpdateCoinBefore(
    userObject: User,
    coinToUpdate: number,
    tokenToUpdate: number,
    totalCall: number,
    callObject: Callkit,
    auth: string
  ) {
    try {
      let dataFilterLastCoin = {
        user_id: userObject._id.toString(),
      };
      let dataTransactionLastCoinObject = await this.transactionService.findOne(dataFilterLastCoin);
      let lastCoin = 0;
      let lastToken = 0;
      if (dataTransactionLastCoinObject) {
        lastCoin = Number(dataTransactionLastCoinObject.current_coin);
        lastToken = Number(dataTransactionLastCoinObject.current_token);
      }

      let dataValue = 0;
      let newCoin = lastCoin;
      let newToken = lastToken;
      let noteTransaction = "";
      let method = "plus";
      if (coinToUpdate) {
        dataValue = coinToUpdate;
        noteTransaction = `Transaction ${dataValue} coin for call at: ${new Date().toISOString()}. Total ${totalCall} second for call.`;
        newCoin = lastCoin - dataValue;
        method = "minus";
      } else {
        dataValue = tokenToUpdate;
        noteTransaction = `Received ${dataValue} coin for call at: ${new Date().toISOString()}. Total ${totalCall} second for call.`;
        newToken = lastToken + dataValue;
      }

      if (newCoin < 0) {
        newCoin = 0;
      }

      //Create New Transaction
      let dataCreate = {
        ref_id: callObject._id.toString(),
        ref_type: "callkit",
        method: method,
        current_token: newToken,
        last_token: lastToken,
        current_coin: newCoin,
        last_coin: lastCoin,
        transaction_value: dataValue,
        user_id: userObject._id.toString(),
        note: noteTransaction,
        status: "done",
        data_payment: "",
        trans_id: callObject._id.toString(),
        successfully_on: new Date(),
        billing_on: new Date(),
      };

      await this.handleProcessUpdateCoin(userObject, newCoin, newToken, auth);
      let dataToReturn = await this.transactionService.create(dataCreate);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   *
   * @param userObject
   * @param coinToUpdate
   * @param tokenToUpdate
   * @param totalCall
   * @param callObject
   * @param auth
   */
  async handleProcessUpdateCoinMessage(
    userObject: User,
    coinToUpdate: number,
    tokenToUpdate: number,
    roomObject: ChatRoom,
    auth: string
  ) {
    try {
      let dataFilterLastCoin = {
        user_id: userObject._id.toString(),
      };
      console.log(userObject, "userObject");
      let dataTransactionLastCoinObject = await this.transactionService.findOne(dataFilterLastCoin);
      console.log(dataTransactionLastCoinObject, "dataTransactionLastCoinObject");
      let lastCoin = 0;
      let lastToken = 0;
      if (dataTransactionLastCoinObject) {
        lastCoin = Number(dataTransactionLastCoinObject.current_coin);
        lastToken = Number(dataTransactionLastCoinObject.current_token);
      }

      let dataValue = 0;
      let newCoin = lastCoin;
      let newToken = lastToken;
      let noteTransaction = "";
      let method = "plus";
      if (coinToUpdate) {
        dataValue = coinToUpdate;
        noteTransaction = `Transaction ${dataValue} coin for message at: ${new Date().toISOString()}.`;
        newCoin = lastCoin - dataValue;
        method = "minus";
      } else {
        dataValue = tokenToUpdate;
        noteTransaction = `Received ${dataValue} coin for message at: ${new Date().toISOString()}`;
        newToken = lastToken + dataValue;
      }

      //Create New Transaction
      let dataCreate = {
        ref_id: roomObject._id.toString(),
        ref_type: "chat_room",
        method: method,
        current_token: newToken,
        last_token: lastToken,
        current_coin: newCoin,
        last_coin: lastCoin,
        transaction_value: dataValue,
        user_id: userObject._id.toString(),
        note: noteTransaction,
        status: "done",
        data_payment: "",
        trans_id: roomObject._id.toString(),
        successfully_on: new Date(),
        billing_on: new Date(),
      };
      console.log(dataCreate, "dataCreate 559");

      console.log(dataCreate, "dataCreate");

      await this.handleProcessUpdateCoin(userObject, newCoin, newToken, auth);
      let dataToReturn = await this.transactionService.create(dataCreate);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   *
   * @param userObject
   * @param coinToUpdate
   * @param tokenToUpdate
   * @param totalCall
   * @param callObject
   * @param auth
   */
  async handleProcessUpdateCoinGift(
    userObject: User,
    coinToUpdate: number,
    tokenToUpdate: number,
    giftObject: Gift,
    auth: string
  ) {
    try {
      let dataFilterLastCoin = {
        user_id: userObject._id.toString(),
      };
      console.log(userObject, "userObject");
      let dataTransactionLastCoinObject = await this.transactionService.findOne(dataFilterLastCoin);
      console.log(dataTransactionLastCoinObject, "dataTransactionLastCoinObject");
      let lastCoin = 0;
      let lastToken = 0;
      if (dataTransactionLastCoinObject) {
        lastCoin = Number(dataTransactionLastCoinObject.current_coin);
        lastToken = Number(dataTransactionLastCoinObject.current_token);
      }

      let dataValue = 0;
      let newCoin = lastCoin;
      let newToken = lastToken;
      let noteTransaction = "";
      let method = "plus";
      if (coinToUpdate) {
        dataValue = coinToUpdate;
        noteTransaction = `Use ${dataValue} coin for buy gift at: ${new Date().toISOString()}.`;
        newCoin = lastCoin - dataValue;
        method = "minus";
      } else {
        dataValue = tokenToUpdate;
        noteTransaction = `Received ${dataValue} token for self gift: ${new Date().toISOString()}`;
        newToken = lastToken + dataValue;
      }

      //Create New Transaction
      let dataCreate = {
        ref_id: giftObject._id.toString(),
        ref_type: "gift",
        method: method,
        current_token: newToken,
        last_token: lastToken,
        current_coin: newCoin,
        last_coin: lastCoin,
        transaction_value: dataValue,
        user_id: userObject._id.toString(),
        note: noteTransaction,
        status: "done",
        data_payment: "",
        trans_id: giftObject._id.toString(),
        successfully_on: new Date(),
        billing_on: new Date(),
      };
      console.log(dataCreate, "dataCreate 559");

      console.log(dataCreate, "dataCreate");

      await this.handleProcessUpdateCoin(userObject, newCoin, newToken, auth);
      let dataToReturn = await this.transactionService.create(dataCreate);
    } catch (error) {
      console.log(error);
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
  async handleProcessUpdateCoin(userObject: User, coinNumber: Number, tokenNumber: Number, authCode: string) {
    try {
      let dataToUpdate: any = {
        user_id: userObject._id?.toString(),
        current_coin: coinNumber,
        current_token: tokenNumber,
      };
      let dataUpdateUser = await this.userOptionService.update(dataToUpdate);
      // let dataToSend = {
      //   data_update: JSON.stringify(dataToUpdate),
      // };
      const params = new URLSearchParams(dataToUpdate);
      const config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Authorization": authCode,
        },
      };
      const urlLogin = process.env.SOCKET_API;

      let dataNotification = await axios
        .post(urlLogin + "/update-coin", params, config)
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
      //Send Socket
      return dataUpdateUser;
    } catch (error) {
      console.log(error);
    }
  }
}
