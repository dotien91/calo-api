import { Injectable } from "@nestjs/common";
import { JwtHelperService } from "../../../modules/core/services/jwt_helper.service";
import { TransactionHelper } from "../../../modules/transaction/helper/transaction.helper";
import HookExpress from "../hook_express";
import { AddCoinToUserData, AddPointToUserData } from "../interfaces/hook.interface";
let alreadyWork = false;

@Injectable()
export class EventHookAdderService {
  constructor(
    private readonly jwtHelperService: JwtHelperService,
    private readonly transactionHelper: TransactionHelper
  ) {
    if (alreadyWork !== true) {
      this.initHook();
      alreadyWork = true;
    }
  }

  initHook() {
    HookExpress.add_action("user.plus-point", async (data: AddPointToUserData) => {
      try {
        const authCode = this.jwtHelperService.generateJwt(data.user_id, "", "").toString();

        await this.transactionHelper.handleProcessUpdatePointHook(data, authCode);
      } catch (error) {
        console.log("Plus point for customer fails :", error.message);
      }
    });

    HookExpress.add_action("user.plus-coin", async (data: AddCoinToUserData) => {
      try {
        const authCode = this.jwtHelperService.generateJwt(data.userId, "", "");

        await this.transactionHelper.handleProcessUpdateCoinHook(data, String(authCode));
      } catch (error) {
        console.log("Plus coin for customer fails :", error.message);
      }
    });
  }
}
