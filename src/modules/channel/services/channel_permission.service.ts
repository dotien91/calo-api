import { Inject, Injectable, Logger, forwardRef } from "@nestjs/common";
import { ChannelPermission, ChannelPermissionDocument } from "../schemas/channel_permission.schema";
import { CreateChannelPermissionDto } from "../dto/create-channel_permission.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UpdateChannelPermissionDto } from "../dto/update-channel_permission.dto";
import { FilterViewChannelDto } from "../dto/filter-view_channel.dto";
import { ChannelLevel, ChannelLevelDocument } from "../schemas/channel_level.schema";
import axios from "axios";
import { Channel, ChannelDocument } from "../schemas/channel.schema";
import { ChannelPointHistory, ChannelPointHistoryDocument } from "../schemas/channel_point_history.schema";
import {
  UserPermission,
  UserPermissionDocument,
} from "../../../modules/user_permission/schemas/user_permission.schema";
import {
  RedeemPermission,
  RedeemPermissionDocument,
  RedeemPointData,
} from "../../../modules/redeem/schemas/redeem_permission.schema";
import { CheckGiftPointLevelDto } from "../../../modules/gift/dto/check-gift-point-level.dto";
import { GiftService } from "../../../modules/gift/services/gift.service";
import { QueueService } from "../../../modules/queue/queue.service";
import { RedeemMission, RedeemMissionDocument } from "../../../modules/redeem/schemas/redeem_mission.schema";
import { EventHookWorkerService } from "../../../modules/hook/services/hook_do.service";
import { GiftHelper } from "../../../modules/gift/helper/gift.helper";
import { Redeem, RedeemDocument } from "../../../modules/redeem/schemas/redeem.schema";
import * as moment from "moment-timezone";
@Injectable()
export class ChannelPermissionService {
  constructor(
    @InjectModel(ChannelPermission.name)
    private channelPermissionModel: Model<ChannelPermissionDocument>,
    @InjectModel(ChannelLevel.name)
    private channelLevelModel: Model<ChannelLevelDocument>,
    @InjectModel(Channel.name)
    private channelModel: Model<ChannelDocument>,
    @InjectModel(ChannelPointHistory.name)
    private channelPointHistoryModel: Model<ChannelPointHistoryDocument>,
    @InjectModel(RedeemPermission.name)
    private redeemPermissionModel: Model<RedeemPermissionDocument>,
    @InjectModel(RedeemMission.name)
    private redeemMissionModel: Model<RedeemMissionDocument>,
    @InjectModel(Redeem.name)
    private redeemModel: Model<RedeemDocument>,

    @Inject(forwardRef(() => GiftHelper))
    private readonly giftHelper: GiftHelper,
    private readonly giftService: GiftService,
    private readonly queueService: QueueService,
    private readonly eventHookWorkerService: EventHookWorkerService
  ) {}

  private readonly logger = new Logger(ChannelPermissionService.name);

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateChannelPermissionDto): Promise<ChannelPermission> {
    const createdUser = new this.channelPermissionModel(createUser);

    let dataUpdate = {
      member_number: 1,
    };
    if (createUser?.channel_role == "mentor") {
      dataUpdate = { ...dataUpdate, ...{ admin_number: 1 } };
    }
    //Update Count Channel
    await this.channelModel.findByIdAndUpdate(createUser?.channel_id, { $inc: dataUpdate });
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: FilterViewChannelDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.user_ids) {
      condition = Object.assign(condition, { user_id: { $in: filter.user_ids } });
    }
    if (filter.video_ids) {
      condition = Object.assign(condition, { video_id: { $in: filter.video_id } });
    }

    if (filter.unset) {
      condition = Object.assign(condition, { _id: { $nin: filter.unset } });
    }

    if (filter.user_unset) {
      if (filter.user_ids) {
        condition = Object.assign(condition, { user_id: { $in: filter.user_ids, $nin: filter.user_unset } });
      } else {
        condition = Object.assign(condition, { user_id: { $nin: filter.user_unset } });
      }
    }
    if (filter.video_id) {
      condition = Object.assign(condition, { video_id: filter.video_id });
    }

    if (filter.channel_id) {
      condition = Object.assign(condition, { channel_id: filter.channel_id });
    }

    if (filter.channel_level) {
      condition = Object.assign(condition, { channel_level: filter.channel_level });
    }
    if (filter.permission) {
      condition = Object.assign(condition, { permission: filter.permission });
    }

    if (filter.official_status) {
      condition = Object.assign(condition, { official_status: filter.official_status });
    }
    if (filter.from_mentor) {
      condition = Object.assign(condition, { from_mentor: filter.from_mentor });
    }

    if (filter.from_user) {
      condition = Object.assign(condition, { from_user: filter.from_user });
    }

    if (filter.mentor_role) {
      condition = Object.assign(condition, { mentor_role: filter.mentor_role });
    }

    if (filter.is_not_mentor) {
      condition = Object.assign(condition, { mentor_role: { $ne: "mentor" } });
    }

    if (filter.is_not_from_mentor) {
      condition = Object.assign(condition, { from_mentor: { $in: [null] } });
    }

    if (filter.channel_role) {
      condition = Object.assign(condition, { channel_role: filter.channel_role });
    }
    if (filter.point) {
      condition = Object.assign(condition, { point: filter.point });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async removeOne(dataToSearch: any): Promise<ChannelPermission> {
    return await this.channelPermissionModel.findOneAndRemove(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findById(id: string, projection: any): Promise<ChannelPermission> {
    if (!id) {
      return null;
    }
    let dataReturn = await this.channelPermissionModel.findById(id, projection);
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<ChannelPermission[]> {
    return this.channelPermissionModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<ChannelPermission> {
    if (isWithUser) {
      return await this.channelPermissionModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.channelPermissionModel.findOne(dataToSearch).populate("channel_id").exec();
    }
  }

  async findOneWithPopulate(dataToSearch: any, isWithUser: boolean = false): Promise<ChannelPermission> {
    return await this.channelPermissionModel.findOne(dataToSearch).populate("user_id").populate("channel_id").exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.channelPermissionModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateChannelPermissionDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.channelPermissionModel.findOneAndUpdate(
        { _id: dataUpdate?._id },
        { $set: dataUpdate },
        { new: true, setDefaultsOnInsert: true }
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
   * @param dataUpdate
   * @returns
   */
  async updateOne(dataFilter: FilterViewChannelDto, dataUpdate: UpdateChannelPermissionDto) {
    try {
      let dataReturn = await this.channelPermissionModel.findOneAndUpdate(
        dataFilter,
        { $set: dataUpdate },
        { new: true, setDefaultsOnInsert: true }
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
   *
   * @param dataFilter
   * @param dataUpdate
   * @returns
   */
  async updateMany(dataFilter: FilterViewChannelDto, dataUpdate: UpdateChannelPermissionDto) {
    try {
      let dataReturn = await this.channelPermissionModel.updateMany(dataFilter, { $set: dataUpdate }, { new: true });
      return dataReturn;
    } catch (e) {
      return e;
    }
  }
  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  public count = async (filter: FilterViewChannelDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.channelPermissionModel.estimatedDocumentCount();
      } else {
        return this.channelPermissionModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };

  public checkChannelPermission = async (userId: string, channelId: string, permission: string) => {
    try {
      let userPermission = await this.findOne({ user_id: userId, channel_id: channelId });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf(permission) !== -1)
      ) {
        havePermission = true;
      }
      let superAdmin = process.env.SUPER_ADMIN;
      if (superAdmin) {
        let superAdminArray = superAdmin.split(",");
        if (superAdminArray.indexOf(userId) !== -1) {
          return true;
        }
      }

      let dataFilter = {
        user_id: userId,
        permission: permission,
      };
      let permissionObject = await this.findOne(dataFilter);
      if (permissionObject && permissionObject._id) {
        return true;
      }
      return false;
    } catch (error) {}
  };

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: any) {
    let sort = {};
    if (sortBy.createdAt) {
      sort = Object.assign(sort, { _id: sortBy.createdAt === "DESC" ? -1 : 1 });
    }
    if (sortBy.updatedAt) {
      sort = Object.assign(sort, { updatedAt: sortBy.updatedAt === "DESC" ? -1 : 1 });
    }

    if (sortBy.level_number) {
      sort = Object.assign(sort, { level_number: sortBy.level_number === "DESC" ? -1 : 1 });
    }

    if (sortBy.point_month) {
      sort = Object.assign(sort, { point_month: sortBy.point_month === "DESC" ? -1 : 1 });
    }

    if (sortBy.point_week) {
      sort = Object.assign(sort, { point_week: sortBy.point_week === "DESC" ? -1 : 1 });
    }

    if (sortBy.point) {
      sort = Object.assign(sort, { point: sortBy.point === "DESC" ? -1 : 1 });
    }

    return sort;
  }
  /**
   * @author Tony Vu
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filter(filter: FilterViewChannelDto, sortBy: any, page: number, limit: number): Promise<ChannelPermission[]> {
    let condition = await this.getCondition(filter);
    console.log(condition, "condition");
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }

    let populateObject = {
      path: "channel_id",
      populate: [
        {
          path: "avatar",
        },
        {
          path: "attach_files",
        },
        {
          path: "bank_qr_code",
        },
        {
          path: "service_id",
        },
      ],
    };

    let dataReturn = await this.channelPermissionModel
      .find(condition)
      .populate({
        path: "user_id",
        options: { strictPopulate: false },
        select:
          "_id user_email bio description user_login display_name user_phone user_role user_status user_avatar user_avatar_thumbnail last_active user_active",
      })
      .populate("channel_level")
      .populate(populateObject)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filterWithoutChannel(
    filter: FilterViewChannelDto,
    sortBy: any,
    page: number,
    limit: number
  ): Promise<ChannelPermission[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.channelPermissionModel
      .find(condition)
      .populate({
        path: "user_id",
        options: { strictPopulate: false },
        select:
          "_id bio description user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active",
      })
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filterChannel(
    filter: FilterViewChannelDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<ChannelPermission[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataPopulate = {
      path: "video_id",
      options: { strictPopulate: false },
      populate: [
        {
          path: "media_id",
        },
        {
          path: "ref_id",
        },
        {
          path: "bank_qr_code",
        },
        {
          path: "service_id",
        },
      ],
    };
    let dataReturn: any = await this.channelPermissionModel
      .find(condition, projection)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate(dataPopulate)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    if (dataReturn && dataReturn?.length) {
      let dataFinalToReturn = [];
      for (let dataItem of dataReturn) {
        let dataItemToReturn = { ...dataItem?.toObject(), ...dataItem.video_id?.toObject() };
        delete dataItemToReturn.video_id;
        dataFinalToReturn.push(dataItemToReturn);
      }
      return dataFinalToReturn;
    } else {
      return [];
    }
  }

  /**
   *
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filterWithId(filter: FilterViewChannelDto, page: number, limit: number): Promise<ChannelPermission[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any = { _id: -1 };
    let dataReturn = await this.channelPermissionModel
      .find(condition, { user_id: true })
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filterUser(filter: FilterViewChannelDto, sortBy: any, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.channelPermissionModel
      .find(condition)
      .populate({
        path: "user_id",
        options: { strictPopulate: false },
        select:
          "_id bio description user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active",
        populate: { path: "user_option_id" },
      })
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  /**
   *
   * @param createdAt
   * @returns
   */
  async calculateDaysDifference(createdAt: Date) {
    // Lấy ngày hiện tại
    const today = new Date();

    // Sao chép ngày tạo thành một đối tượng ngày
    const createdDate = new Date(createdAt);

    // Trừ ngày hiện tại cho ngày tạo để tính số ngày
    const timeDifference = today.getTime() - createdDate.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    return Number(daysDifference);
  }

  /**
   *
   * @param dataFilter
   * @returns
   */
  async findOneHistory(dataFilter: any) {
    return await this.channelPointHistoryModel.findOne(dataFilter).populate("user_id").exec();
  }

  /**
   * @author Tony Vu
   * @param dataFilter
   * @returns
   */
  async updateCount(
    dataFilter: any,
    dataUpdate: any,
    authCode: string = "",
    dataHistory: any = null,
    typeAction: string = ""
  ) {
    try {
      if (dataHistory) {
        //Check Data Old
        let dataFindOld = {
          channel_id: dataFilter?.channel_id,
          user_id: new Types.ObjectId(dataHistory?.user_id),
          entity_id: new Types.ObjectId(dataHistory?.entity_id),
          entity_type: dataHistory?.entity_type,
        };
        let dataHistoryObject = await this.channelPointHistoryModel.findOne(dataFindOld);
        if (dataHistoryObject) {
          return true;
        } else {
          //Save data History
          await this.channelPointHistoryModel.create(dataFindOld);
        }
      }

      let oldData: ChannelPermission = null;
      let dataToUpdate = { $inc: dataUpdate };
      if (dataUpdate.hasOwnProperty("point")) {
        oldData = await this.channelPermissionModel.findOne(dataFilter);
        dataToUpdate = { ...dataToUpdate, ...{ old_point: parseInt(oldData?.point?.toString()) || 0 } };
      }
      switch (typeAction) {
        case "comment":
          dataUpdate = { ...dataUpdate, ...{ total_comment: 1 } };
          this.eventHookWorkerService.PlusPointChallengePusher({
            user_id: dataHistory?.user_id,
            game_type: "point",
            channel_id: dataFilter?.channel_id,
            point_value: 2,
            type_action: typeAction,
          });
          break;
        case "like_post":
          dataUpdate = { ...dataUpdate, ...{ total_like: 1 } };
          this.eventHookWorkerService.PlusPointChallengePusher({
            user_id: dataHistory?.user_id,
            game_type: "point",
            channel_id: dataFilter?.channel_id,
            point_value: 1,
            type_action: typeAction,
          });
          break;
        case "view_course":
          dataUpdate = { ...dataUpdate, ...{ total_view_course: 1 } };
          this.eventHookWorkerService.PlusPointChallengePusher({
            user_id: dataHistory?.user_id,
            game_type: "view_course",
            channel_id: dataFilter?.channel_id,
            point_value: 1,
          });
          this.eventHookWorkerService.PlusPointChallengePusher({
            user_id: dataHistory?.user_id,
            game_type: "point",
            channel_id: dataFilter?.channel_id,
            point_value: 3,
            type_action: typeAction,
          });
          break;
        case "post_new":
          this.eventHookWorkerService.PlusPointChallengePusher({
            user_id: dataHistory?.user_id,
            game_type: "post_new",
            channel_id: dataFilter?.channel_id,
            point_value: 1,
            type_action: typeAction,
          });
          this.eventHookWorkerService.PlusPointChallengePusher({
            user_id: dataHistory?.user_id,
            game_type: "point",
            channel_id: dataFilter?.channel_id,
            point_value: 5,
            type_action: typeAction,
          });
          break;
        case "share":
          this.eventHookWorkerService.PlusPointChallengePusher({
            user_id: dataHistory?.user_id,
            game_type: "point",
            channel_id: dataFilter?.channel_id,
            point_value: 3,
            type_action: typeAction,
          });
          break;
        case "update_profile":
          break;
        case "like_comment":
          break;
        default:
          break;
      }
      let dataReturn: any = await this.channelPermissionModel.findOneAndUpdate(dataFilter, dataToUpdate, { new: true });
      console.log(dataUpdate?.point, "dataUpdate?.point");
      if (dataUpdate?.point !== undefined && dataUpdate?.point > -1) {
        //Process Cookbook, Redeem
        //-----REDEEM------//
        if (dataReturn?.channel_role === "user") {
          setTimeout(async () => {
            // await this.processRedeem(oldData, authCode, typeAction);
            this.eventHookWorkerService.RedeemWorkerPusher({
              user_id: dataHistory?.user_id,
              typeAction: typeAction,
              oldData: oldData,
              authCode: authCode,
            });
            console.log("dataHistory?.user_id", dataHistory?.user_id);
            console.log(typeAction, "typeAction");
            console.log(authCode, "authCode");
            await this.checkRedeemComplete(dataHistory?.user_id, typeAction, oldData, authCode);
          }, 500);
        }

        //-----COOKBOOK CHALLENGE------//
        //Handle get next level
        let currentLevel = parseInt(dataReturn?.level_number) || 0;
        let oldPoint = dataReturn?.old_point;
        let currentPoint = dataReturn?.point;
        let dataFilterLevel = { level_point: { $gt: oldPoint }, channel_id: oldData?.channel_id };
        let pointNextLevel = 0;
        let dataNextLevel = await this.channelLevelModel
          .find(dataFilterLevel)
          .sort({ level_number: 1 })
          .skip(0)
          .limit(1)
          .exec();

        if (dataNextLevel) {
          pointNextLevel = parseInt(dataNextLevel[0]?.level_point?.toString());
        }
        let isUpLevel = false;
        if (pointNextLevel > oldPoint && pointNextLevel <= currentPoint) {
          isUpLevel = true;
          dataReturn = await this.channelPermissionModel.findOneAndUpdate(
            dataFilter,
            { channel_level: dataNextLevel[0]?._id?.toString(), level_number: dataNextLevel[0]?.level_number },
            { new: true }
          );
        }
        dataReturn = {
          ...dataReturn?.toObject(),
          ...{
            is_up_level: isUpLevel,
            image_url: `https://media.whiteg.app/animations/animations+${dataUpdate?.point}.json`,
          },
        };

        const urlLogin = process.env.SOCKET_API;
        if (authCode) {
          const params = new URLSearchParams(dataReturn);
          const config = {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "X-Authorization": authCode,
            },
          };

          let checkGiftPointLevelDto: CheckGiftPointLevelDto = {
            channel_id: dataReturn?.channel_id,
            user_id: dataReturn?.user_id,
            point: dataReturn?.point,
            level: dataReturn?.level_number,
            total_like: dataReturn?.total_like,
            total_comment: dataReturn?.total_comment,
            total_view_course: dataReturn?.total_view_course,
          };
          await this.queueService.addGiftToQueueForAccount(checkGiftPointLevelDto);
          let dataNotification = await axios
            .post(urlLogin + "/update-point", params, config)
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
      return dataReturn;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  /**
   *
   * @param date1
   * @param date2
   * @returns
   */
  async isSameDay(date1: Date, date2: Date) {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  /**
   *
   */
  async checkRedeemComplete(user_id: string, typeAction: string, oldData: ChannelPermission, authCode: any) {
    try {
      // const today = new Date();
      // console.log(today.toLocaleDateString("en-US"), 'today.toLocaleDateString("en-US")');

      // const nowUTC7 = moment().tz('Asia/Ho_Chi_Minh');
      console.log(new Date(), "new Date()");
      let redeemPermissions = await this.redeemPermissionModel.find({
        user_id: new Types.ObjectId(user_id),
        start_time: { $lte: new Date() }, // Kiểm tra nếu start_date <= thời gian hiện tại
        end_time: { $gte: new Date() },
        "point_data.action_name": typeAction,
        status: "process",
      });
      console.log(redeemPermissions?.length);
      for (let redeemPermission of redeemPermissions) {
        // plus point process and check redeemPermission complete
        let checkPermission = true;
        let isSendSocket = false;

        console.log(redeemPermission?.point_data, "redeemPermission?.point_data");
        redeemPermission?.point_data.map(async (x) => {
          try {
            if (
              x?.action_name === typeAction &&
              Number(x?.point_number) < Number(x?.action_point) &&
              x?.status !== "done"
            ) {
              x.point_number = String(Number(x?.point_number) + 1);
              if (Number(x.point_number) === Number(x.action_point)) {
                x.status = "done";
              } else {
                checkPermission = false;
              }
              console.log(redeemPermission, "redeemPermission");
              await this.redeemPermissionModel.findOneAndUpdate(
                {
                  _id: redeemPermission?._id,
                },
                redeemPermission
              );

              isSendSocket = true;
            } else if (x?.action_name !== typeAction && Number(x?.point_number) < Number(x?.action_point)) {
              checkPermission = false;
            }
          } catch (error) {
            console.log(error);
          }
        });
        setTimeout(async () => {
          try {
            console.log(checkPermission, "checkPermission");
            console.log(isSendSocket, "isSendSocket");
            if (isSendSocket) {
              /// get data send-socket
              const dataToSendSocket = await this.redeemPermissionModel
                .findOne({
                  _id: redeemPermission?._id,
                })
                .populate({
                  path: "redeem_mission_id",
                  options: { strictPopulate: false },
                  populate: [
                    {
                      path: "gift_data",
                      populate: [
                        {
                          path: "media_id",
                        },
                      ],
                    },
                  ],
                })
                .populate({
                  path: "redeem_id",
                  options: { strictPopulate: false },
                  populate: [
                    {
                      path: "gift_data",
                      populate: [
                        {
                          path: "media_id",
                        },
                      ],
                    },
                  ],
                });
              console.log(dataToSendSocket, "dataToSendSocket");

              setTimeout(async () => {
                console.log("START SEND SOCKET ------>");
                await this.sendSocket(dataToSendSocket?.toObject(), authCode);
              }, 300);
              //send socket
            }
            if (checkPermission === true) {
              //update redeemPermission
              redeemPermission.status = "done";
              ///update data
              await this.redeemPermissionModel.findOneAndUpdate(
                {
                  _id: redeemPermission?._id,
                },
                redeemPermission
              );

              const redeemMission = await this.redeemMissionModel.findById({
                _id: redeemPermission?.redeem_mission_id?._id
                  ? redeemPermission?.redeem_mission_id?._id
                  : redeemPermission?.redeem_mission_id,
              });
              // plus coin for channel Permission
              if (Number(redeemMission.gift_coin) > 0) {
                await this.channelPermissionModel.findByIdAndUpdate(oldData?._id, {
                  $inc: {
                    coin_number: redeemMission.gift_coin,
                  },
                });
              }

              //send gift for user
              if (redeemMission?.gift_data?.length > 0) {
                for (let gift of redeemMission?.gift_data) {
                  if (gift._id) {
                    await this.giftHelper.handleAutoGiveGift({
                      gift_id: gift,
                      partner_id: user_id,
                      quantity: Number(gift.stock_qty),
                    });
                  } else {
                    const giftData = await this.giftService.findOne({
                      _id: gift,
                    });
                    await this.giftHelper.handleAutoGiveGift({
                      gift_id: giftData,
                      partner_id: user_id,
                      quantity: Number(giftData.stock_qty),
                    });
                  }
                }
              }

              // check redeem complete and
              let checkRedeemComplete = true;
              const listRedeemPermissionByRedeem = await this.redeemPermissionModel.find({
                user_id: user_id,
                redeem_id: redeemPermission.redeem_id,
              });
              for (let redeemPermissionByRedeem of listRedeemPermissionByRedeem) {
                if (
                  redeemPermissionByRedeem?._id !== redeemPermission._id &&
                  redeemPermissionByRedeem?.status !== "done"
                ) {
                  checkRedeemComplete = false;
                }
              }
              if (checkRedeemComplete === true) {
                const redeem = await this.redeemModel.findById(redeemPermission.redeem_id);
                //check and send gift
                if (redeem.gift_data && redeem.gift_data.length > 0) {
                  for (let gift of redeem?.gift_data) {
                    if (gift._id) {
                      await this.giftHelper.handleAutoGiveGift({
                        gift_id: gift,
                        partner_id: user_id,
                        quantity: Number(gift?.stock_qty),
                      });
                    } else {
                      const giftData = await this.giftService.findOne({
                        _id: gift,
                      });
                      await this.giftHelper.handleAutoGiveGift({
                        gift_id: giftData,
                        partner_id: user_id,
                        quantity: Number(giftData?.stock_qty),
                      });
                    }
                  }
                }
                //plus coin for channel Permission
                if (Number(redeem.gift_coin) > 0) {
                  console.log(oldData?._id, "oldData?._id");

                  console.log(JSON.stringify(await this.channelPermissionModel.findById({ _id: oldData?._id })));

                  await this.channelPermissionModel.findByIdAndUpdate(oldData?._id, {
                    $inc: {
                      coin_number: Number(redeem.gift_coin),
                    },
                  });
                }
              }
            }
          } catch (error) {
            console.log(error);
          }
        }, 500);
      }
    } catch (error) {
      this.logger.log("Check redeem complete Fails: ", error.message);
    }
  }

  /**
   *
   * @param oldData
   * @param authCode
   * @param typeAction
   */
  async processRedeem(oldData: ChannelPermission, authCode: string, typeAction: string) {
    try {
      //Update
      let dataRedeemFilter = {
        user_id: oldData?.user_id?.toString(),
        channel_id: oldData?.channel_id?.toString(),
      };
      let pageRedeem = 1;
      let limitRedeem = 100;
      let dataPopulate = {
        path: "redeem_mission_id",
        options: { strictPopulate: false },
      };
      let redeemMissionArray: RedeemPermission[] = await this.redeemPermissionModel
        .find(dataRedeemFilter, {})
        .sort({ _id: -1 })
        .skip(limitRedeem * (pageRedeem - 1))
        .limit(limitRedeem)
        .populate(dataPopulate)
        .exec();
      if (redeemMissionArray && redeemMissionArray?.length) {
        for (let itemMission of redeemMissionArray) {
          let numberOfDay = itemMission?.redeem_mission_id?.number_of_day;
          let createdAt = new Date(itemMission?.redeem_mission_id?.createdAt);
          let dayOfMission = new Date(createdAt);
          dayOfMission.setDate(dayOfMission.getDate() + Number(numberOfDay) - 1);

          if (await this.isSameDay(dayOfMission, new Date())) {
            //Update data
            let dataUpdatePoint = [];
            //Check in missionAction
            let isAddToAction = false;
            let listOfAcionName = itemMission?.redeem_mission_id?.mission_action?.map((value: any, index: number) => {
              return value?.action_name;
            });
            // console.log(listOfAcionName, 'listOfAcionName')

            let isSendSocket = false;

            for (let dataPoinIndex in itemMission?.point_data) {
              if (itemMission?.point_data[dataPoinIndex]?.action_name === typeAction) {
                if (listOfAcionName?.indexOf(typeAction) !== -1) {
                  let dataAction = itemMission?.redeem_mission_id?.mission_action?.filter(
                    (value: any, index: number) => {
                      return value?.action_name == typeAction;
                    }
                  );
                  let dataMissionActionPoint = Number(dataAction[0]?.action_point);
                  //If poin < poin not count
                  if (Number(itemMission?.point_data[dataPoinIndex]?.point_number) < dataMissionActionPoint) {
                    dataUpdatePoint.push({
                      action_name: typeAction,
                      point_number: Number(itemMission?.point_data[dataPoinIndex]?.point_number) + 1,
                    });
                    isAddToAction = true;
                    isSendSocket = true;
                  } else {
                    dataUpdatePoint.push(itemMission?.point_data[dataPoinIndex]);
                  }
                } else {
                  dataUpdatePoint.push(itemMission?.point_data[dataPoinIndex]);
                }
              } else {
                dataUpdatePoint.push(itemMission?.point_data[dataPoinIndex]);
              }
            }
            if (!isAddToAction && listOfAcionName?.indexOf(typeAction) !== -1) {
              dataUpdatePoint.push({
                action_name: typeAction,
                point_number: 1,
              });
              isSendSocket = true;
            }
            if (isSendSocket) {
              let dataPopulateRedeem = {
                path: "redeem_mission_id",
                options: { strictPopulate: false },
                populate: [
                  {
                    path: "gift_data",
                    populate: [
                      {
                        path: "media_id",
                      },
                    ],
                  },
                ],
              };

              let dataPopulate = {
                path: "redeem_id",
                options: { strictPopulate: false },
                populate: [
                  {
                    path: "gift_data",
                    populate: [
                      {
                        path: "media_id",
                      },
                    ],
                  },
                ],
              };
              //Update to permission
              let dataToSendSocket = await this.redeemPermissionModel
                .findOneAndUpdate({ _id: itemMission?._id?.toString() }, { point_data: dataUpdatePoint }, { new: true })
                .populate(dataPopulateRedeem)
                .populate(dataPopulate);
              //Send Socket

              //Check Total & Add
              const urlLogin = process.env.SOCKET_API;
              if (authCode && dataToSendSocket) {
                let dataToObject = {
                  redeem: JSON.stringify(dataToSendSocket?.toObject()),
                };
                const paramsRedeem = new URLSearchParams(dataToObject);
                const config = {
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-Authorization": authCode,
                  },
                };
                let dataNotification = await axios
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
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async sendSocket(dataToSendSocket: any, authCode: any) {
    //Send Socket
    const urlLogin = process.env.SOCKET_API;
    if (authCode && dataToSendSocket) {
      let dataToObject = {
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
      let dataNotification = await axios
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
