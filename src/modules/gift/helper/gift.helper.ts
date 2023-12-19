import { Response, Request, response, query } from "express";
import {
  ForbiddenException,
  BadRequestException,
  HttpStatus,
  NotFoundException,
  Injectable,
  Logger,
  Res,
  Req,
  Param,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { UserService } from "../../user/services/user.service";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateGiftDto } from "../dto/create-gift.dto";
import { GiftService } from "../services/gift.service";
import { ListGiftDto } from "../dto/list-gift.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UpdateGiftDto } from "../dto/update-gift.dto";
import { UserGiftService } from "../services/user_gift.service";
import { ListUserGiftDto } from "../dto/list-user_gift.dto";
import { CreateSellGiftDto } from "../dto/create-sell_gift.dto";
import { CreateBuyGiftDto } from "../dto/create-buy_gift.dto";
import { TransactionHelper } from "../../../modules/transaction/helper/transaction.helper";
import { CreateGiveGiftDto } from "../dto/create-give_gift.dto";
import { ChatMediaService } from "../../../modules/chat_media/services/chat_media.service";
import { User } from "../../../modules/user/schemas/user.schema";
import { Gift } from "../schemas/gift.schema";
import { ChatHistoryHelper } from "../../../modules/chat_history/helpers/chat_history.helper";
import { ChannelPermissionService } from "../../../modules/channel/services/channel_permission.service";
import { UpdateUserGiftDto } from "../dto/update-user_gift.dto";
import { ChannelService } from "../../../modules/channel/services/channel.service";
import { NotificationService } from "../../../modules/notification/services/notification.service";
import { NotiGiveGiftDto } from "../dto/noti-give-gift.dto";
import { QueueService } from "../../../modules/queue/queue.service";
import { EventHookNotificationService } from "../../../modules/hook/services/hook_notification.service";

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class GiftHelper {
  constructor(
    private appUserService: UserService,
    private giftService: GiftService,
    private userGiftService: UserGiftService,
    private userService: UserService,
    private userPermissionService: UserPermissionService,
    @Inject(forwardRef(() => TransactionHelper))
    private readonly transactionHelper: TransactionHelper,
    private chatMediaService: ChatMediaService,
    private chatHistoryHelper: ChatHistoryHelper,
    @Inject(forwardRef(() => ChannelPermissionService))
    private readonly channelPermissionService: ChannelPermissionService,
    private readonly channelService: ChannelService,
    private notificationService: NotificationService,
    private readonly queueService: QueueService,
    private readonly eventHookNotificationService: EventHookNotificationService
  ) {}

  private readonly logger = new Logger(GiftHelper.name);

  /**
   * @author SonLH
   * @param res
   * @param req
   * @returns
   */
  async addGiftToQueue() {
    try {
      const giftFilter = {
        // date_time: String(new Date()),
        date: String(new Date()),
        stock_qty: "0",
        gift_type: "gift",
      };
      const giftsDelivered = await this.giftService.filter(giftFilter, {}, 1, 100000);

      giftsDelivered.forEach(async (gift) => {
        let channelPermissionFilter = {
          channel_id: gift?.channel_id?.toString(),
        };
        if (gift.gift_conditions.point) {
          channelPermissionFilter = Object.assign(channelPermissionFilter, {
            point: { $gte: gift.gift_conditions.point },
          });
        }
        if (gift.gift_conditions.like) {
          channelPermissionFilter = Object.assign(channelPermissionFilter, {
            total_like: { $gte: gift.gift_conditions.like },
          });
        }
        if (gift.gift_conditions.comment) {
          channelPermissionFilter = Object.assign(channelPermissionFilter, {
            total_comment: { $gte: gift.gift_conditions.comment },
          });
        }
        if (gift.gift_conditions.level) {
          channelPermissionFilter = Object.assign(channelPermissionFilter, {
            level_number: { $gte: gift.gift_conditions.level },
          });
        }
        const userSatisfy = await this.channelPermissionService.filter(channelPermissionFilter, {}, 1, 100000);
        if (userSatisfy.length > 0) {
          console.log(userSatisfy.map((item) => console.log(item?.user_id?._id)));
          const createGiveGiftDto: NotiGiveGiftDto = {
            quantity: gift.stock_qty.valueOf(),
            gift_id: gift,
            partner_id: userSatisfy.map((item) => item?.user_id?._id).join(","),
          };
          this.queueService.addTaskGift(createGiveGiftDto);
        }
      });
    } catch (error) {
      this.logger.log("Send Gift To Customer Fails :", error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param createPlanData
   * @param res
   * @param req
   * @returns
   */
  async createGift(createGiftData: CreateGiftDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();

      const headerObject = req?.headers;
      let channelId: string = "";
      if (headerObject && headerObject["x-channel"]) {
        channelId = headerObject["x-channel"]?.toString();
      }

      const userPermission = await this.channelPermissionService.findOne({
        user_id: userId,
        channel_id: req?.channel_id,
      });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("mentor/list") !== -1)
      ) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "mentor/list")) {
        havePermission = true;
      }

      if (!havePermission) {
        throw new ForbiddenException("You not have permission for this action!");
      }

      //Check Permission
      //
      createGiftData = { ...createGiftData, ...{ user_id: userId } };
      if (channelId) {
        createGiftData = { ...createGiftData, ...{ channel_id: channelId } };
      }

      if (createGiftData?.gift_conditions) {
        createGiftData = {
          ...createGiftData,
          ...{ gift_conditions: JSON.parse(createGiftData?.gift_conditions) },
        };
      }

      if (
        createGiftData.hasOwnProperty("gift_digital_media") &&
        (createGiftData?.gift_digital_media == "" || createGiftData?.gift_digital_media == undefined)
      ) {
        delete createGiftData?.gift_digital_media;
      }

      const dataCreate = await this.giftService.create(createGiftData);
      const dataReturn = await this.giftService.findOne({ _id: dataCreate?._id });
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
   * @param updateGiftData
   * @param res
   * @param req
   * @returns
   */
  async updateGift(updateGiftData: UpdateGiftDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      const userPermission = await this.channelPermissionService.findOne({
        user_id: userId,
        channel_id: req?.channel_id,
      });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("mentor/list") !== -1)
      ) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "mentor/list")) {
        havePermission = true;
      }

      if (!havePermission) {
        throw new ForbiddenException("You not have permission for this action!");
      }

      //Check Permission

      // updateGiftData = { ...updateGiftData, ...{ user_id: userId } };

      if (updateGiftData?.gift_conditions) {
        updateGiftData = {
          ...updateGiftData,
          ...{ gift_conditions: JSON.parse(updateGiftData?.gift_conditions) },
        };
      }

      const dataReturn = await this.giftService.update(updateGiftData);
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
   * @param updateGiftData
   * @param res
   * @param req
   * @returns
   */
  async updateUserGift(updateGiftData: UpdateUserGiftDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const userId = req?.user_id;
      const userPermission = await this.channelPermissionService.findOne({
        user_id: userId,
        channel_id: req?.channel_id,
      });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("mentor/list") !== -1)
      ) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "mentor/list")) {
        havePermission = true;
      }

      if (!havePermission) {
        throw new ForbiddenException("You not have permission for this action!");
      }

      const oldUserGift = await this.userGiftService.findOne({ _id: updateGiftData._id });
      const dataReturn = await this.userGiftService.update(updateGiftData);
      if (updateGiftData.gift_status !== "pending" && oldUserGift.gift_status !== updateGiftData?.gift_status) {
        this.eventHookNotificationService.sendNotiApplyReceiveGift({
          send_user_id: req?.user_id?.toString(),
          user_id: req?.user_object?._id.toString(),
          channel_id: req.channel_id,
          path: `/r/gift/receivers`,
          mail_template: "apply_receive_gift",
          content: (params: any) => {
            switch (updateGiftData.gift_status) {
              case "prepare":
                return `Quà tặng tại kênh ${params.channel_name} đang được chuẩn bị`;
              case "transport":
                return `Quà tặng tại kênh ${params.channel_name} đang được vận chuyển đến bạn`;
              case "received":
                return `Bạn đã nhận được món quà từ kênh ${params.channel_name}`;
              case "cancel":
                return `Quà tặng tại kênh ${params.channel_name} đã bị hủy`;
            }
          },
          title: `QUÀ CỦA BẠN ĐANG DI CHUYỂN`,
        });
      }
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
   * @param query
   * @param res
   * @param req
   * @returns
   */
  async getAllUserGiftByAdmin(query: ListUserGiftDto, res: Response, req: ExpressRequestDto) {
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
      const userId = userObject._id.toString();
      // if (await this.userPermissionService.isHavePermission(userId, "gift/list")) {
      //Check Permission
      let dataToFilter = query;
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const channelId = req?.channel_id || query?.channel_id;

      if (channelId) {
        dataToFilter = { ...dataToFilter, ...{ channel_id: channelId } };
      }

      const dataReturn = await this.userGiftService.filter(dataToFilter, orderByOBject, page, limit);

      let dataChannelPermission = [];

      for (const dataIndexItem in dataReturn) {
        dataReturn[dataIndexItem] = { ...dataReturn[dataIndexItem]?.toObject() };
      }

      //Get Data level
      if (channelId) {
        const dataUserIds = dataReturn?.map((value) => {
          return value?.user_id?._id?.toString();
        });
        //get permission
        const dataFilterMember = {
          channel_id: channelId,
          user_ids: dataUserIds,
        };
        dataChannelPermission = await this.channelPermissionService.filterWithoutChannel(
          dataFilterMember,
          {},
          1,
          limit
        );
      }
      for (const dataReturnItem in dataReturn) {
        //Check user
        const dataToMerge = dataChannelPermission?.reduce(function (filtered, value) {
          if (value?.user_id?._id?.toString() == dataReturn[dataReturnItem]?.user_id?._id?.toString()) {
            filtered.push({
              ...value?.user_id?.toObject(),
              ...{
                channel_role: value?.channel_role,
                coin_number: value?.coin_number,
                permission: value?.permission,
                point: value?.point,
                level_number: value?.level_number,
              },
            });
          }
          return filtered;
        }, []);

        if (dataToMerge && dataToMerge[0]) {
          dataReturn[dataReturnItem] = { ...dataReturn[dataReturnItem], ...{ user_id: dataToMerge[0] } };
        }
      }

      const dataCount = await this.userGiftService.count(dataToFilter);
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

  /**
   * @author Tony Vu
   * @param query
   * @param res
   * @param req
   * @returns
   */
  async getListGift(query: ListGiftDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};

      if (query?.order_by && query?.order_type == "price") {
        orderByOBject = { ...orderByOBject, ...{ price: query.order_by } };
      }

      if (query?.order_by && query?.order_type == "time") {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }

      if (query?.order_by && query?.order_type == "stock_qty") {
        orderByOBject = { ...orderByOBject, ...{ stock_qty: query.order_by } };
      }

      if (query.order_by && !query?.order_type) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }

      //Check Permission
      let dataToFilter = query;
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      if (req?.channel_id) {
        dataToFilter = { ...dataToFilter, ...{ channel_id: req?.channel_id } };
      }
      const dataReturn = await this.giftService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.giftService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param updateGiftData
   * @param res
   * @param req
   * @returns
   */
  async handleSellGift(updateGiftData: CreateSellGiftDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const authCode = req?.auth_code;
      const userId = userObject._id.toString();
      const dataReturn = null;

      //Check Coin
      const dataGift = await this.giftService.findOne({ _id: updateGiftData.gift_id });

      if (dataGift) {
        //get gif Coin
        const coinOfGift = Number(dataGift?.price);
        const totalCoin = coinOfGift * Number(updateGiftData?.quantity);

        //Check Coin of User
        const userAfterObject: any = await this.appUserService.findOneLogin({ _id: userId });
        //let userCoin = Number(userAfterObject?.current_coin);

        //Check coin before;
        const dataUserCoinBefore = await this.userGiftService.findOne({
          user_id: userObject?._id,
          gift_id: updateGiftData?.gift_id,
        });

        if (!dataUserCoinBefore) {
          throw new BadRequestException("Not enough gift to sell!");
        }
        const totalQuantity = Number(dataUserCoinBefore?.quantity);
        if (totalQuantity < Number(updateGiftData?.quantity)) {
          throw new BadRequestException("Not enough gift to sell!");
        } else {
          let dataToReturn = null;
          await this.transactionHelper.handleProcessUpdateCoinGift(userAfterObject, 0, totalCoin, dataGift, authCode);
          //Update
          if (totalQuantity == Number(updateGiftData?.quantity)) {
            //Remove user gift
            await this.userGiftService.remove(dataUserCoinBefore?._id?.toString());
            return res
              .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
              .status(HttpStatus.OK)
              .json(dataUserCoinBefore);
          } else {
            const giftQuantityAfter = totalQuantity - Number(updateGiftData?.quantity);
            const totalCoinAfter = giftQuantityAfter * Number(dataGift?.price);
            const dataCoinUser = {
              _id: dataUserCoinBefore?._id?.toString(),
              quantity: giftQuantityAfter,
              total_price: totalCoinAfter,
            };
            dataToReturn = await this.userGiftService.update(dataCoinUser);
            return res
              .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
              .status(HttpStatus.OK)
              .json(dataToReturn);
          }
        }
      } else {
        throw new BadRequestException("Gift not found!");
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async handleSendNotiGiftsDerlivered(data: any) {}

  async handleAutoGiveGift(updateGiftData: NotiGiveGiftDto) {
    try {
      const dataGift = updateGiftData.gift_id;
      // if (Number(dataGift?.stock_qty) > 0 && Number(dataGift?.gift_conditions?.coin) > 0) {
      if (Number(dataGift?.stock_qty) > 0) {
        const dataChannel = await this.channelService.findOne({ _id: dataGift.channel_id });

        //Check Mentor
        if (dataGift) {
          //get gif Coin
          const coinOfGift = Number(dataGift?.price);
          const quantityOfGift = Number(dataGift.stock_qty);
          const dataPartnerObject = updateGiftData?.partner_id?.split(",");

          if (quantityOfGift == 0 && quantityOfGift < dataPartnerObject?.length) {
            throw new BadRequestException("Not enough gift to sell!");
          }
          let totalQuantityUpdate = 0;
          let stock_qty = Number(dataGift?.stock_qty);
          for (const partnerObject of dataPartnerObject) {
            const dataUserGift = await this.notificationService.findOne({
              gift_id: dataGift._id.toString(),
              user_id: partnerObject,
            });
            if (!dataUserGift && stock_qty > 0) {
              const totalPrice = Number(coinOfGift) * Number(updateGiftData?.quantity);
              const dataUser = await this.userService.findOne({ _id: partnerObject });

              // let dataToReturn = null;
              const dataCoinUser = {
                user_id: partnerObject,
                channel_id: dataGift?.channel_id?.toString(),
                gift_id: dataGift._id.toString(),
                quantity: updateGiftData?.quantity,
                total_price: totalPrice,
                gift_status: "received",
              };
              totalQuantityUpdate = totalQuantityUpdate + Number(updateGiftData?.quantity);
              const dataToReturnPartner: any = await this.userGiftService.create(dataCoinUser);
              this.logger.log("Send Gift To Memmer Success" + JSON.stringify(dataToReturnPartner));
              await this.queueService.addTaskNoti({ dataChannel: dataChannel, dataUser: dataUser, dataGift: dataGift });
              // await this.notificationHelper.sendNotificationAndEmailReceiveGift(dataChannel, dataUser, dataGift);
              await this.giftService.updateCount({ _id: dataGift?._id?.toString() }, { stock_qty: -1 });
              stock_qty--;
            }
          }
        }
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param updateGiftData
   * @param res
   * @param req
   * @returns
   */
  async handleGiveGift(updateGiftData: CreateGiveGiftDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const authCode = req?.auth_code;
      const sessionId = req?.session_id;
      // let channelId = req?.channel_id;
      const userId = userObject._id.toString();
      const dataReturn = null;
      const dataGiftArray = updateGiftData?.gift_id?.split(",");
      const dataToReturn = [];
      for (const dataGiftItem of dataGiftArray) {
        //Check Coin
        const dataGift = await this.giftService.findOne({ _id: dataGiftItem });
        const channelId = dataGift?.channel_id?.toString();
        const dataChannel = await this.channelService.findOne({ _id: channelId });

        const userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
        let havePermission = false;
        if (
          userPermission?.channel_role == "mentor" ||
          userPermission?.channel_role == "super_admin" ||
          (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("gift/add") !== -1)
        ) {
          havePermission = true;
        }
        if (await this.userPermissionService.isHavePermission(userId, "gift/add")) {
          havePermission = true;
        }

        if (!havePermission) {
          throw new ForbiddenException("You not have permission for this action!");
        }
        //Check Mentor
        if (dataGift) {
          //get gif Coin
          const coinOfGift = Number(dataGift?.price);
          const quantityOfGift = Number(dataGift.stock_qty);
          const dataPartnerObject = updateGiftData?.partner_id?.split(",");

          if (quantityOfGift == 0 && quantityOfGift < dataPartnerObject?.length) {
            throw new BadRequestException("Not enough gift to sell!");
          }
          let totalQuantityUpdate = 0;

          for (const partnerObject of dataPartnerObject) {
            const totalPrice = Number(coinOfGift) * Number(updateGiftData?.quantity);
            const dataUser = await this.userService.findOne({ _id: partnerObject });

            // let dataToReturn = null;
            const dataCoinUser = {
              user_id: partnerObject,
              gift_id: dataGiftItem,
              quantity: updateGiftData?.quantity,
              channel_id: dataGift?.channel_id,
              total_price: totalPrice,
              gift_status: "prepare",
            };
            totalQuantityUpdate = totalQuantityUpdate + Number(updateGiftData?.quantity);
            const dataToReturnPartner: any = await this.userGiftService.create(dataCoinUser);
            dataToReturn.push(dataToReturnPartner?.toObject());
            await this.queueService.addTaskNoti({ dataChannel: dataChannel, dataUser: dataUser, dataGift: dataGift });
            // await this.notificationHelper.sendNotificationAndEmailReceiveGift(dataChannel, dataUser, dataGift);
          }
          if (!dataToReturn || !dataToReturn?.length) {
            throw new BadRequestException("Can't give gift!");
          }
          //Update Count
          await this.giftService.updateCount(
            { _id: dataGift?._id?.toString() },
            { stock_qty: 0 - totalQuantityUpdate }
          );
        } else {
          throw new BadRequestException("Gift not found!");
        }
      }
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataToReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param updateGiftData
   * @param res
   * @param req
   * @returns
   */
  async handleBuyGift(updateGiftData: CreateBuyGiftDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const authCode = req?.auth_code;
      const userId = userObject._id.toString();
      const dataReturn = null;

      //Check Coin
      const dataGift = await this.giftService.findOne({ _id: updateGiftData.gift_id });

      if (dataGift) {
        //get gif Coin
        const coinOfGift = Number(dataGift?.price);
        const totalCoin = coinOfGift * Number(updateGiftData?.quantity);
        //Check Coin of User
        const userAfterObject: any = await this.appUserService.findOneLogin({ _id: userId });
        const userCoin = Number(userAfterObject?.current_coin);
        if (userCoin < totalCoin) {
          throw new BadRequestException("Not enough coin to buy this gift!");
        } else {
          //Update coin and update gift
          await this.transactionHelper.handleProcessUpdateCoinGift(userAfterObject, totalCoin, 0, dataGift, authCode);
          //Check coin before;
          const dataUserCoinBefore = await this.userGiftService.findOne({
            user_id: userObject?._id,
            gift_id: updateGiftData?.gift_id,
          });
          let dataToReturn = null;
          if (dataUserCoinBefore) {
            const totalPrice = Number(totalCoin) + Number(dataUserCoinBefore?.total_price);
            const totalQuantity = Number(updateGiftData?.quantity) + Number(dataUserCoinBefore?.quantity);
            const dataCoinUser = {
              _id: dataUserCoinBefore?._id?.toString(),
              quantity: totalQuantity,
              total_price: totalPrice,
            };
            dataToReturn = await this.userGiftService.update(dataCoinUser);
          } else {
            const dataCoinUser = {
              user_id: userObject?._id?.toString(),
              gift_id: updateGiftData?.gift_id,
              channel_id: dataGift?.channel_id,
              quantity: updateGiftData?.quantity,
              total_price: totalCoin,
            };
            dataToReturn = await this.userGiftService.create(dataCoinUser);
            dataToReturn = { ...dataToReturn?.toObject(), ...{ gift_id: dataGift } };
          }

          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json(dataToReturn);
        }
      } else {
        throw new BadRequestException("Gift not found!");
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
  async getUserGiftByUserId(query: ListUserGiftDto, id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (id !== userObject._id.toString()) {
        if (!(await this.userPermissionService.isHavePermission(userId, "gift/list"))) {
          throw new BadRequestException("You haven't permission for this Action!");
        }
      }
      //Check Permission
      let dataToFilter = {
        user_id: id,
      };
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }
      const dataToFilterBefore = query;
      delete dataToFilterBefore.page;
      delete dataToFilterBefore.limit;
      delete dataToFilterBefore.order_by;
      dataToFilter = { ...dataToFilterBefore, ...dataToFilter };
      const dataReturn = await this.userGiftService.filter(dataToFilter, orderByOBject, page, limit);
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
   * @param res
   * @param req
   * @returns
   */
  async removeGift(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }

      const userId = req?.user_id;
      const userPermission = await this.channelPermissionService.findOne({
        user_id: userId,
        channel_id: req?.channel_id,
      });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("mentor/list") !== -1)
      ) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "mentor/list")) {
        havePermission = true;
      }

      if (!havePermission) {
        throw new ForbiddenException("You not have permission for this action!");
      }

      if (await this.userPermissionService.isHavePermission(userId, "gift/delete")) {
        //Check Permission
        const dataReturn = await this.giftService.remove(id);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
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
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleGetDetailGift(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      let userId = "";
      if (userObject) {
        userId = userObject._id.toString();
      }
      const dataFilter = {
        _id: id,
      };
      //Check Permission
      let dataReturn: any = await this.giftService.findOne(dataFilter);
      //Check gift
      if (userId) {
        const dataUserGiftFilterr = {
          user_id: userId,
          gift_id: id,
        };
        const dataUserGift: any = await this.userGiftService.findOne(dataUserGiftFilterr);
        dataReturn = { ...dataReturn.toObject(), ...{ last_user_gift: dataUserGift?.toObject() } };
      }

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param message
   * @param userObject
   * @param chatRoomId
   * @param roomName
   */
  async setSystemMessage(
    dataGift: Gift,
    quantity: number,
    userObject: User,
    chatRoomId: string,
    roomName: string,
    req: any,
    res: any,
    authCode: string,
    sessionId: string
  ) {
    const mediaMeta = [
      {
        key: "display_name",
        value: userObject?.display_name,
      },
      {
        key: "gift_name",
        value: dataGift?.name,
      },
      { key: "quantity", value: quantity },
      {
        key: "data_object",
        value: JSON.stringify(dataGift),
      },
    ];

    const dataToCreate = {
      media_url: roomName,
      createBy: userObject._id.toString(),
      media_type: "gift",
      media_mime_type: "",
      media_file_name: "",
      media_thumbnail: "",
      media_meta: mediaMeta,
      chat_room_id: chatRoomId,
      chat_history_id: null,
      media_status: 1,
    };
    const currentTime = new Date();
    const dataMedia = await this.chatMediaService.create(dataToCreate);
    if (dataMedia) {
      const createChatHistoryDto = {
        chat_room_id: chatRoomId,
        chat_content: "",
        media_data: JSON.stringify([dataMedia._id.toString()]),
      };

      req.user_id = userObject?._id.toString();
      req.user_object = userObject;
      req.session_id = sessionId;
      req.auth_code = authCode;

      try {
        const dataReturnHistory: any = await this.chatHistoryHelper.createNewHistory(
          req,
          res,
          createChatHistoryDto,
          false,
          true
        );
      } catch (error) {
        console.log(error);
      }
    }
  }

  async plusPointBox(res: Response, req: ExpressRequestDto) {
    try {
      const pointPlus = Math.floor(Math.random() * 11);
      const channelId = req?.channel_id?.toString();
      const userOject = req?.user_object;
      const channelPermission = await this.channelPermissionService.findOne({
        channel_id: channelId,
        user_id: userOject?._id.toString(),
      });
      if (channelPermission) {
        await this.channelPermissionService.updateCount(
          {
            channel_id: channelId,
            user_id: userOject?._id.toString(),
          },
          {
            coin_number: pointPlus,
          }
        );
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json({
            coin: pointPlus,
          });
      } else {
        throw new BadRequestException("Không tìm thấy thông tin người dùng trong Kênh!");
      }
    } catch (error) {
      this.logger.log("Plus Coin Box Fails : ", error?.message);
      throw new NotFoundException(error.message);
    }
  }
}
