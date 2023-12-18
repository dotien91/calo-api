import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, Req } from "@nestjs/common";
import { ClockHelper } from "../helper/clock.helper";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateClockDto } from "../dto/create-clock.dto";
import { ListClockDto } from "../dto/list-clock.dto";
import { UpdateClockDto } from "../dto/update-clock.dto";
import { ListClockHistoryDto } from "../dto/list-clock_history.dto";
import { CreateClockHistoryDto } from "../dto/create-clock_history.dto";
import { UpdateClockHistoryDto } from "../dto/update-clock_history.dto";
import { CronExpression } from "@nestjs/schedule";

@Controller("clock")
export class ClockController {
  constructor(private readonly clockHelper: ClockHelper) {
    // this.handleProcessCron();
  }

  // /**
  //  * @author Tony Vu
  //  */
  // async handleProcessCron() {
  //   let cronJobOneHour = new CronJob(CronExpression.EVERY_MINUTE, async () => {
  //     try {
  //       // await this.bar();
  //       console.log("Start Cron Job Every Min");
  //       // await this.handleSendNotificationClock();
  //     } catch (e) {
  //       console.error(e);
  //     }
  //   });
  //   // Start job
  //   if (!cronJobOneHour.running) {
  //     cronJobOneHour.start();
  //   }
  // }

  /**
   *
   * @returns
   */
  async handleSendNotificationClock() {
    return await this.clockHelper.handleSendNotificationClock();
  }

  @Get("/list")
  async getUserClock(@Query() query: ListClockDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.clockHelper.getClockListByUser(query, res, req);
  }

  @Post("/create")
  async createNewClock(@Body() createClockBody: CreateClockDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.clockHelper.createNewClock(createClockBody, res, req);
  }

  @Patch("/admin-update")
  async updateByAdmin(@Body() dataUpdate: UpdateClockDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.clockHelper.handleUpdateClockByAdmin(dataUpdate, res, req);
  }

  @Get("detail/:id")
  async getDetailClock(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.clockHelper.handleGetDetailClock(id, res, req);
  }

  @Get("/list-clock-history")
  async getUserPost(@Query() query: ListClockHistoryDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.clockHelper.getClockHistoryListByUser(query, res, req);
  }

  @Get("/clock-history-admin-list")
  async getAdminPost(@Query() query: ListClockHistoryDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.clockHelper.getClockHistoryListByUser(query, res, req);
  }

  @Post("/create-clock-history")
  async createNewPost(
    @Body() createPostBody: CreateClockHistoryDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.clockHelper.createNewClockHistory(createPostBody, res, req);
  }

  @Patch("/update-clock-history")
  async updatePostByAdmin(
    @Body() dataUpdate: UpdateClockHistoryDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.clockHelper.handleUpdateClockHistoryByAdmin(dataUpdate, res, req);
  }

  @Get("clock-history-detail/:id")
  async getDetailPost(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.clockHelper.handleGetDetailClockHistory(id, res, req);
  }

  @Delete("delete-clock/:id")
  async removeClock(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.clockHelper.handleDeleteClock(id, res, req);
  }

  @Delete("delete-clock-history/:id")
  async removeClockHistory(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.clockHelper.removeClockHistory(id, res, req);
  }
}
