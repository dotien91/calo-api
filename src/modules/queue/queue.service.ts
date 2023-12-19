import { InjectQueue } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { Queue } from "bull";
import { CheckGiftPointLevelDto } from "../gift/dto/check-gift-point-level.dto";
import { GiftService } from "../gift/services/gift.service";
import { NotiGiveGiftDto } from "../gift/dto/noti-give-gift.dto";
import { UserGiftService } from "../gift/services/user_gift.service";

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue("gift") private giftQueue: Queue,
    @InjectQueue("noti") private notiQueue: Queue,
    @InjectQueue("challenge") private challengeQueue: Queue,
    private readonly giftService: GiftService,
    private readonly userGiftService: UserGiftService
  ) {}

  private readonly logger = new Logger(QueueService.name);

  async addTaskChallengeAddAllUser(data: any) {
    this.logger.log("add job create challenge permission");
    await this.challengeQueue.add("challenge-add-user-job", data);
  }

  async addTaskUserJoinChallenge(data: any) {
    this.logger.log("add job create challenge permission");
    await this.challengeQueue.add("user-join-challenge-job", data);
  }

  async addTaskGift(data: any) {
    this.logger.log("add job send gift");
    await this.giftQueue.add("gift-job", data);
  }

  async addTaskCheckGiftAccout(data: any) {
    this.logger.log("add job check and send gift by point and level");
    await this.giftQueue.add("check-gift-job", data);
  }

  async addTaskNoti(data: any) {
    this.logger.log("add job push noti");
    await this.notiQueue.add("noti-job", data);
  }

  async addGiftToQueueForAccount(data: CheckGiftPointLevelDto) {
    try {
      console.log(JSON.stringify(data));
      let giftsDerlivered = await this.giftService.checkGiftUserDelivered(data);
      for (let gift of giftsDerlivered) {
        console.log(JSON.stringify(gift));
        let dataUserGift = await this.userGiftService.findOne({ gift_id: gift?._id.toString(), user_id: data.user_id });
        if (!dataUserGift) {
          let createGiveGiftDto: NotiGiveGiftDto = {
            quantity: gift.stock_qty.valueOf(),
            gift_id: gift,
            partner_id: data.user_id,
          };
          this.addTaskCheckGiftAccout(createGiveGiftDto);
        }
      }
    } catch (error) {
      this.logger.log("Send Gift To Customer Fails :", error.message);
    }
  }
}
