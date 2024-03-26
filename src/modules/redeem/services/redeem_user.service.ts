import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { JwtHelperService } from "../../../modules/core/services/jwt_helper.service";
import { AddCoinToUserData, AddPointToUserData } from "../../../modules/hook/interfaces/hook.interface";
import { EventHookWorkerService } from "../../../modules/hook/services/hook_do.service";
import { SocketService } from "../../../modules/socket/services/socket.service";
import { SocketPath } from "../../../modules/socket/services/socket.service.i";
import { TelegramService } from "../../../modules/telegram/services/telegram.service";
import { TransactionRefType } from "../../../modules/transaction/interfaces/transaction.interface";
import { User } from "../../../modules/user/schemas/user.schema";
import { HandleUpdateSocialLinkAction, HandleUpdateSocialLinkByUser } from "../dtos/redeem.dto";
import { FilterRedeemUserDTO } from "../dtos/redeem_user.dto";
import {
  RedeemMissionActionTarget,
  RedeemMissionActionType,
  RedeemUserSocialLinkStatus,
} from "../interfaces/redeem.interface.i";
import { RedeemUser, RedeemUserDocument } from "../schemas/redeem_user.schema";
import { RedeemService } from "./redeem.service";
import { RedeemMissionService } from "./redeem_mission.service";

@Injectable()
export class RedeemUserService {
  constructor(
    @InjectModel(RedeemUser.name)
    private redeemUserModel: Model<RedeemUserDocument>,

    private redeemService: RedeemService,
    private redeemMissionService: RedeemMissionService,
    private eventHookWorkerService: EventHookWorkerService,
    private jwtHelperService: JwtHelperService,
    private socketService: SocketService,
    private telegramService: TelegramService
  ) {}

  async create(createUser): Promise<RedeemUser> {
    const createdUser = new this.redeemUserModel(createUser);
    return createdUser.save();
  }

  async remove(dataToSearch: any): Promise<any> {
    await this.redeemUserModel.deleteMany(dataToSearch);
  }

  async findAll(pattern?: any): Promise<RedeemUser[]> {
    return this.redeemUserModel.find(pattern).exec();
  }

  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<RedeemUser> {
    if (isWithUser) {
      return await this.redeemUserModel.findOne(dataToSearch).exec();
    } else {
      return await this.redeemUserModel.findOne(dataToSearch).exec();
    }
  }

  async update(dataUpdate: any) {
    try {
      const dataReturn = await this.redeemUserModel.findOneAndUpdate(
        { _id: dataUpdate._id },
        { $set: dataUpdate },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (dataReturn._id) {
        return { ...dataReturn.toObject(), ...dataUpdate };
      } else {
        return dataReturn;
      }
    } catch (e) {
      return e;
    }
  }

  public count = async (filter: FilterRedeemUserDTO) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.redeemUserModel.estimatedDocumentCount();
      } else {
        return this.redeemUserModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };

  getSort(sortBy: any) {
    let sort = { priority: -1 };
    if (sortBy.createdAt) {
      sort = Object.assign(sort, { _id: sortBy.createdAt === "DESC" ? -1 : 1 });
    }
    if (sortBy.updatedAt) {
      sort = Object.assign(sort, { updatedAt: sortBy.updatedAt === "DESC" ? -1 : 1 });
    }
    return sort;
  }

  getCondition(filter: FilterRedeemUserDTO) {
    let condition: any = {};

    if (filter.redeem_id) {
      condition = Object.assign(condition, { redeem_id: filter.redeem_id });
    }

    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }

    return condition;
  }

  async filter(
    filter: FilterRedeemUserDTO,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<RedeemUser[]> {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.redeemUserModel
      .find(condition, projection)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  async updateUserRedeem(user: User, action_type: RedeemMissionActionType, action_target: RedeemMissionActionTarget) {
    const counter = `${action_type}_${action_target}_counter`;

    const updateObject = { $inc: {} };
    updateObject.$inc[counter] = 1;

    // update counter
    await this.redeemUserModel.updateMany({ user_id: user._id.toString() }, updateObject);
    await this.checkRedeemUserProcess(user, counter);

    return null;
  }

  async updateShareLinkAction(user: User, body: HandleUpdateSocialLinkAction) {
    const updateObject = { $push: {} };
    updateObject.$push["share_link_container"] = {
      redeem_mission_id: new mongoose.Types.ObjectId(body.redeem_mission_id),
      social_link: body.social_link,
      view_counter: 0,
      like_counter: 0,
      comment_counter: 0,
      share_counter: 0,
      status: RedeemUserSocialLinkStatus.PENDING,
    };

    // update counter
    await this.redeemUserModel.updateOne({ user_id: user._id.toString(), redeem_id: body.redeem_id }, updateObject);

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

    this.telegramService.sendMessage({
      chat_id: process.env.TELEGRAM_ROOM_ID,
      text: `<b>========================</b>\n<b>THÔNG BÁO ĐĂNG TẢI VIDEO</b>\nĐịa chỉ:${
        body.social_link
      }\nTrạng thái: <b>${"PENDING"}</b>\n<a href="${
        baseUrl +
        "/api/redeem/update-link?redeem_id=65f174e71145e857a7e80518&user_id=6589231382a81d6187758f7e&social_link=https://www.tiktok.com/@dong/video/7339526559176445202&status=active"
      }">Duyệt video ✅</a>\n<a href="${
        baseUrl +
        "/api/redeem/update-link?redeem_id=65f174e71145e857a7e80518&user_id=6589231382a81d6187758f7e&social_link=https://www.tiktok.com/@dong/video/7339526559176445202&status=reject"
      }">Từ chối video ⛔️</a>
      `,
      parse_mode: "HTML",
    });

    return null;
  }

  async updateShareLinkActionByUser(body: HandleUpdateSocialLinkByUser) {
    const redeemUser = await this.redeemUserModel.findOne({ user_id: body.user_id, redeem_id: body.redeem_id });
    if (!redeemUser) throw new NotFoundException("Not found redeem user");

    const index = redeemUser.share_link_container.findIndex((obj) => obj.social_link === body.social_link);
    if (index !== -1) {
      if (body.status === RedeemUserSocialLinkStatus.REJECT) {
        redeemUser.share_link_container.splice(index, 1);
      } else if (body.status === RedeemUserSocialLinkStatus.ACTIVE)
        redeemUser.share_link_container[index] = {
          ...redeemUser.share_link_container[index],
          status: RedeemUserSocialLinkStatus.ACTIVE,
        };
    }
    await this.redeemUserModel.updateOne(
      { _id: redeemUser._id.toString() },
      { share_link_container: redeemUser.share_link_container }
    );

    this.telegramService.sendMessage({
      chat_id: process.env.TELEGRAM_ROOM_ID,
      text: `
      <b>========================</b>\n<b>THÔNG BÁO CẬP NHẬT TRẠNG THÁI VIDEO</b>\nĐịa chỉ: ${
        body.social_link
      }\nTrạng thái: <b>${body.status.toUpperCase()}</b>
      `,
      parse_mode: "HTML",
    });

    return null;
  }

  private async checkRedeemUserProcess(user: User, counter: string) {
    const userId = user._id.toString();
    const assignedRedeems = await this.findAll({ user_id: userId });
    const redeemMissions = await this.redeemService.getListMissionOfRedeemsByUser(user);

    for (const redeemHistory of assignedRedeems) {
      const currentCheckingRedeem = redeemMissions.find(
        (redeem) => redeem._id.toString() === redeemHistory.redeem_id.toString()
      );
      const doneMissionIds = redeemHistory.done_redeem_mission_ids.map((id) => id.toString());

      const [action_type, action_target] = counter.split("_");

      const targetMissions = currentCheckingRedeem.missions.filter((mission) => {
        return (
          mission.action_type === action_type &&
          mission.action_target === action_target &&
          !doneMissionIds.includes(mission._id.toString())
        );
      });

      for (const targetMission of targetMissions) {
        if (targetMission.action_amount <= redeemHistory[counter]) {
          const updateObject = { $push: {} };
          updateObject.$push["done_redeem_mission_ids"] = new mongoose.Types.ObjectId(targetMission._id.toString());
          await this.redeemUserModel.updateOne({ _id: redeemHistory._id.toString() }, updateObject);

          // add point to user
          if (targetMission.point) {
            const data: AddPointToUserData = {
              user_id: userId,
              point: targetMission.point,
              entity_id: targetMission._id,
              entity_action: action_type,
              entity_target: action_target,
            };
            this.eventHookWorkerService.AddPointToUser(data);
          }

          // add coin to user
          if (targetMission.coin) {
            const data: AddCoinToUserData = {
              userId,
              fromUserId: null,
              coin: targetMission.coin,
              refObject: targetMission,
              refType: TransactionRefType.REDEEM_MISSION,
            };

            this.eventHookWorkerService.AddCoinToUser(data);
          }

          // send socket
          const dataForSending = {
            user_id: user._id.toString(),
            mission_id: targetMission._id,
            mission_name: targetMission.title,
            point: targetMission.point,
            coin: targetMission.coin,
          };
          const params = new URLSearchParams(dataForSending);
          const headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Authorization": this.jwtHelperService.generateJwt(user._id.toString(), "", ""),
          };
          await this.socketService
            .send(SocketPath.UPDATE_REDEEM, headers, params)
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
        }
      }
    }
  }

  async checkRedeemUserProcessSocialLink(user: User, redeemMissionIds: string[]) {
    const userId = user._id.toString();
    const assignedRedeems = await this.findAll({ user_id: userId });
    const redeemMissions = await this.redeemService.getListMissionOfRedeemsByUser(user);

    for (const redeemHistory of assignedRedeems) {
      const currentCheckingRedeem = redeemMissions.find(
        (redeem) => redeem._id.toString() === redeemHistory.redeem_id.toString()
      );
      const checkingMissionIds = redeemMissionIds;

      const targetMissions = currentCheckingRedeem.missions.filter((mission) => {
        return checkingMissionIds.includes(mission._id.toString());
      });

      for (const targetMission of targetMissions) {
        const currentLinkRedeem = redeemHistory.share_link_container.find(
          (link) => link.redeem_mission_id.toString() === targetMission._id.toString()
        );
        if (targetMission.action_amount <= currentLinkRedeem[targetMission.action_type + "_counter"]) {
          const updateObject = { $push: {} };
          updateObject.$push["done_redeem_mission_ids"] = new mongoose.Types.ObjectId(targetMission._id.toString());

          // update status for social link
          const index = redeemHistory.share_link_container.findIndex(
            (obj) => obj.social_link === currentLinkRedeem.social_link
          );
          if (index !== -1) {
            redeemHistory.share_link_container[index] = {
              ...currentLinkRedeem,
              status: RedeemUserSocialLinkStatus.DONE, // by setting this, the crawler will not check this url anymore
            };
          }
          updateObject["share_link_container"] = redeemHistory.share_link_container;

          await this.redeemUserModel.updateOne({ _id: redeemHistory._id.toString() }, updateObject);

          // add point to user
          if (targetMission.point) {
            const data: AddPointToUserData = {
              user_id: userId,
              point: targetMission.point,
              entity_id: targetMission._id,
              entity_action: targetMission.action_type,
              entity_target: targetMission.action_target,
            };
            this.eventHookWorkerService.AddPointToUser(data);
          }

          // add coin to user
          if (targetMission.coin) {
            const data: AddCoinToUserData = {
              userId,
              fromUserId: null,
              coin: targetMission.coin,
              refObject: targetMission,
              refType: TransactionRefType.REDEEM_MISSION,
            };

            this.eventHookWorkerService.AddCoinToUser(data);
          }

          // send socket
          const dataForSending = {
            user_id: user._id.toString(),
            mission_id: targetMission._id,
            mission_name: targetMission.title,
            point: targetMission.point,
            coin: targetMission.coin,
          };
          const params = new URLSearchParams(dataForSending);
          const headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Authorization": this.jwtHelperService.generateJwt(user._id.toString(), "", ""),
          };
          await this.socketService
            .send(SocketPath.UPDATE_REDEEM, headers, params)
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
        }
      }
    }
  }
}
