import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { QueueService } from "./queue.service";

@Module({
  imports: [
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
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
