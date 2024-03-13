import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import mongoose from "mongoose";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { UserService } from "../../../modules/user/services/user.service";
import {
  CreateRedeemDTO,
  HandleCheckUserSocialActionDTO,
  HandleUpdateSocialLinkAction,
  HandleUpdateUserRedeemDTO,
  ListRedeemDto,
  UpdateRedeemDTO,
} from "../dtos/redeem.dto";
import { RedeemMissionActionTarget, RedeemMissionActionType } from "../interfaces/redeem.interface.i";
import { RedeemService } from "../services/redeem.service";
import { RedeemUserService } from "../services/redeem_user.service";

@Injectable()
export class RedeemHelper {
  constructor(
    private redeemService: RedeemService,
    private redeemUserService: RedeemUserService,
    private userService: UserService
  ) {}

  async getUserRedeem(res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) throw new Error("Invalid user");

      const redeems = await this.redeemService.getListMissionOfRedeemsByUser(userObject);

      // this process will create user - redeem history
      for (const redeem of redeems) {
        const redeemUser = await this.redeemUserService.findOne({
          user_id: userObject._id.toString(),
          redeem_id: redeem._id,
        });
        if (!redeemUser) {
          this.redeemUserService.create({
            user_id: userObject._id.toString(),
            redeem_id: redeem._id,
          });
        }

        for (const mission of redeem.missions) {
          let counter = 0;
          if (redeemUser) counter = redeemUser[`${mission.action_type}_${mission.action_target}_counter`];
          mission["action_counter"] = counter > mission.action_amount ? mission.action_amount : counter;

          if (
            redeemUser.done_redeem_mission_ids.find(
              (redeem_mission_id) => redeem_mission_id.toString() === mission._id.toString()
            )
          ) {
            mission["status"] = true;
          } else mission["status"] = false;
        }
      }

      return res
        .set({
          "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count",
        })
        .status(HttpStatus.OK)
        .json(redeems);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async list(query: ListRedeemDto, res: Response, req: ExpressRequestDto) {
    try {
      let dataToFilter = {};
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

      const dataReturn = await this.redeemService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.redeemService.count(dataToFilter);

      return res
        .set({
          "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count",
          "X-Total-Count": Number(dataCount),
        })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async createRedeem(createRedeemData: CreateRedeemDTO, res: Response, req: ExpressRequestDto) {
    try {
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("Invalid user");

      const dataReturn = await this.redeemService.create({
        ...createRedeemData,
        user_id: userId,
      });

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async updateRedeem(updateRedeemData: UpdateRedeemDTO, res: Response, req: ExpressRequestDto) {
    try {
      //Check Permission
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("Invalid user");

      const redeem = await this.redeemService.findOne({ _id: updateRedeemData._id });
      if (!redeem) throw new Error("Not found redeem");

      if (redeem.user_id.toString() !== userId) throw new Error("You don't have permission to do this");

      const dataReturn = await this.redeemService.update(updateRedeemData);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async removeRedeem(id: string, res: Response, req: ExpressRequestDto) {
    try {
      //Check Permission
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("Invalid user");

      const redeem = await this.redeemService.findOne({ _id: id });
      if (!redeem) throw new Error("Not found redeem");

      if (redeem.user_id.toString() !== userId) throw new Error("You don't have permission to do this");

      await Promise.all([this.redeemService.remove({ _id: new mongoose.Types.ObjectId(id) })]);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async handleGetDetailRedeem(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const dataReturn = await this.redeemService.getListMissionOfRedeems([new mongoose.Types.ObjectId(id)]);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getRedeemEnum(res: Response, req: ExpressRequestDto) {
    try {
      const dataReturn = {
        action_type: [
          RedeemMissionActionType.LIKE,
          RedeemMissionActionType.POST,
          RedeemMissionActionType.COMMENT,
          RedeemMissionActionType.BUY,
          RedeemMissionActionType.COMPLETE,
          RedeemMissionActionType.JOIN,
          RedeemMissionActionType.REFERRAL,
          RedeemMissionActionType.WATCH,
          RedeemMissionActionType.SHARE,
        ],
        action_target: [
          RedeemMissionActionTarget.COMMUNITY,
          RedeemMissionActionTarget.COURSE,
          RedeemMissionActionTarget.TEST,
          RedeemMissionActionTarget.ACCOUNT,
          RedeemMissionActionTarget.PRODUCT,
          RedeemMissionActionTarget.CLASS,
          RedeemMissionActionTarget.ONE_ONE,
          RedeemMissionActionTarget.INSTAGRAM,
          RedeemMissionActionTarget.TELEGRAM,
          RedeemMissionActionTarget.TIKTOK,
          RedeemMissionActionTarget.TWITTER,
          RedeemMissionActionTarget.FACEBOOK,
        ],
      };
      return res
        .set({
          "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count",
        })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async handleUpdateUserRedeem(body: HandleUpdateUserRedeemDTO, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) throw new Error("Invalid user");

      await this.redeemUserService.updateUserRedeem(userObject, body.action_type, body.action_target);

      return res
        .set({
          "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count",
        })
        .status(HttpStatus.OK)
        .json();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async handleUpdateSocialLinkAction(body: HandleUpdateSocialLinkAction, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) throw new Error("Invalid user");

      await this.redeemUserService.updateShareLinkAction(userObject, body);
      return res
        .set({
          "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count",
        })
        .status(HttpStatus.OK)
        .json();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async handleCheckingSocialLinkAction(body: HandleCheckUserSocialActionDTO, res: Response, req: ExpressRequestDto) {
    try {
      const user = await this.userService.findOne({ _id: body.user_id });
      if (!user) throw new Error("Invalid user");

      await this.redeemUserService.checkRedeemUserProcessSocialLink(user, body.redeem_mission_ids);
      return res
        .set({
          "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count",
        })
        .status(HttpStatus.OK)
        .json();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
