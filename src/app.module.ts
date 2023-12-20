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
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CourseModule } from "./modules/course/course.module";
import { MediaModule } from "./modules/media/media.module";
import { PodcastModule } from "./modules/podcast/podcast.module";
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
