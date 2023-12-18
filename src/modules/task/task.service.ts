import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GiftHelper } from '../gift/helper/gift.helper';

@Injectable()
export class TaskService {
	constructor(private readonly giftHelper: GiftHelper) {}
  private readonly logger = new Logger(TaskService.name);

	@Cron(CronExpression.EVERY_DAY_AT_3AM) // This will run the task every 45 seconds
  handleCron() {
    this.logger.debug('Called when the current second is 30');
		this.giftHelper.addGiftToQueue();
  }

	@Cron(CronExpression.EVERY_DAY_AT_3AM) // This will run the task every 45 seconds
  sendGiftDaily() {
    this.logger.debug('Called when the current second is 45');
  }
}
