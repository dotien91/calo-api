import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { JwtHelperService } from "../../../modules/core/services/jwt_helper.service";
import { AddCoinToUserData, AddPointToUserData } from "../../../modules/hook/interfaces/hook.interface";
import { EventHookWorkerService } from "../../../modules/hook/services/hook_do.service";
import { SocketService } from "../../../modules/socket/services/socket.service";
import { SocketPath } from "../../../modules/socket/services/socket.service.i";
import { TransactionRefType } from "../../../modules/transaction/interfaces/transaction.interface";
import { User } from "../../../modules/user/schemas/user.schema";
import { FilterRedeemUserDTO } from "../dtos/redeem_user.dto";
import {
  RedeemMissionActionTarget,
  RedeemMissionActionType,
  RedeemMissionStatus,
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
    private socketService: SocketService
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

  async updateUserRedeem(
    user: User,
    action_type: RedeemMissionActionType,
    action_target: RedeemMissionActionTarget,
    social_links?: string[]
  ) {
    const counter = `${action_type}_${action_target}_counter`;

    const updateObject = { $inc: {}, $push: {} };
    updateObject.$inc[counter] = 1;
    updateObject.$push["share_link_container"] = {};
    updateObject.$push["share_link_container"]["$each"] = social_links;

    // update counter
    await this.redeemUserModel.updateMany({ user_id: user._id.toString() }, updateObject);
    await this.checkRedeemUserProcess(user, counter);

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

      const [action_type, action_target] = counter.split("_");

      const targetMissions = currentCheckingRedeem.missions.filter((mission) => {
        return (
          mission.action_type === action_type &&
          mission.action_target === action_target &&
          mission.status === RedeemMissionStatus.PROCESS
        );
      });

      for (const targetMission of targetMissions) {
        if (targetMission.action_amount <= redeemHistory[counter]) {
          await this.redeemMissionService.update({
            _id: targetMission._id.toString(),
            status: RedeemMissionStatus.DONE,
          });

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
}
