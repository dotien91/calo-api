import { Body, Controller, Delete, Get, Param, Post, Query, Req, Res } from "@nestjs/common";
import { CronExpression } from "@nestjs/schedule";
import { Response } from "express";
import { schedule } from "node-cron";
import { Permissions } from "../../../decorators/auth.decorator";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { UserRoles } from "../../../modules/user/interfaces/user.interface";
import { CreateNotificationDto } from "../dto/create-notifcation.dto";
import { DeleteNotificationDto } from "../dto/delete-notification.dto";
import { ListNotificationDto } from "../dto/list-notification.dto";
import { UpdateNotificationDto } from "../dto/update-notification.dto";
import { NotificationHelper } from "../helper/notification.helper";
@Controller("notification")
export class NotificationController {
  constructor(private readonly notificationHelper: NotificationHelper) {
    // this.handleProcessCron();
  }

  /**
   * @author Tony Vu
   */
  async handleProcessCron() {
    const cronJob = schedule(CronExpression.EVERY_2_HOURS, async () => {
      try {
        // await this.bar();
        console.log("Start Cron Job Every 2 Hour");
        this.notificationHelper.handleCronJob();
      } catch (e) {
        console.error(e);
      }
    });
    cronJob.start();
    // // Start job
    // if (!cronJob.running) {
    //   cronJob.start();
    // }
  }

  @Get("/admin-list")
  @Permissions(UserRoles.ADMIN)
  async getAdminOrder(@Query() query: ListNotificationDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.notificationHelper.getNotificationByAdmin(query, res, req);
  }

  @Get("/user-list")
  async getUserList(@Query() query: ListNotificationDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.notificationHelper.getUserList(query, res, req);
  }

  @Post("/admin-create")
  @Permissions(UserRoles.ADMIN)
  createNotificationAdmin(
    @Body() dataFollow: CreateNotificationDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return this.notificationHelper.createNotificationAdmin(dataFollow, res, req);
  }

  @Post("/admin-update")
  @Permissions(UserRoles.ADMIN)
  async updateByAdmin(@Body() dataUpdate: UpdateNotificationDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.notificationHelper.handleUpdateByAdmin(dataUpdate, res, req);
  }

  @Post("/update")
  async updateNotification(
    @Body() dataUpdate: UpdateNotificationDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.notificationHelper.updateNotification(dataUpdate, res, req);
  }

  @Get("detail-notification/:id")
  async getDetailOrder(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.notificationHelper.handleGetDetailAdmin(id, res, req);
  }

  @Delete("delete")
  async deleteNotification(
    @Body() dataDelete: DeleteNotificationDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.notificationHelper.deleteNotification(dataDelete, req, res);
  }
}
