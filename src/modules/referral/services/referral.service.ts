import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AddPointToUserData } from "../../../modules/hook/interfaces/hook.interface";
import { EventHookWorkerService } from "../../../modules/hook/services/hook_do.service";
import { TransactionRefType } from "../../../modules/transaction/interfaces/transaction.interface";
import {
  UserPointHistory_EntityAction,
  UserPointHistory_EntityTarget,
} from "../../../modules/user/interfaces/user.interface";
import { User } from "../../../modules/user/schemas/user.schema";
import { UserService } from "../../../modules/user/services/user.service";
import { FilterReferralDTO } from "../dtos/referral.dto";
import { CreateReferralDTO, ReferralType } from "../interfaces/referral.interface.i";
import { Referral, ReferralDocument } from "../schemas/referral.schema";

@Injectable()
export class ReferralService {
  constructor(
    @InjectModel(Referral.name)
    private referralModel: Model<ReferralDocument>,

    private userService: UserService,
    private eventHookWorkerService: EventHookWorkerService
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateReferralDTO): Promise<Referral> {
    const createdUser = new this.referralModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async remove(dataToSearch: any): Promise<any> {
    await this.referralModel.deleteMany(dataToSearch);
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(pattern?: any, isPopulate: boolean = false): Promise<Referral[]> {
    if (isPopulate) {
      return this.referralModel.find(pattern).populate("user_id").populate("from_user_id").exec();
    } else return this.referralModel.find(pattern).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<Referral> {
    if (isWithUser) {
      return await this.referralModel.findOne(dataToSearch).exec();
    } else {
      return await this.referralModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: any) {
    try {
      const dataReturn = await this.referralModel.findOneAndUpdate(
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

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  public count = async (filter: FilterReferralDTO) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.referralModel.estimatedDocumentCount();
      } else {
        return this.referralModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
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

  getCondition(filter: FilterReferralDTO) {
    let condition: any = {};

    if (filter.user_id) {
      condition = Object.assign(condition, {
        user_id: filter.user_id,
      });
    }

    if (filter.from_user_id) {
      condition = Object.assign(condition, {
        from_user_id: filter.from_user_id,
      });
    }

    if (filter.type) {
      condition = Object.assign(condition, {
        type: filter.type,
      });
    }

    return condition;
  }

  async filter(
    filter: FilterReferralDTO,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<Referral[]> {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.referralModel
      .find(condition, projection)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  async processSignUpBonusForReferralUser(invitationCode: string, userObject: User) {
    try {
      const bonusCoin = 1;
      const bonusPoint = 20;
      this.processReferral(invitationCode, userObject, bonusCoin, ReferralType.SIGN_UP, (userId, entityId) => {
        const data: AddPointToUserData = {
          user_id: userId,
          point: bonusPoint,
          entity_id: entityId,
          entity_target: UserPointHistory_EntityTarget.ACCOUNT,
          entity_action: UserPointHistory_EntityAction.REFERRAL,
        };
        this.eventHookWorkerService.AddPointToUser(data);
      });
    } catch (e) {
      console.log(e.message);
    }
  }

  async processBuyCourseBonusForReferralUser(invitationCode: string, userObject: User, price: number) {
    try {
      const bonusCoin = 0.0008 * price;
      this.processReferral(invitationCode, userObject, bonusCoin, ReferralType.BUY_COURSE);
    } catch (e) {
      console.log(e.message);
    }
  }

  async processCompletedCourseBonusForReferralUser(userObject: User, price: number) {
    try {
      const bonusCoin = 0.0002 * price;
      this.processReferral(userObject.invitation_code, userObject, bonusCoin, ReferralType.COMPLETE_COURSE);
    } catch (e) {
      console.log(e.message);
    }
  }

  private async processReferral(
    invitationCode: string,
    userObject: User,
    coin: number,
    referralType: string,
    processPoint?: (userId: string, entityId: string) => void
  ) {
    try {
      const referralUser = await this.userService.findOne({
        invitation_code: invitationCode,
      });

      if (referralUser) {
        const referral = await this.findOne({
          user_id: userObject._id.toString(),
          from_user_id: referralUser._id.toString(),
          type: referralType,
        });
        if (referral) throw new Error("User already do this referral");

        const referralData = await this.create({
          user_id: userObject._id.toString(),
          from_user_id: referralUser._id.toString(),
          type: referralType,
        });
        processPoint(referralUser._id.toString(), referralData?._id?.toString());
        this.eventHookWorkerService.AddCoinToUser({
          userId: referralUser._id.toString(),
          coin,
          refObject: referralData,
          refType: TransactionRefType.REFERRAL,
        });
      }
    } catch (e) {
      console.log(e.message);
    }
  }
}
