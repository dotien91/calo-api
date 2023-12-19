import { OnQueueActive, Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { NotificationHelper } from "../notification/helper/notification.helper";

@Processor("gift")
export class GiftConsumer {
  constructor(private readonly notiHelper: NotificationHelper) {}
  private readonly logger = new Logger("task-gift-consumer");

  @OnQueueActive()
  onActive(job: Job) {
    console.log(`Processing job ${job.id} of type ${job.name} with data ${job.data}...`);
  }

  // @Process("gift-job")
  // async handleSendGiveGift(job: Job) {
  //   this.logger.log("worker redis gift-job in send gift queue");
  //   await this.giftHelper.handleAutoGiveGift(job.data);
  // }

  // @Process("check-gift-job")
  // async handleCheckGiftByPointNLevel(job: Job) {
  //   this.logger.log("worker redis check-gift-job in send gift queue");
  //   await this.giftHelper.handleAutoGiveGift(job.data);
  // }
}

@Processor("noti")
export class NotiConsumer {
  constructor(private readonly notiHelper: NotificationHelper) {}

  private readonly logger = new Logger("task-noti-consumer");

  @OnQueueActive()
  onActive(job: Job) {
    console.log(`Processing job ${job?.id} of type ${job?.name} with data ${job?.data}...`);
  }

  @Process("noti-job")
  async handlePushNoti(job: Job) {
    this.logger.log("worker redis noti-job in push noti queue");
    // await this.notiHelper.sendNotificationAndEmailReceiveGift(
    //   job?.data?.dataChannel,
    //   job?.data?.dataUser,
    //   job?.data?.dataGift
    // );
  }
}

@Processor("challenge")
export class ChallengeConsumer {
  constructor(
  ) {}
  private readonly logger = new Logger("task-challenge-consumer");

  @OnQueueActive()
  onActive(job: Job) {
    console.log(`Processing job ${job?.id} of type ${job?.name} with data ${job?.data}...`);
  }

  // @Process("challenge-add-user-job")
  // async handleAddUserIntoChallenge(job: Job) {
  //   try {
  //     this.logger.log("worker redis challenge-add-user-job in push noti queue");
  //     const listChallengePermission: any = [];
  //     if (job?.data?.list_user_id && job?.data?.list_user_id.length > 0) {
  //       for (const x of job?.data?.list_user_id) {
  //         if (x && job?.data?.challenge_id && job?.data?.channel_id) {
  //           listChallengePermission.push({
  //             user_id: x,
  //             challenge_id: job?.data?.challenge_id,
  //             channel_id: job?.data?.channel_id,
  //             game_id: job?.data?.game_id,
  //             game_type: job?.data?.game_type,
  //             official_status: job?.data?.official_status,
  //           });
  //         }
  //       }
  //       await this.challengePermissionModel.insertMany(listChallengePermission);
  //       await this.challengeService.updateCount(
  //         {
  //           _id: new Types.ObjectId(job?.data?.challenge_id),
  //         },
  //         {
  //           join_number: job?.data?.list_user_id.length,
  //         }
  //       );
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // @Process("user-join-challenge-job")
  // async handleUserJoinChallengeJob(job: Job) {
  //   this.logger.log("worker redis user-join-challenge-job in push noti queue");

  //   if (job?.data?.list_challenge_id && job?.data?.list_challenge_id.length > 0) {
  //     const listChallengePermission = [];
  //     const listChallengeActivities = [];
  //     for (const x of job?.data?.list_challenge_id) {
  //       if (job?.data?.user_id && x?.challenge_id && job?.data?.channel_id) {
  //         await this.challengeService.updateCount(
  //           {
  //             _id: new Types.ObjectId(x?.challenge_id),
  //           },
  //           {
  //             join_number: 1,
  //           }
  //         );
  //         const dataToPush = {
  //           user_id: job?.data?.user_id,
  //           challenge_id: x?.challenge_id,
  //           channel_id: job?.data?.channel_id,
  //           game_id: x?.game_id,
  //           game_type: x?.game_type,
  //           official_status: job?.data?.official_status,
  //         };
  //         const dataChallengeActivities = {
  //           title: `${job?.data?.display_name} Tham gia ${x.title}`,
  //           challenge_id: x?.challenge_id.toString(),
  //           channel_id: job?.data?.channel_id,
  //           user_id: job?.data?.user_id,
  //           point_value: 0,
  //           media_id: null,
  //           start_time: new Date().toISOString(),
  //           official_status: 1,
  //         };
  //         listChallengeActivities.push(dataChallengeActivities);
  //         listChallengePermission.push(dataToPush);
  //       }
  //     }
  //     await this.challengeActivity.insertMany(listChallengeActivities);
  //     await this.challengePermissionModel.insertMany(listChallengePermission);
  //   }
  // }
}
