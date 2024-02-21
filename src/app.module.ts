import { BullModule } from "@nestjs/bull";
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import { AuthMiddleware } from "./middlewares/auth.middleware";
import { CheckDocumentSizeMiddleware } from "./middlewares/check_length.middleware";
import { ConfigModule as ConfigModuleCore } from "./modules/config/config.module";
import { ContactFormModule } from "./modules/contact_form/contact_form.module";
import { CoreModule } from "./modules/core/core.module";
import { HookModule } from "./modules/hook/hook.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { OrderModule } from "./modules/order/order.module";
import { PlanModule } from "./modules/plan/plan.module";
import { PurchaseModule } from "./modules/purchase/purchase.module";
import { QueueModule } from "./modules/queue/queue.module";
import { ReportModule } from "./modules/report/report.module";
import { SubscribeModule } from "./modules/subscribe/subscribe.module";
// import { TaskService } from "./modules/task/task.service";
import { TransactionModule } from "./modules/transaction/transaction.module";
// import { UserService } from "./modules/user/services/user.service";
import { UserModule } from "./modules/user/user.module";
// import { UserPermissionService } from "./modules/user_permission/services/user_permission.service";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CallKitModule } from "./modules/callkit/call_kit";
import { CartModule } from "./modules/cart/cart.module";
import { ChatHistoryModule } from "./modules/chat_history/chat_history.module";
import { ChatRoomModule } from "./modules/chat_room/chat_room.module";
import { CommunityModule } from "./modules/community/community.module";
import { CouponModule } from "./modules/coupon/coupon.module";
import { CourseModule } from "./modules/course/course.module";
import { EmailModule } from "./modules/email/email.module";
import { LivestreamModule } from "./modules/livestream/livestream.module";
import { MediaModule } from "./modules/media/media.module";
import { PodcastModule } from "./modules/podcast/podcast.module";
import { ProductModule } from "./modules/product/product.module";
import { ShopModule } from "./modules/shop/shop.module";
import { ShortModule } from "./modules/short/short.module";
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
  CoreModule,
  UserPermissionModule,
  SubscribeModule,
  PlanModule,
  ReportModule,
  OrderModule,
  PurchaseModule,
  NotificationModule,
  ConfigModuleCore,
  TransactionModule,
  UserModule,
  ContactFormModule,
  ScheduleModule.forRoot(),
  HookModule,
  MediaModule,
  QueueModule,
  PodcastModule,
  ShortModule,
  CourseModule,
  CommunityModule,
  ChatRoomModule,
  ChatHistoryModule,
  LivestreamModule,
  CallKitModule,
  EmailModule,
  CouponModule,
  ShopModule,
  ProductModule,
  CartModule,
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
  ServeStaticModule.forRoot({
    serveRoot: "/api/animals",
    rootPath: join(__dirname, "..", "animals"),
  }),
];
/**
 * Module import
 */
@Module({
  imports: dataImport,
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({ path: "*", method: RequestMethod.ALL });
    consumer.apply(CheckDocumentSizeMiddleware).forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
