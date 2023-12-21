import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { Permission, Permissions } from "../../../decorators/auth.decorator";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { Controllers } from "../../../modules/index.i";
import { CreateCourseDto } from "../dto/create-course.dto";
import { CreateCourseLikeDto } from "../dto/create-course_like.dto";
import { CreateCourseModuleDto } from "../dto/create-course_module.dto";
import { CreateCourseViewDto } from "../dto/create-course_view.dto";
import { ListCourseDto } from "../dto/list-course.dto";
import { ListCourseModuleDto } from "../dto/list-course_module.dto";
import { ListMemberDto } from "../dto/list-member.dto";
import { UpdateCourseDto } from "../dto/update-course.dto";
import { UpdateCourseModuleDto } from "../dto/update-course_module.dto";
import { CourseHelper } from "../helper/course.helper";

@Controller(Controllers.COURSE)
@ApiTags("course")
@ApiBearerAuth("ICEO")
export class CourseController {
  constructor(private readonly courseHelper: CourseHelper) {}

  @Get("/list")
  async getUserCourse(@Query() query: ListCourseDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.getCourseList(query, res, req);
  }

  @Get("/admin-list")
  @Permissions(Permission(Controllers.COURSE).LIST)
  async getAdminCourse(@Query() query: ListCourseDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.getCourseListByAdmin(query, res, req);
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

  @Post("view")
  handleViewUser(@Body() dataView: CreateCourseViewDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.courseHelper.processViewCourse(dataView, req, res);
  }

  @Post("join")
  handleFollowUser(@Body() dataFollow: CreateCourseLikeDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.courseHelper.processFollowUser(dataFollow, req, res);
  }

  @Post("add-user")
  @Permissions(Permission(Controllers.COURSE).CREATE)
  handleAddUser(@Body() addAdd: CreateCourseLikeDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.courseHelper.handleAddUserToCourse(addAdd, req, res);
  }

  @Get("list-join")
  handleGetListLike(@Query() query: ListCourseDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.courseHelper.handleGetListLike(query, res, req);
  }

  @Get("list-member")
  @Permissions(Permission(Controllers.COURSE).LIST)
  handleGetListMember(@Query() query: ListMemberDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.courseHelper.handleGetListMember(query, res, req);
  }

  @Get("list-view")
  handleGetListView(@Query() query: ListCourseDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.courseHelper.handleGetListView(query, res, req);
  }

  @Post("un-join")
  @Permissions(Permission(Controllers.COURSE).LIST)
  handleUnFollowUser(@Body() dataFollow: CreateCourseLikeDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.courseHelper.processUnFollowUser(dataFollow, req, res);
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
}
