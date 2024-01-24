import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { Permission, Permissions } from "../../../decorators/auth.decorator";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { Controllers } from "../../../modules/index.i";
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
import { ListCourseDto } from "../dto/list-course.dto";
import { ListCourseClassDto } from "../dto/list-course_class.dto";
import { ListCourseModuleDto } from "../dto/list-course_module.dto";
import { ListCourseOneOneDto } from "../dto/list-course_one_one.dto";
import { ListCourseReviewDto } from "../dto/list-course_review.dto";
import { ListMemberDto } from "../dto/list-member.dto";
import { ListTutorDto } from "../dto/list-tutor.dto";
import { UpdateCourseDto } from "../dto/update-course.dto";
import { UpdateCourseClassDto } from "../dto/update-course_class.dto";
import { UpdateCourseModuleDto } from "../dto/update-course_module.dto";
import { UpdateCourseOneOneStudentDto, UpdateCourseOneOneTeacherDto } from "../dto/update-course_one_one.dto";
import { UpdateCourseReviewDto } from "../dto/update-course_review.dto";
import { CourseHelper } from "../helper/course.helper";

@Controller(Controllers.COURSE)
@ApiTags("course")
@ApiBearerAuth("ICEO")
export class CourseController {
  constructor(private readonly courseHelper: CourseHelper) {}

  // course api
  @Post("/list")
  async getUserCourse(@Body() body: ListCourseDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.getCourseList(body, res, req);
  }

  @Post("/list-tutor")
  async getTutors(@Body() body: ListTutorDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.getTutors(body, req, res);
  }

  @Post("/admin-list")
  @Permissions(Permission(Controllers.COURSE).LIST)
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
  @Permissions(Permission(Controllers.COURSE).CREATE)
  async createNewCourse(
    @Body() createCourseBody: CreateCourseDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.createNewCourse(createCourseBody, res, req);
  }

  @Patch("/update")
  @Permissions(Permission(Controllers.COURSE).UPDATE)
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
  @Permissions(Permission(Controllers.COURSE).DELETE)
  async deleteCourse(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.handleDeleteCourse(id, res, req);
  }

  // course user api
  @Post("join")
  handleFollowUser(@Body() dataFollow: CreateCourseUserDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.courseHelper.processFollowUser(dataFollow, req, res);
  }

  @Post("add-user")
  @Permissions(Permission(Controllers.COURSE).CREATE)
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
  @Permissions(Permission(Controllers.COURSE).UPDATE)
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
  @Permissions(Permission(Controllers.COURSE).CREATE)
  async createNewCourseModule(
    @Body() createCourseBody: CreateCourseModuleDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.createNewCourseModule(createCourseBody, res, req);
  }

  @Patch("/update-module")
  @Permissions(Permission(Controllers.COURSE).UPDATE)
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
  @Permissions(Permission(Controllers.COURSE).DELETE)
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

  @Post("class/create")
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
    return await this.courseHelper.addMemberToClass(addMemberClassBody, req, res);
  }

  @Post("class/remove-member")
  async removeMemberFromClass(
    @Body() removeMemberClassBody: RemoveMemberCourseClassDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.removeMemberFromClass(removeMemberClassBody, req, res);
  }

  @Patch("class/update")
  async updateClass(
    @Body() updateClassBody: UpdateCourseClassDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.updateClass(updateClassBody, req, res);
  }

  @Delete("class/delete/:id")
  async deleteClass(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.deleteClass(id, req, res);
  }

  // course calendar teacher api
  @Get("one-one/teacher")
  async getCalendarTeacher(@Query() query: ListCourseOneOneDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.getCourseCalendarTeacherList(query, req, res);
  }

  @Post("one-one/teacher/create")
  async createNewCalendarTeacher(
    @Body() createBody: CreateCourseOneOneTeacherDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.createCourseCalendarTeacher(createBody, req, res);
  }

  @Patch("one-one/teacher/update")
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

  @Post("one-one/student/create")
  async createNewCalendarStudent(
    @Body() createBody: CreateCourseOneOneStudentDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.createCourseCalendarStudent(createBody, req, res);
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
