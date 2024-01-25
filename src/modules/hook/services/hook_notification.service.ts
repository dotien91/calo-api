import { Injectable } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { NotificationHelper } from "../../../modules/notification/helper/notification.helper";
import HookExpress from "../hook_epress";
const cron = require("node-cron");
let alreadyWork = false;

@Injectable()
export class EventHookNotificationService {
  constructor(private readonly schedulerRegistry: SchedulerRegistry, private notificationHelper: NotificationHelper) {
    if (alreadyWork !== true) {
      this.initHook();
      alreadyWork = true;
    }
  }

  /**
   * currently stop working ...
   */
  initHook() {
    console.log("Make sure you work once %s", Math.random());
    HookExpress.add_action("noti.challenge.required-join-challenge", async (data: any) => {
      try {
        // await this.notificationHelper.sendNotificationAndEmail(data);
      } catch (error) {
        console.log("Send required-join-challenge notification and email to user Fails :", error.message);
      }
    });

    HookExpress.add_action("noti.challenge.apply-join-challenge", async (data: any) => {
      try {
        await this.notificationHelper.sendNotification(data);
      } catch (error) {
        console.log("Send apply-join-challenge notification to user Fails :", error.message);
      }
    });

    HookExpress.add_action("noti.challenge.up-activity-challenge", async (data: any) => {
      try {
        // await this.notificationHelper.sendNotificationAndEmail(data);
      } catch (error) {
        console.log("Send up-activity-challenge notification and email to user Fails :", error.message);
      }
    });

    HookExpress.add_action("noti.challenge.apply-activity-challenge", async (data: any) => {
      try {
        await this.notificationHelper.sendNotification(data);
      } catch (error) {
        console.log("Send apply-activity-challenge notification to user Fails :", error.message);
      }
    });

    HookExpress.add_action("noti.challenge.top-user-challenge", async (data: any) => {
      try {
        // await this.notificationHelper.sendNotificationAndEmail(data);
      } catch (error) {
        console.log("Send top-user-challenge notification and email to user Fails :", error.message);
      }
    });

    HookExpress.add_action("noti.gift.apply-receive-gift", async (data: any) => {
      try {
        await this.notificationHelper.sendNotification(data);
      } catch (error) {
        console.log("Send apply-receive-gift notification to user Fails :", error.message);
      }
    });

    HookExpress.add_action("noti.channel.required-join-channel", async (data: any) => {
      try {
        // await this.notificationHelper.sendNotificationAndEmail(data);
      } catch (error) {
        console.log("Send required-join-channel notification to user Fails :", error.message);
      }
    });

    HookExpress.add_action("noti.channel.apply-join-channel", async (data: any) => {
      try {
        await this.notificationHelper.sendNotification(data);
      } catch (error) {
        console.log("Send apply-join-channel notification to user Fails :", error.message);
      }
    });

    HookExpress.add_action("noti.event.before-start-event", async (data: any) => {
      try {
        let minute, hour, day, month, year: number;
        if (data.start_date.getMinutes() > 15) {
          minute = data.start_date.getMinutes() - 15;
          hour = data.start_date.getHours();
          day = data.start_date.getDate();
          month = data.start_date.getMonth() + 1; // Months are 0-based in JavaScript
          year = data.start_date.getFullYear();
        } else {
          minute = 60 + data.start_date.getMinutes() - 15;
          hour = data.start_date.getHours() - 1;
          day = data.start_date.getDate();
          month = data.start_date.getMonth() + 1; // Months are 0-based in JavaScript
          year = data.start_date.getFullYear();
        }
        cron.schedule(`* ${minute} ${hour} ${day} ${month} * ${year}`, async () => {
          for (const user_id of data?.list_user_id) {
            // await this.notificationHelper.sendNotificationAndEmail({
            //   user_id: user_id,
            //   channel_id: data?.channel_id,
            //   path: data?.path,
            //   mail_template: data?.mail_template,
            //   content: data?.content,
            //   title: data?.title,
            //   event_name: data?.event_name,
            // });
          }
        });
      } catch (error) {
        console.log("Send before-start-event notification to user Fails :", error.message);
      }
    });

    HookExpress.add_action("noti.event.create-new-event", async (data: any) => {
      try {
        // await this.notificationHelper.sendNotificationAndEmail(data);
      } catch (error) {
        console.log("Send create-new-event notification to user Fails :", error.message);
      }
    });

    HookExpress.add_action("noti.course.create-new-course", async (data: any) => {
      try {
        await this.notificationHelper.sendNotification(data);
      } catch (error) {
        console.log("Send create-new-course notification to user Fails :", error.message);
      }
    });

    HookExpress.add_action("noti.course.apply-join-course", async (data: any) => {
      try {
        // await this.notificationHelper.sendNotificationAndEmail(data);
      } catch (error) {
        console.log("Send apply-join-course notification to user Fails :", error.message);
      }
    });

    HookExpress.add_action("noti.order.success-order", async (data: any) => {
      try {
        await this.notificationHelper.sendNotificationAndEmail(data);
      } catch (error) {
        console.log("Send success-order notification to user Fails :", error.message);
      }
    });

    HookExpress.add_action("noti.order.success-pay-order", async (data: any) => {
      try {
        await this.notificationHelper.sendNotificationAndEmail(data);
      } catch (error) {
        console.log("Send success-pay-order notification to user Fails :", error.message);
      }
    });

    HookExpress.add_action("noti.order.success-order-extension", async (data: any) => {
      try {
        // await this.notificationHelper.sendNotificationAndEmail(data);
      } catch (error) {
        console.log("Send success-order-extension notification to user Fails :", error.message);
      }
    });

    HookExpress.add_action("noti.mentor.commission-receive-mentor", async (data: any) => {
      try {
        await this.notificationHelper.sendNotification(data);
      } catch (error) {
        console.log("Send commission-receive-mentor notification to user Fails :", error.message);
      }
    });

    HookExpress.add_action("noti.mentor.success-buy-goods", async (data: any) => {
      try {
        await this.notificationHelper.sendNotification(data);
      } catch (error) {
        console.log("Send success-buy-goods notification to user Fails :", error.message);
      }
    });

    HookExpress.add_action("noti.mentor.withdraw-money-user", async (data: any) => {
      try {
        await this.notificationHelper.sendNotification(data);
      } catch (error) {
        console.log("Send withdraw-money-user notification to user Fails :", error.message);
      }
    });

    HookExpress.add_action("noti.ticket.create-new-ticket", async (data: any) => {
      try {
        // await this.notificationHelper.sendNotificationAndEmail(data);
      } catch (error) {
        console.log("Send create-new-ticket notification to user Fails :", error.message);
      }
    });

    HookExpress.add_action("noti.ticket.comment-ticket", async (data: any) => {
      try {
        // await this.notificationHelper.sendNotificationAndEmail(data);
      } catch (error) {
        console.log("Send comment-ticket notification to user Fails :", error.message);
      }
    });
  }

  sendNotiNMailRequiredJoinChallenge(data: any) {
    HookExpress.do_action("noti.challenge.required-join-challenge", data);
  }

  sendNotiApllyJoinChallenge(data: any) {
    HookExpress.do_action("noti.challenge.apply-join-challenge", data);
  }

  sendNotiNMailUpActivityChallenge(data: any) {
    HookExpress.do_action("noti.challenge.up-activity-challenge", data);
  }

  sendNotiApplyActivityChallenge(data: any) {
    HookExpress.do_action("noti.challenge.apply-activity-challenge", data);
  }

  sendNotiNMailTopUserOfChallenge(data: any) {
    HookExpress.do_action("noti.challenge.top-user-challenge", data);
  }

  sendNotiApplyReceiveGift(data: any) {
    HookExpress.do_action("noti.gift.apply-receive-gift", data);
  }

  sendNotiNMailRequireJoinChannel(data: any) {
    HookExpress.do_action("noti.channel.required-join-channel", data);
  }

  sendNotiNMailApllyJoinChannel(data: any) {
    HookExpress.do_action("noti.channel.apply-join-channel", data);
  }

  sendNotiNMailBeforeStartEvent(data: any) {
    HookExpress.do_action("noti.event.before-start-event", data);
  }

  sendNotiNMailNewEvent(data: any) {
    HookExpress.do_action("noti.event.create-new-event", data);
  }

  sendNotiNewCourse(data: any) {
    HookExpress.do_action("noti.course.create-new-course", data);
  }

  sendNotiNMailJoinCourse(data: any) {
    HookExpress.do_action("noti.course.apply-join-course", data);
  }

  sendNotiNMailOrderSuccess(data: any) {
    HookExpress.do_action("noti.order.success-order", data);
  }

  sendNotiNMailPaySuccess(data: any) {
    HookExpress.do_action("noti.order.success-pay-order", data);
  }

  sendNotiNMailBuyExtensionSuccess(data: any) {
    HookExpress.do_action("noti.order.success-order-extension", data);
  }

  sendNotiMentorReceiveCommission(data: any) {
    HookExpress.do_action("noti.mentor.commission-receive-mentor", data);
  }

  sendNotiUserBuyGoodsForBoss(data: any) {
    HookExpress.do_action("noti.mentor.success-buy-goods", data);
  }

  sendNotiUserWithdrawMoneyForBoss(data: any) {
    HookExpress.do_action("noti.mentor.withdraw-money-user", data);
  }

  sendNotiNMailCreateNewTicket(data: any) {
    HookExpress.do_action("noti.ticket.create-new-ticket", data);
  }

  sendNotiNMailCommentTicket(data: any) {
    HookExpress.do_action("noti.ticket.comment-ticket", data);
  }
}
