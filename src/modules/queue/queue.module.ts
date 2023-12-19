import { Module } from "@nestjs/common";
import { QueueService } from "./queue.service";
import { BullModule } from "@nestjs/bull";
import { UserGiftService } from "../gift/services/user_gift.service";
import { GiftService } from "../gift/services/gift.service";
import { MongooseModule } from "@nestjs/mongoose";
import { UserGift, UserGiftSchema } from "../gift/schemas/user_gift.schema";
import { Gift, GiftSchema } from "../gift/schemas/gift.schema";
import { ChannelPermission } from "../channel/schemas/channel_permission.schema";
import { ChannelPermissionSchema } from "../channel/schemas/channel_permission.";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserGift.name, schema: UserGiftSchema },
      { name: Gift.name, schema: GiftSchema },
      { name: ChannelPermission.name, schema: ChannelPermissionSchema },
    ]),
    BullModule.registerQueueAsync(
      {
        name: "gift",
      },
      {
        name: "noti",
      },
      {
        name: "cookbook",
      },
      {
        name: "challenge",
      }
    ),
  ],
  providers: [QueueService, UserGiftService, GiftService],
  exports: [QueueService],
})
export class QueueModule {}
