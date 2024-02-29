import { Injectable } from "@nestjs/common";
import { JwtHelperService } from "../../../modules/core/services/jwt_helper.service";
import { SocketService } from "../../../modules/socket/services/socket.service";
import { SocketPath } from "../../../modules/socket/services/socket.service.i";
import { TransactionHelper } from "../../../modules/transaction/helper/transaction.helper";
import { UserService } from "../../../modules/user/services/user.service";
import { UserPointHistoryService } from "../../../modules/user/services/user_point_history.service";
import HookExpress from "../hook_express";
import { AddCoinToUserData, AddPointToUserData } from "../interfaces/hook.interface";
let alreadyWork = false;

@Injectable()
export class EventHookAdderService {
  constructor(
    private readonly userService: UserService,
    private readonly userPointHistoryService: UserPointHistoryService,
    private readonly jwtHelperService: JwtHelperService,
    private readonly transactionHelper: TransactionHelper,
    private readonly socketService: SocketService
  ) {
    if (alreadyWork !== true) {
      this.initHook();
      alreadyWork = true;
    }
  }

  initHook() {
    console.log("Make sure you work once %s", Math.random());
    HookExpress.add_action("user.plus-point", async (data: AddPointToUserData) => {
      try {
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

          // send update point socket to user
          const authCode = this.jwtHelperService.generateJwt(data.user_id, "", "");

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
      } catch (error) {
        console.log("Plus point for customer fails :", error.message);
      }
    });

    HookExpress.add_action("user.plus-coin", async (data: AddCoinToUserData) => {
      try {
        const authCode = this.jwtHelperService.generateJwt(data.userId, "", "");

        await this.transactionHelper.handleProcessUpdateCoinHook(
          data.userId,
          data.coin,
          data.refObject,
          data.refType,
          String(authCode)
        );
      } catch (error) {
        console.log("Plus coin for customer fails :", error.message);
      }
    });
  }

  async sendSocket(dataToSendSocket: any, authCode: any) {
    //Send Socket
    if (authCode && dataToSendSocket) {
      const dataToObject = {
        redeem: JSON.stringify(dataToSendSocket),
      };
      const paramsRedeem = new URLSearchParams(dataToObject);
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Authorization": authCode,
      };
      this.socketService
        .send(SocketPath.UPDATE_REDEEM, headers, paramsRedeem)
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
