import { Injectable } from "@nestjs/common";
import axios from "axios";
import { UserService } from "../../../modules/user/services/user.service";
let alreadyWork = false;
@Injectable()
export class EventHookAdderService {
  constructor(private readonly userService: UserService) {
    if (alreadyWork !== true) {
      this.initHook();
      alreadyWork = true;
    }
  }

  initHook() {
    console.log("Make sure you work once %s", Math.random());
    // HookExpress.add_action("challenge.plus-point", async (data) => {
    //   try {
    //     if (data.game_type === "point") {
    //       const challengess = await this.challengePermissionService.filterWithPopulate(
    //         {
    //           user_id: data?.user_id,
    //           game_type: data?.game_type,
    //           channel_id: data?.channel_id,
    //         },
    //         {},
    //         1,
    //         1000
    //       );
    //       for (const challenge of challengess) {
    //         const currentTime = new Date();
    //         if (
    //           new Date(challenge?.challenge_id?.start_time?.toString()) > currentTime ||
    //           new Date(challenge?.challenge_id?.end_time?.toString()) < currentTime
    //         ) {
    //           continue;
    //         }
    //         const channel = await this.channelService.findById(data?.channel_id);
    //         const foundGameSetting = channel.point_data.find((obj) => obj.key === data?.type_action);
    //         if (foundGameSetting) {
    //           data.point_value = Number(foundGameSetting.value);
    //         }
    //         await this.challengePermission.findOneAndUpdate(
    //           {
    //             _id: challenge?._id,
    //           },
    //           {
    //             $inc: {
    //               total_point: data.point_value,
    //             },
    //           }
    //         );
    //         let userData: any = {};
    //         if (!data.display_name) {
    //           userData = await this.userService.findUserById(data?.user_id, { display_name: true });
    //         }
    //         const display_name = !data.display_name ? userData?.display_name : data?.display_name;
    //         const challengeActivity: CreateChallengeActivityDto = {
    //           title: `${display_name} nhận được ${data.point_value} điểm!`,
    //           challenge_id: challenge?.challenge_id?._id?.toString(),
    //           channel_id: data?.channel_id,
    //           user_id: data?.user_id,
    //           point_value: data.point_value,
    //           media_id: null,
    //           start_time: new Date().toISOString(),
    //           official_status: 1,
    //         };
    //         await this.challengeActivityService.create(challengeActivity);
    //       }
    //     } else {
    //       const challengess = await this.challengePermissionService.filterWithPopulate(
    //         {
    //           user_id: data?.user_id,
    //           game_type: data?.game_type,
    //           channel_id: data?.channel_id,
    //         },
    //         {},
    //         1,
    //         1000
    //       );
    //       for (const challenge of challengess) {
    //         const currentTime = new Date();
    //         if (
    //           new Date(challenge?.challenge_id?.start_time?.toString()) > currentTime ||
    //           new Date(challenge?.challenge_id?.end_time?.toString()) < currentTime
    //         ) {
    //           continue;
    //         }

    //         await this.challengePermission.findOneAndUpdate(
    //           {
    //             _id: challenge?._id,
    //           },
    //           {
    //             $inc: {
    //               total_point: data?.point_value,
    //             },
    //           }
    //         );
    //         let userData: any = {};
    //         if (!data.display_name) {
    //           userData = await this.userService.findUserById(data?.user_id, { display_name: true });
    //         }
    //         const display_name = !data.display_name ? userData?.display_name : data?.display_name;
    //         const challengeActivity: CreateChallengeActivityDto = {
    //           title: `${display_name} nhận được ${data.point_value} điểm!`,
    //           challenge_id: challenge?.challenge_id?._id?.toString(),
    //           channel_id: data?.channel_id,
    //           user_id: data?.user_id,
    //           point_value: data?.point_value,
    //           media_id: null,
    //           start_time: new Date().toISOString(),
    //           official_status: 1,
    //         };
    //         await this.challengeActivityService.create(challengeActivity);
    //       }
    //     }
    //   } catch (error) {
    //     console.log("Plus Point For Customer Fails :", error.message);
    //   }
    // });

    // HookExpress.add_action("redeem.check-permission", async (data) => {
    //   try {
    //     const user_id = data?.user_id;
    //     const typeAction = data?.typeAction;
    //     const authCode = data?.authCode;
    //     const oldData = data?.oldData;

    //     const today = new Date();
    //     const redeemPermissions = await this.redeemPermissionModel.find({
    //       user_id: new Types.ObjectId(user_id),
    //       start_date: today.toLocaleDateString("en-US"),
    //       "point_data.action_name": typeAction,
    //       status: "process",
    //     });
    //     console.log(redeemPermissions?.length);
    //     for (const redeemPermission of redeemPermissions) {
    //       // plus point process and check redeemPermission complete
    //       let checkPermission = true;
    //       let isSendSocket = false;

    //       console.log(redeemPermission?.point_data, "redeemPermission?.point_data");
    //       redeemPermission?.point_data.map(async (x) => {
    //         try {
    //           if (
    //             x?.action_name === typeAction &&
    //             Number(x?.point_number) < Number(x?.action_point) &&
    //             x?.status !== "done"
    //           ) {
    //             x.point_number = String(Number(x?.point_number) + 1);
    //             if (Number(x.point_number) === Number(x.action_point)) {
    //               x.status = "done";
    //             } else {
    //               checkPermission = false;
    //             }
    //             console.log(redeemPermission, "redeemPermission");
    //             await this.redeemPermissionModel.findOneAndUpdate(
    //               {
    //                 _id: redeemPermission?._id,
    //               },
    //               redeemPermission
    //             );

    //             isSendSocket = true;
    //           } else if (x?.action_name !== typeAction && Number(x?.point_number) < Number(x?.action_point)) {
    //             checkPermission = false;
    //           }
    //         } catch (error) {
    //           console.log(error);
    //         }
    //       });
    //       setTimeout(async () => {
    //         try {
    //           console.log(checkPermission, "checkPermission");
    //           console.log(isSendSocket, "isSendSocket");
    //           if (isSendSocket) {
    //             /// get data send-socket
    //             const dataToSendSocket = await this.redeemPermissionModel
    //               .findOne({
    //                 _id: redeemPermission?._id,
    //               })
    //               .populate({
    //                 path: "redeem_mission_id",
    //                 options: { strictPopulate: false },
    //                 populate: [
    //                   {
    //                     path: "gift_data",
    //                     populate: [
    //                       {
    //                         path: "media_id",
    //                       },
    //                     ],
    //                   },
    //                 ],
    //               })
    //               .populate({
    //                 path: "redeem_id",
    //                 options: { strictPopulate: false },
    //                 populate: [
    //                   {
    //                     path: "gift_data",
    //                     populate: [
    //                       {
    //                         path: "media_id",
    //                       },
    //                     ],
    //                   },
    //                 ],
    //               });
    //             console.log(dataToSendSocket, "dataToSendSocket");

    //             setTimeout(async () => {
    //               console.log("START SEND SOCKET ------>");
    //               await this.sendSocket(dataToSendSocket?.toObject(), authCode);
    //             }, 300);
    //             //send socket
    //           }
    //           if (checkPermission === true) {
    //             //update redeemPermission
    //             redeemPermission.status = "done";
    //             ///update data
    //             await this.redeemPermissionModel.findOneAndUpdate(
    //               {
    //                 _id: redeemPermission?._id,
    //               },
    //               redeemPermission
    //             );

    //             const redeemMission = await this.redeemMissionModel.findById({
    //               _id: redeemPermission?.redeem_mission_id?._id
    //                 ? redeemPermission?.redeem_mission_id?._id
    //                 : redeemPermission?.redeem_mission_id,
    //             });
    //             // plus coin for channel Permission
    //             if (Number(redeemMission.gift_coin) > 0) {
    //               await this.channelPermissionModel.findByIdAndUpdate(oldData?._id, {
    //                 $inc: {
    //                   coin_number: redeemMission.gift_coin,
    //                 },
    //               });
    //             }

    //             //send gift for user
    //             if (redeemMission?.gift_data?.length > 0) {
    //               for (const gift of redeemMission?.gift_data) {
    //                 if (gift._id) {
    //                   await this.giftHelper.handleAutoGiveGift({
    //                     gift_id: gift,
    //                     partner_id: user_id,
    //                     quantity: Number(gift.stock_qty),
    //                   });
    //                 } else {
    //                   const giftData = await this.giftService.findOne({
    //                     _id: gift,
    //                   });
    //                   await this.giftHelper.handleAutoGiveGift({
    //                     gift_id: giftData,
    //                     partner_id: user_id,
    //                     quantity: Number(giftData.stock_qty),
    //                   });
    //                 }
    //               }
    //             }

    //             // check redeem complete and
    //             let checkRedeemComplete = true;
    //             const listRedeemPermissionByRedeem = await this.redeemPermissionModel.find({
    //               user_id: user_id,
    //               redeem_id: redeemPermission.redeem_id,
    //             });
    //             for (const redeemPermissionByRedeem of listRedeemPermissionByRedeem) {
    //               if (
    //                 redeemPermissionByRedeem?._id !== redeemPermission._id &&
    //                 redeemPermissionByRedeem?.status !== "done"
    //               ) {
    //                 checkRedeemComplete = false;
    //               }
    //             }
    //             if (checkRedeemComplete === true) {
    //               const redeem = await this.redeemModel.findById(redeemPermission.redeem_id);
    //               //check and send gift
    //               if (redeem.gift_data && redeem.gift_data.length > 0) {
    //                 for (const gift of redeem?.gift_data) {
    //                   if (gift._id) {
    //                     await this.giftHelper.handleAutoGiveGift({
    //                       gift_id: gift,
    //                       partner_id: user_id,
    //                       quantity: Number(gift?.stock_qty),
    //                     });
    //                   } else {
    //                     const giftData = await this.giftService.findOne({
    //                       _id: gift,
    //                     });
    //                     await this.giftHelper.handleAutoGiveGift({
    //                       gift_id: giftData,
    //                       partner_id: user_id,
    //                       quantity: Number(giftData?.stock_qty),
    //                     });
    //                   }
    //                 }
    //               }
    //               //plus coin for channel Permission
    //               if (Number(redeem.gift_coin) > 0) {
    //                 console.log(oldData?._id, "oldData?._id");

    //                 console.log(JSON.stringify(await this.channelPermissionModel.findById({ _id: oldData?._id })));

    //                 await this.channelPermissionModel.findByIdAndUpdate(oldData?._id, {
    //                   $inc: {
    //                     coin_number: Number(redeem.gift_coin),
    //                   },
    //                 });
    //               }
    //             }
    //           }
    //         } catch (error) {
    //           console.log(error);
    //         }
    //       }, 500);
    //     }
    //   } catch (error) {
    //     console.log("Check redeem complete Fails: ", error.message);
    //   }
    // });
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
