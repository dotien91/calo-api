import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ChatRoomModule } from "./modules/chat_room/chat_room.module";
import { ChatHistoryModule } from "./modules/chat_history/chat_history.module";
import { ChatMediaModule } from "./modules/chat_media/chat_media.module";
import { CoreModule } from "./modules/core/core.module";
import { AuthMiddleware } from "./middlewares/auth.middleware";
import { RequireAuthMiddleware } from "./middlewares/require_auth.middleware";
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from "@nestjs/bull";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ChatSocketModule } from "./modules/chat_socket/chat_socket.module";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModule } from "./modules/user/user.module";
import { UserPermissionModule } from "./modules/user_permission/user_permission.module";
import { SubscribeModule } from "./modules/subscribe/subscribe.module";
import { PlanModule } from "./modules/plan/plan.module";
import { ReportModule } from "./modules/report/report.module";
import { MapModule } from "./modules/map/map.module";
import { CallKitModule } from "./modules/callkit/call_kit";
import { OrderModule } from "./modules/order/order.module";
import { PurchaseModule } from "./modules/purchase/purchase.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { EventModule } from "./modules/event/event.module";
import { ConfigModule as ConfigModuleCore } from "./modules/config/config.module";
import { CityModule } from "./modules/city/city.module";
import { PostModule } from "./modules/post/post.module";
import { FaceDetectionModule } from "./modules/face_detection/face_detection";
import { ShortModule } from "./modules/short/short.module";
import { TransactionModule } from "./modules/transaction/transaction.module";
import { LivestreamModule } from "./modules/livestream/livestream.module";
import { TopicModule } from "./modules/topic/topic.module";
import { QuestionModule } from "./modules/question/question.module";
import { GiftModule } from "./modules/gift/gift.module";
import { ClockModule } from "./modules/clock/clock.module";
import { ContactFormModule } from "./modules/contact_form/contact_form.module";
import { NeedHelpModule } from "./modules/need_help/need_help.module";
import { EcoSystemModule } from "./modules/eco_system/eco_system.module";
import { RequestModule } from "./modules/request/request.module";
import { EsimModule } from "./modules/e_sim/esim.module";
import { LawyerModule } from "./modules/lawyer/lawyer.module";
import { CourseModule } from "./modules/course/course.module";
import { ChannelModule } from "./modules/channel/channel.module";
import { ChallengeModule } from "./modules/challenge/challenge.module";
import { TicketModule } from "./modules/ticket/ticket.module";
import { CheckDocumentSizeMiddleware } from "./middlewares/check_length.middleware";
import { TaskService } from './modules/task/task.service';
import { config } from "firebase-functions/v1";
import { RedeemModule } from "./modules/redeem/redeem.module";
import { PodcastModule } from "./modules/podcast/podcast.module";
import { ChallengeConsumer, GiftConsumer, NotiConsumer } from "./modules/task/task.processor";
import { GiftService } from "./modules/gift/services/gift.service";
import { QueueModule } from './modules/queue/queue.module';
import { ChallengePermissionService } from "./modules/challenge/services/challenge_permission.service";
import { UserService } from "./modules/user/services/user.service";
import { ChallengeActivityService } from "./modules/challenge/services/challenge_activity.service";
import { EventHookAdderService } from "./modules/hook/services/hook_add.service";
import { EventHookWorkerService } from "./modules/hook/services/hook_do.service";
import { ChannelService } from "./modules/channel/services/channel.service";
import { ChallengeService } from "./modules/challenge/services/challenge.service";
import { TransactionHelper } from "./modules/transaction/helper/transaction.helper";
import { GiftHelper } from "./modules/gift/helper/gift.helper";
import { ChatHistoryHelper } from "./modules/chat_history/helpers/chat_history.helper";
import { CityHelper } from "./modules/city/helper/city.helper";
import { ChatRoomHelper } from "./modules/chat_room/helpers/chat_room.helper";
import { CallKitHelper } from "./modules/callkit/helper/call_kit.helper";
import { ChallengeHelper } from "./modules/challenge/helper/challenge.helper";
import { ChannelPermissionService } from "./modules/channel/services/channel_permission.service";
import { ChannelHelper } from "./modules/channel/helper/channel.helper";
import { ChatMediaService } from "./modules/chat_media/services/chat_media.service";
import { ChatRoomService } from "./modules/chat_room/services/chat_room.service";
import { ChatSocketService } from "./modules/chat_socket/chat_socket.service";
import { CityService } from "./modules/city/services/city.service";
import { CourseHelper } from "./modules/course/helper/course.helper";
import { CourseService } from "./modules/course/services/course.service";
import { EventHelper } from "./modules/event/helper/event.helper";
import { EventService } from "./modules/event/services/event.service";
import { EventHookNotificationService } from "./modules/hook/services/hook_notification.service";
import { TransactionService } from "./modules/transaction/services/transaction.service";
import { LivestreamHelper } from "./modules/livestream/helper/livestream.helper";
import { LivestreamService } from "./modules/livestream/services/livestream.service";
import { OrderHelper } from "./modules/order/helper/OrderHelper";
import { OrderService } from "./modules/order/services/order.service";
import { PodcastHelper } from "./modules/podcast/helper/podcast.helper";
import { PodcastService } from "./modules/podcast/services/podcast.service";
import { PurchaseHelper } from "./modules/purchase/helper/purchase.helper";
import { PurchaseService } from "./modules/purchase/services/purchase.service";
import { RedeemHelper } from "./modules/redeem/helper/redeem.helper";
import { RedeemService } from "./modules/redeem/services/redeem.service";
import { RequestHelper } from "./modules/request/helper/request.helper";
import { RequestService } from "./modules/request/services/request.service";
import { TicketService } from "./modules/ticket/services/ticket.service";
import { TicketHelper } from "./modules/ticket/helper/ticket.helper";
import { UserPermissionHelper } from "./modules/user_permission/helper/update_user_permission.helper";
import { UserLoginHelper } from "./modules/user/helper/user_login.helper";
import { UserFilterHelper } from "./modules/user/helper/user_filter.helper";
import { HookModule } from './modules/hook/hook.module';
import { QueueService } from "./modules/queue/queue.service";
import { CallkitService } from "./modules/callkit/services/callkit.service";
import { ChallengeGameService } from "./modules/challenge/services/challenge_game.service";
import { ChallengeViewService } from "./modules/challenge/services/challenge_view.service";
import { ChannelLevelService } from "./modules/channel/services/channel_level.service";
import { ChannelLikeService } from "./modules/channel/services/channel_like.service";
import { ChannelBannerService } from "./modules/channel/services/channel_banner.service";
import { ChatHistoryService } from "./modules/chat_history/services/chat_history.service";
import { UserJoinCityService } from "./modules/city/services/user_join_city.service";
import { CourseLikeService } from "./modules/course/services/course_like.service";
import { CourseViewService } from "./modules/course/services/course_view.service";
import { EsimHelper } from "./modules/e_sim/helper/esim.helper";
import { EsimService } from "./modules/e_sim/services/esim.service";
import { EsimCountryService } from "./modules/e_sim/services/esim_country.service";
import { EcoSystemHelper } from "./modules/eco_system/helper/eco_system.helper";
import { EcoSystemService } from "./modules/eco_system/services/eco_system.service";
import { EventCategoryService } from "./modules/event/services/event_category.service";
import { EventRatingService } from "./modules/event/services/event_rating.service";
import { EventIndexService } from "./modules/event/services/event_index.service";
import { EventReportService } from "./modules/event/services/event_report.service";
import { EventTypeService } from "./modules/event/services/event_type.service";
import { UserFollowEventService } from "./modules/event/services/user_follow_event.service";
import { FaceDetectionHelper } from "./modules/face_detection/helper/face_detection.helper";
import { FaceDetectionService } from "./modules/face_detection/services/face_detection.service";
import { UserGiftService } from "./modules/gift/services/user_gift.service";
import { LawyerHelper } from "./modules/lawyer/helper/lawyer.helper";
import { LawyerRatingHelper } from "./modules/lawyer/helper/lawyer_rating.helper";
import { LawyerTypeHelper } from "./modules/lawyer/helper/lawyer_type.helper";
import { LawyerService } from "./modules/lawyer/services/lawyer.service";
import { LawyerReportService } from "./modules/lawyer/services/lawyer_report.service";
import { LawyerTypeService } from "./modules/lawyer/services/lawyer_type.service";
import { LawyerRatingService } from "./modules/lawyer/services/lawyer_rating.service";
import { LawyerRawService } from "./modules/lawyer/services/lawyer_rawservice";
import { LawyerCategoryService } from "./modules/lawyer/services/lawyer_category.service";
import { LivestreamCommentService } from "./modules/livestream/services/livestream_comment.service";
import { LivestreamLikeService } from "./modules/livestream/services/livestream_like.service";
import { LivestreamViewService } from "./modules/livestream/services/livestream_view.service";
import { NotificationHelper } from "./modules/notification/helper/notification.helper";
import { NotificationService } from "./modules/notification/services/notification.service";
import { PodcastCategoryService } from "./modules/podcast/services/podcast_category.service";
import { RedeemHistoryService } from "./modules/redeem/services/redeem_history.service";
import { RedeemPermissionService } from "./modules/redeem/services/redeem_permission.service";
import { RequestCategoryService } from "./modules/request/services/request_category.service";
import { RequestCommentService } from "./modules/request/services/request_comment.service";
import { RequestLikeService } from "./modules/request/services/request_like.service";
import { RequestDisLikeService } from "./modules/request/services/request_dislike.service";
import { RequestPollService } from "./modules/request/services/request_poll.service";
import { TicketCategoryService } from "./modules/ticket/services/ticket_category.service";
import { TicketCommentService } from "./modules/ticket/services/ticket_comment.service";
import { TransactionBankService } from "./modules/transaction/services/transaction_bank.service";
import { UserAnonymousService } from "./modules/user/services/user_anonymous.service";
import { UserAnonymousSessionService } from "./modules/user/services/user_anonymous_session.service";
import { UserBlockService } from "./modules/user/services/user_block.service";
import { UserDisagreeService } from "./modules/user/services/user_disagree.service";
import { UserFollowService } from "./modules/user/services/user_follow.service";
import { UserInterestService } from "./modules/user/services/user_interest.service";
import { UserLocationService } from "./modules/user/services/user_location.service";
import { UserMoodService } from "./modules/user/services/user_mood.service";
import { UserOptionService } from "./modules/user/services/user_option.service";
import { UserQuestionService } from "./modules/user/services/user_question.service";
import { UserSessionService } from "./modules/user/services/user_session.service";
import { UserViewService } from "./modules/user/services/user_view.service";
import { ChatRoomUserOptionService } from "./modules/chat_room/services/chat_room_user_option.service";
import { UserPermissionService } from "./modules/user_permission/services/user_permission.service";
import { ChallengeNotificationService } from "./modules/challenge/services/challenge_notification.service";

let dataImport = [
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
      port: Number(process.env.REDIS_PORT)
    },
  }),
  BullModule.registerQueueAsync(
    {
      name: 'gift'
    },
    {
      name: 'noti'
    },
    {
      name: "cookbook"
    },
    {
      name: "challenge"
    }),
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
  providers: [AppService,
    GiftHelper,
    EventHookNotificationService, EventHookWorkerService,
    EventHookAdderService,
    NotificationHelper,
    QueueService,
    UserPermissionService,
    TransactionHelper,
    ChannelService, TaskService, GiftConsumer, NotiConsumer, ChallengeConsumer,
    UserService, ChallengeActivityService, ChallengeService

  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({ path: "*", method: RequestMethod.ALL });
    consumer.apply(CheckDocumentSizeMiddleware).forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
