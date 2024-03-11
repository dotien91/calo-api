import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Response } from "express";
import { Permissions } from "../../../decorators/auth.decorator";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { UserRoles } from "../../../modules/user/interfaces/user.interface";
import { CreateTestDTO, ListTestDto, UpdateTestDTO } from "../dtos/test.dto";
import { CreateTestQuestionDTO, ListTestQuestionDto, UpdateTestQuestionDTO } from "../dtos/test_question.dto";
import { CreateTestUserDTO, ListTestUserDto, UpdateTestUserDTO } from "../dtos/test_user.dto";
import { TestHelper } from "../helpers/test.helper";
import { TestQuestionHelper } from "../helpers/test_question.helper";
import { TestUserHelper } from "../helpers/test_user.helper";
import { TestStatus } from "../interfaces/test.interface.i";

@Controller("test")
export class TestController {
  constructor(
    private readonly testHelper: TestHelper,
    private readonly testQuestionHelper: TestQuestionHelper,
    private readonly testUserHelper: TestUserHelper
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async checkUserTestSubmit() {
    try {
      const tests = await this.testUserHelper.getTestByStatus(TestStatus.PENDING);
      for (const test of tests) {
        const data: UpdateTestUserDTO = {
          _id: test._id.toString(),
          answers: test.answers,
          finished_time: test.finished_time,
          test_id: test.test_id.toString(),
          type: test.type,
        };
        await this.testUserHelper.checkUserTestSubmit(data);
      }
    } catch (e) {
      console.log(e.message);
    }
  }

  // test apis
  @Get("/list")
  async listTest(@Query() query: ListTestDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.testHelper.list(query, res, req);
  }

  @Post("/create")
  @Permissions(UserRoles.TEACHER)
  async createNewTest(@Body() createTestData: CreateTestDTO, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.testHelper.createTest(createTestData, res, req);
  }

  @Patch("/update")
  @Permissions(UserRoles.TEACHER)
  async updateTest(@Body() updateTestData: UpdateTestDTO, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.testHelper.updateTest(updateTestData, res, req);
  }

  @Delete("delete/:id")
  @Permissions(UserRoles.TEACHER)
  async removeTest(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.testHelper.removeTest(id, res, req);
  }

  @Get("detail/:id")
  async handleGetDetailTest(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.testHelper.handleGetDetailTest(id, res, req);
  }

  // test question apis
  @Get("/question/list")
  async listTestQuestion(@Query() query: ListTestQuestionDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.testQuestionHelper.list(query, res, req);
  }

  @Get("/question/detail/:id")
  async getDetailTestQuestions(@Param() id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.testQuestionHelper.handleGetDetailTestQuestion(id, res, req);
  }

  @Post("/question/create")
  @Permissions(UserRoles.TEACHER)
  async createNewTestQuestions(
    @Body() createTestData: CreateTestQuestionDTO,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.testQuestionHelper.createTestQuestion(createTestData, res, req);
  }

  @Patch("/question/update")
  @Permissions(UserRoles.TEACHER)
  async updateTestQuestions(
    @Body() updateTestData: UpdateTestQuestionDTO,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.testQuestionHelper.updateTestQuestion(updateTestData, res, req);
  }

  @Delete("/question/delete/:id")
  @Permissions(UserRoles.TEACHER)
  async deleteTestQuestions(@Param() id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.testQuestionHelper.removeTestQuestion(id, res, req);
  }

  // test question apis
  @Get("/user/list")
  async listTestUser(@Query() query: ListTestUserDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.testUserHelper.list(query, res, req);
  }

  @Get("/user/detail/:id")
  async detailTestUser(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.testUserHelper.handleGetDetailTestUser(id, res, req);
  }

  @Post("/user/submit")
  async submitTest(@Body() body: CreateTestUserDTO, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.testUserHelper.submit(body, res, req);
  }

  @Get("/user/stats")
  async getUserStats(@Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.testUserHelper.getUserStats(res, req);
  }
}
