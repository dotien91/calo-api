import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import * as moment from "moment-timezone";
import { Permissions } from "../../../decorators/auth.decorator";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { UserRoles } from "../../../modules/user/interfaces/user.interface";
import { UserService } from "../../../modules/user/services/user.service";
import { NotificationHelper } from "../../notification/helper/notification.helper";
import { NotificationRouter } from "../../notification/interfaces/notification.interface";
import { UserLoginHelper } from "../../user/helper/user_login.helper";
import { CreateCourseDto } from "../dto/create-course.dto";
import {
  AddMemberCourseClassDto,
  CreateCourseClassDto,
  RemoveMemberCourseClassDto,
} from "../dto/create-course_class.dto";
import { CreateCourseModuleDto } from "../dto/create-course_module.dto";
import { CreateCourseOneOneStudentDto, CreateCourseOneOneTeacherDto } from "../dto/create-course_one_one.dto";
import { CreateCourseReviewDto } from "../dto/create-course_review.dto";
import { CreateCourseUserDto } from "../dto/create-course_user.dto";
import { CreateCourseViewDto } from "../dto/create-course_view.dto";
import { GetCourseRoomParams, ListCourseDto, ListSaleCourseDto } from "../dto/list-course.dto";
import { ListCourseClassDto } from "../dto/list-course_class.dto";
import { ListCourseModuleDto } from "../dto/list-course_module.dto";
import { GetOneOneTimeAvailableDto, ListCourseOneOneDto } from "../dto/list-course_one_one.dto";
import { ListCourseReviewDto } from "../dto/list-course_review.dto";
import { ListMemberDto } from "../dto/list-member.dto";
import { ListTutorDto } from "../dto/list-tutor.dto";
import { UpdateCourseDto } from "../dto/update-course.dto";
import { UpdateCourseClassDto } from "../dto/update-course_class.dto";
import { UpdateCourseModuleDto } from "../dto/update-course_module.dto";
import { UpdateCourseOneOneStudentDto, UpdateCourseOneOneTeacherDto } from "../dto/update-course_one_one.dto";
import { UpdateCourseReviewDto } from "../dto/update-course_review.dto";
import { CourseHelper } from "../helper/course.helper";
import { CoursePublicStatus, CourseType } from "../interfaces/course.interface";

@Controller("course")
@ApiTags("course")
@ApiBearerAuth("ICEO")
export class CourseController {
  private todayNotifiedUserOneOneContainer = [];
  private todayNotifiedUserClassContainer = [];
  private authCode = "";

  constructor(
    private readonly courseHelper: CourseHelper,
    private readonly notificationHelper: NotificationHelper,
    private readonly userLoginHelper: UserLoginHelper,
    private readonly userService: UserService
  ) {
    const jwt = this.userLoginHelper.generateJwt(process.env.INFO_SESSION, true);
    if (typeof jwt !== "boolean") {
      this.authCode = jwt;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  cleanUpClassContainer() {
    this.todayNotifiedUserClassContainer = [];
    this.todayNotifiedUserOneOneContainer = [];
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkCourseClassesTime() {
    const classes = await this.courseHelper.getAllCourseClassList();

    for (const _class of classes) {
      const calendars = _class.course_calendar_ids;
      const classId = _class._id.toString();
      for (const calendar of calendars) {
        for (const member of _class.members) {
          const { day, time_start, time_end } = calendar as any;
          const memberTimezone = (member as any).timezone || "UTC";
          const memberId = (member as any)._id.toString();
          const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day];

          const currentTimeInMemberTimezone = moment().tz(memberTimezone);
          const startTime = moment(`${dayOfWeek} ${time_start}`, "dddd HH:mm").tz(memberTimezone);
          const fiveMinutesBeforeStartTime = startTime?.clone().subtract(5, "minutes");

          const timeDifference = currentTimeInMemberTimezone.diff(fiveMinutesBeforeStartTime, "milliseconds");

          if (timeDifference > 0 && timeDifference < 300000) {
            if (
              this.todayNotifiedUserClassContainer.find((data) => {
                return data.memberId === memberId && data.classId === classId;
              })
            ) {
              // skip notification
            } else {
              this.todayNotifiedUserClassContainer.push(memberId);
              const dataToSendNotification = {
                data_id: classId,
                path: `/v/room/class?room={classId}&displayName={userName}`,
              };
              this.todayNotifiedUserClassContainer.push({
                memberId,
                classId,
              });
              const dataNotification = {
                user_id: memberId,
                title: "translation.course.class.start.title",
                content: "",
                param: JSON.stringify(dataToSendNotification),
                type_action: "link",
                router: NotificationRouter.NAVIGATION_CLASS_ROOM,
                click_action: "",
                image: "",
                channel: "user",
              };

              // plus taught_time for teacher
              (async () => {
                const course = await this.courseHelper.getCourse({
                  _id: _class.course_id.toString(),
                });
                if (course) {
                  this.userService.updateTeacherTaughtTime(
                    course.user_id._id.toString(),
                    this.courseHelper.hourDifference(time_start, time_end)
                  );
                } else {
                }
              })();

              this.notificationHelper.handleSendNotification(dataNotification, this.authCode);
            }
          } else {
            // do nothing
          }
        }
      }
    }

    return;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkCourseOneOneTime() {
    const classes = await this.courseHelper.getAllAssignedTimeOfStudent();

    for (const _class of classes) {
      const classId = _class._id.toString();
      const calendars = _class.time_pick;
      for (const calendar of calendars) {
        const { day, time_start, time_end } = calendar as any;
        const memberTimezone = _class.user_id.timezone || "UTC";
        const memberId = _class.user_id._id.toString();
        const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day];

        const currentTimeInMemberTimezone = moment().tz(memberTimezone);
        const startTime = moment(`${dayOfWeek} ${time_start}`, "dddd HH:mm").tz(memberTimezone);
        const fiveMinutesBeforeStartTime = startTime?.clone().subtract(5, "minutes");

        const timeDifference = currentTimeInMemberTimezone.diff(fiveMinutesBeforeStartTime, "milliseconds");

        if (timeDifference > 0 && timeDifference < 300000) {
          if (
            this.todayNotifiedUserOneOneContainer.find((data) => {
              return data.memberId === memberId && data.classId === classId;
            })
          ) {
            // skip notification
          } else {
            const dataToSendNotification = {
              data_id: classId,
              path: `/v/room/class?room={classId}&displayName={userName}`,
            };
            this.todayNotifiedUserOneOneContainer.push({
              memberId,
              classId,
            });
            const dataNotification = {
              user_id: memberId,
              title: "translation.course.class.start.title",
              content: "",
              param: JSON.stringify(dataToSendNotification),
              type_action: "link",
              router: NotificationRouter.NAVIGATION_CLASS_ROOM,
              click_action: "",
              image: "",
              channel: "user",
            };

            // plus taught_time for teacher
            (async () => {
              const course = await this.courseHelper.getCourse({
                _id: _class.course_id.toString(),
              });
              if (course) {
                this.userService.updateTeacherTaughtTime(
                  course.user_id._id.toString(),
                  this.courseHelper.hourDifference(time_start, time_end)
                );
              } else {
              }
            })();

            this.notificationHelper.handleSendNotification(dataNotification, this.authCode);
          }
        } else {
          // do nothing
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkPendingCourse() {
    const pendingCourses = await this.courseHelper.getCourseListNoReq({ public_status: CoursePublicStatus.PENDING });
    for (const pendingCourse of pendingCourses) {
      const pendingCourseId = pendingCourse._id.toString();
      let isValidCourse = false;

      switch (pendingCourse.type) {
        case CourseType.CALL_GROUP: {
          const courseClasses = await this.courseHelper.getAllCourseClassList({
            course_id: pendingCourseId,
          });
          if (courseClasses?.length > 0) isValidCourse = true;
          break;
        }
        case CourseType.SELF_LEARNING: {
          const courseModules = await this.courseHelper.getCourseModuleListNoReq({
            course_id: pendingCourseId,
          });
          if (courseModules?.length > 0) isValidCourse = true;
          break;
        }
        case CourseType.CALL_ONE_ONE: {
          isValidCourse = true;
          break;
        }
        default: {
          break;
        }
      }
      if (isValidCourse) {
        await this.courseHelper.updateCourseNoReq({
          _id: pendingCourseId,
          public_status: CoursePublicStatus.ACTIVE,
        });
      }
    }
  }

  // course api
  @Post("/list")
  async getUserCourse(@Body() body: ListCourseDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.getCourseList(body, res, req);
  }

  @Post("/suggest")
  async getCourseSuggest(@Body() body: ListCourseDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.getCourseList(body, res, req);
  }

  @Post("/list-tutor")
  async getTutors(@Body() body: ListTutorDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.getTutors(body, req, res);
  }

  @Post("/admin-list")
  @Permissions(UserRoles.ADMIN)
  async getAdminCourse(@Body() body: ListCourseDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.getCourseListByAdmin(body, res, req);
  }

  @Get("filter-items")
  async getFilterItems(@Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.getFilterItems(req, res);
  }

  @Get("filter-tutors")
  async getFilterTutors(@Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.getFilterTutors(req, res);
  }

  @Post("/create")
  @Permissions(UserRoles.TEACHER)
  async createNewCourse(
    @Body() createCourseBody: CreateCourseDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.createNewCourse(createCourseBody, res, req);
  }

  @Patch("/update")
  @Permissions(UserRoles.TEACHER)
  async updateCourse(@Body() dataUpdate: UpdateCourseDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.updateCourse(dataUpdate, res, req);
  }

  @Get("detail/:id")
  async getDetailCourse(
    @Query() query: ListCourseDto,
    @Param("id") id: string,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.handleGetDetailCourse(query, id, res, req);
  }

  @Delete("delete/:id")
  async deleteCourse(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.handleDeleteCourse(id, res, req);
  }

  @Get("room")
  async getCourseRoom(@Query() query: GetCourseRoomParams, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.getCourseRoom(query, res, req);
  }

  @Post("my-course")
  async getMyCourse(@Body() body: ListCourseDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.getMyCourse(body, res, req);
  }

  @Post("sale")
  async getSaleCourse(@Body() body: ListSaleCourseDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.getSaleCourse(body, res, req);
  }

  // course user api
  @Post("join")
  @Permissions(UserRoles.TEACHER)
  handleFollowUser(@Body() dataFollow: CreateCourseUserDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.courseHelper.processFollowUser(dataFollow, req, res);
  }

  @Post("add-user")
  @Permissions(UserRoles.TEACHER)
  handleAddUser(@Body() addAdd: CreateCourseUserDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.courseHelper.handleAddUserToCourse(addAdd, req, res);
  }

  @Get("list-join")
  handleGetListLike(@Query() query: ListCourseDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.courseHelper.handleGetListLike(query, res, req);
  }

  @Get("list-member")
  handleGetListMember(@Query() query: ListMemberDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.courseHelper.handleGetListMember(query, res, req);
  }

  @Post("un-join")
  handleUnFollowUser(@Body() dataFollow: CreateCourseUserDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.courseHelper.processUnFollowUser(dataFollow, req, res);
  }

  // course view api
  @Get("list-view")
  handleGetListView(@Query() query: ListCourseDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.courseHelper.handleGetListView(query, res, req);
  }

  @Post("view")
  handleViewUser(@Body() dataView: CreateCourseViewDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.courseHelper.processViewCourse(dataView, req, res);
  }

  // course module api
  @Get("/list-module")
  @ApiOperation({ summary: "Variable: is_parent have 2 value is 0 and 1" })
  async getListModule(@Query() query: ListCourseModuleDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.getCourseModuleList(query, res, req);
  }

  @Post("/create-module")
  @Permissions(UserRoles.TEACHER)
  async createNewCourseModule(
    @Body() createCourseBody: CreateCourseModuleDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.createNewCourseModule(createCourseBody, res, req);
  }

  @Patch("/update-module")
  @Permissions(UserRoles.TEACHER)
  async updateCourseModule(
    @Body() dataUpdate: UpdateCourseModuleDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.updateCourseModule(dataUpdate, res, req);
  }

  @Get("detail-module/:id")
  async getDetailCourseModule(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.handleGetDetailCourseModule(id, res, req);
  }

  @Delete("delete-module/:id")
  @Permissions(UserRoles.TEACHER)
  async deleteCourseModule(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.handleDeleteCourseModule(id, res, req);
  }

  // course review api
  @Get("list-review")
  async getCourseReview(@Query() query: ListCourseReviewDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.getCourseReviewList(query, req, res);
  }

  @Post("create-review")
  async createNewReview(
    @Body() createReviewBody: CreateCourseReviewDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.createNewReview(createReviewBody, req, res);
  }

  @Patch("update-review")
  async updateReview(
    @Body() updateReviewBody: UpdateCourseReviewDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.updateReview(updateReviewBody, req, res);
  }

  @Delete("delete-review/:id")
  async deleteReview(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.deleteReview(id, req, res);
  }

  // course class api
  @Get("class/list")
  async getCourseClass(@Query() query: ListCourseClassDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.getCourseClassList(query, req, res);
  }

  @Get("class/:id")
  async getCourseClassDetail(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.getCourseClassDetail(id, req, res);
  }

  @Post("class/create")
  @Permissions(UserRoles.TEACHER)
  async createNewClass(
    @Body() createClassBody: CreateCourseClassDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.createNewClass(createClassBody, req, res);
  }

  @Post("class/add-member")
  async addMemberToClass(
    @Body() addMemberClassBody: AddMemberCourseClassDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.addMemberToClassInAppPurchase(addMemberClassBody, req, res);
  }

  @Post("class/member/check")
  async checkMemberToClass(
    @Body() addMemberClassBody: AddMemberCourseClassDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.checkMemberToClass(addMemberClassBody, req, res);
  }

  @Post("class/remove-member")
  @Permissions(UserRoles.TEACHER)
  async removeMemberFromClass(
    @Body() removeMemberClassBody: RemoveMemberCourseClassDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.removeMemberFromClass(removeMemberClassBody, req, res);
  }

  @Patch("class/update")
  @Permissions(UserRoles.TEACHER)
  async updateClass(
    @Body() updateClassBody: UpdateCourseClassDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.updateClass(updateClassBody, req, res);
  }

  @Delete("class/delete/:id")
  @Permissions(UserRoles.TEACHER)
  async deleteClass(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.deleteClass(id, req, res);
  }

  // course calendar teacher api
  @Get("one-one/teacher")
  async getCalendarTeacher(@Query() query: ListCourseOneOneDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.getCourseCalendarTeacherList(query, req, res);
  }

  @Get("one-one/time-available")
  async getOneOneTimeAvailable(
    @Query() query: GetOneOneTimeAvailableDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.getCourseOneOneTimeAvailable(query, req, res);
  }

  @Post("one-one/teacher/create")
  @Permissions(UserRoles.TEACHER)
  async createNewCalendarTeacher(
    @Body() createBody: CreateCourseOneOneTeacherDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.createCourseCalendarTeacher(createBody, req, res);
  }

  @Post("one-one/student/create")
  async createNewCalendarStudent(
    @Body() createBody: CreateCourseOneOneStudentDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.createCourseCalendarStudent(createBody, req, res);
  }

  @Patch("one-one/teacher/update")
  @Permissions(UserRoles.TEACHER)
  async updateCalendarTeacher(
    @Body() updateBody: UpdateCourseOneOneTeacherDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.updateCourseCalendarTeacher(updateBody, req, res);
  }

  // course calendar student api
  @Get("one-one/student")
  async getCalendarStudent(@Query() query: ListCourseOneOneDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.getCourseCalendarStudentList(query, req, res);
  }

  @Post("one-one/student/check")
  async checkNewCalendarStudent(
    @Body() createBody: CreateCourseOneOneStudentDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.checkCourseCalendarStudent(createBody, req, res);
  }

  @Patch("one-one/student/update")
  async updateCalendarStudent(
    @Body() updateBody: UpdateCourseOneOneStudentDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.updateCourseCalendarStudent(updateBody, req, res);
  }
}
