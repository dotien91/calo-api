import { BullModule } from "@nestjs/bull";
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthMiddleware } from "./middlewares/auth.middleware";
import { CheckDocumentSizeMiddleware } from "./middlewares/check_length.middleware";
import { CallKitModule } from "./modules/callkit/call_kit";
import { ChallengeModule } from "./modules/challenge/challenge.module";
import { ChallengeService } from "./modules/challenge/services/challenge.service";
import { ChallengeActivityService } from "./modules/challenge/services/challenge_activity.service";
import { ChannelModule } from "./modules/channel/channel.module";
import { ChannelService } from "./modules/channel/services/channel.service";
import { ChatHistoryModule } from "./modules/chat_history/chat_history.module";
import { ChatMediaModule } from "./modules/chat_media/chat_media.module";
import { ChatRoomModule } from "./modules/chat_room/chat_room.module";
import { ChatSocketModule } from "./modules/chat_socket/chat_socket.module";
import { CityModule } from "./modules/city/city.module";
import { ClockModule } from "./modules/clock/clock.module";
import { ConfigModule as ConfigModuleCore } from "./modules/config/config.module";
import { ContactFormModule } from "./modules/contact_form/contact_form.module";
import { CoreModule } from "./modules/core/core.module";
import { CourseModule } from "./modules/course/course.module";
import { EsimModule } from "./modules/e_sim/esim.module";
import { EcoSystemModule } from "./modules/eco_system/eco_system.module";
import { EventModule } from "./modules/event/event.module";
import { FaceDetectionModule } from "./modules/face_detection/face_detection";
import { GiftModule } from "./modules/gift/gift.module";
import { GiftHelper } from "./modules/gift/helper/gift.helper";
import { HookModule } from "./modules/hook/hook.module";
import { EventHookAdderService } from "./modules/hook/services/hook_add.service";
import { EventHookWorkerService } from "./modules/hook/services/hook_do.service";
import { EventHookNotificationService } from "./modules/hook/services/hook_notification.service";
import { LawyerModule } from "./modules/lawyer/lawyer.module";
import { LivestreamModule } from "./modules/livestream/livestream.module";
import { MapModule } from "./modules/map/map.module";
import { NeedHelpModule } from "./modules/need_help/need_help.module";
import { NotificationHelper } from "./modules/notification/helper/notification.helper";
import { NotificationModule } from "./modules/notification/notification.module";
import { OrderModule } from "./modules/order/order.module";
import { PlanModule } from "./modules/plan/plan.module";
import { PodcastModule } from "./modules/podcast/podcast.module";
import { PostModule } from "./modules/post/post.module";
import { PurchaseModule } from "./modules/purchase/purchase.module";
import { QuestionModule } from "./modules/question/question.module";
import { QueueModule } from "./modules/queue/queue.module";
import { QueueService } from "./modules/queue/queue.service";
import { RedeemModule } from "./modules/redeem/redeem.module";
import { ReportModule } from "./modules/report/report.module";
import { RequestModule } from "./modules/request/request.module";
import { ShortModule } from "./modules/short/short.module";
import { SubscribeModule } from "./modules/subscribe/subscribe.module";
import { ChallengeConsumer, GiftConsumer, NotiConsumer } from "./modules/task/task.processor";
import { TaskService } from "./modules/task/task.service";
import { TicketModule } from "./modules/ticket/ticket.module";
import { TopicModule } from "./modules/topic/topic.module";
import { TransactionHelper } from "./modules/transaction/helper/transaction.helper";
import { TransactionModule } from "./modules/transaction/transaction.module";
import { UserService } from "./modules/user/services/user.service";
import { UserModule } from "./modules/user/user.module";
import { UserPermissionService } from "./modules/user_permission/services/user_permission.service";
import { UserPermissionModule } from "./modules/user_permission/user_permission.module";

const dataImport = [
  ConfigModule.forRoot(),
  MongooseModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => ({
      uri: config.get<string>("MONGODB_URI") ? config.get<string>("MONGODB_URI") : "",
    }),
  }),
  JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>("JWT_SECRET_KEY"),
    }),
    inject: [ConfigService],
  }),
  ChatRoomModule,
  ChatHistoryModule,
  ChatMediaModule,
  FaceDetectionModule,
  CoreModule,
  UserPermissionModule,
  ShortModule,
  SubscribeModule,
  LivestreamModule,
  PlanModule,
  ReportModule,
  MapModule,
  CallKitModule,
  OrderModule,
  EventModule,
  PurchaseModule,
  NotificationModule,
  ConfigModuleCore,
  CityModule,
  TransactionModule,
  TopicModule,
  PostModule,
  UserModule,
  QuestionModule,
  GiftModule,
  ClockModule,
  ContactFormModule,
  NeedHelpModule,
  EcoSystemModule,
  RequestModule,
  EsimModule,
  LawyerModule,
  CourseModule,
  ChannelModule,
  ChallengeModule,
  TicketModule,
  ScheduleModule.forRoot(),
  RedeemModule,
  PodcastModule,
  HookModule,
  QueueModule,
  BullModule.forRoot({
    redis: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  }),
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
];

if (process.env.BRANCH_NAME == "esim") {
  dataImport.push(ChatSocketModule);
}
/**
 * Module import
 */
@Module({
  imports: dataImport,
  controllers: [AppController],
  providers: [
    AppService,
    GiftHelper,
    EventHookNotificationService,
    EventHookWorkerService,
    EventHookAdderService,
    NotificationHelper,
    QueueService,
    UserPermissionService,
    TransactionHelper,
    ChannelService,
    TaskService,
    GiftConsumer,
    NotiConsumer,
    ChallengeConsumer,
    UserService,
    ChallengeActivityService,
    ChallengeService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({ path: "*", method: RequestMethod.ALL });
    consumer.apply(CheckDocumentSizeMiddleware).forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
