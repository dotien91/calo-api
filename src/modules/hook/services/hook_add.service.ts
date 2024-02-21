import { Injectable } from "@nestjs/common";
import axios from "axios";
import { JwtHelperService } from "../../../modules/core/services/jwt_helper.service";
import { UserService } from "../../../modules/user/services/user.service";
import { UserPointHistoryService } from "../../../modules/user/services/user_point_history.service";
import HookExpress from "../hook_express";
import { AddPointToUserData } from "../interfaces/hook.interface";
let alreadyWork = false;

@Injectable()
export class EventHookAdderService {
  constructor(
    private readonly userService: UserService,
    private readonly userPointHistoryService: UserPointHistoryService,
    private readonly jwtHelperService: JwtHelperService
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
          entity_type: data.entity_type,
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

          let dataForSending = {
            user_id: data.user_id,
            point: String(newUserData.point),
            is_level_up: String(newUserData.is_level_up),
          };
          const params = new URLSearchParams(dataForSending);
          const config = {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "X-Authorization": authCode,
            },
          };
          let dataNotification = await axios
            .post(process.env.SOCKET_API + "/update-point", params, config)
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
  }

  async sendSocket(dataToSendSocket: any, authCode: any) {
    //Send Socket
    const urlLogin = process.env.SOCKET_API;
    if (authCode && dataToSendSocket) {
      const dataToObject = {
        redeem: JSON.stringify(dataToSendSocket),
      };
      const paramsRedeem = new URLSearchParams(dataToObject);
      console.log(paramsRedeem, "paramsRedeem");
      const config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Authorization": authCode,
        },
      };
      const dataNotification = await axios
        .post(urlLogin + "/update-redeem", paramsRedeem, config)
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
