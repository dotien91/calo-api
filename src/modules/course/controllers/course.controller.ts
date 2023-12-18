import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, Req } from "@nestjs/common";
import { CourseHelper } from "../helper/course.helper";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateCourseDto } from "../dto/create-course.dto";
import { ListCourseDto } from "../dto/list-course.dto";
import { UpdateCourseDto } from "../dto/update-course.dto";
import { CreateCourseViewDto } from "../dto/create-course_view.dto";
import { CreateCourseLikeDto } from "../dto/create-course_like.dto";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ListCourseModuleDto } from "../dto/list-course_module.dto";
import { CreateCourseModuleDto } from "../dto/create-course_module.dto";
import { UpdateCourseModuleDto } from "../dto/update-course_module.dto";
import { ListMemberDto } from "../dto/list-member.dto";

@Controller("course")
@ApiTags('course')
@ApiBearerAuth('ICEO')
export class CourseController {
  constructor(private readonly courseHelper: CourseHelper) { }

  @Get("/list")
  async getUserCourse(
    @Query() query: ListCourseDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.getCourseList(query, res, req);
  }

  @Get("/admin-list")
  async getAdminCourse(
    @Query() query: ListCourseDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.getCourseListByAdmin(query, res, req);
  }

  @Post("/create")
  async createNewCourse(
    @Body() createCourseBody: CreateCourseDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.createNewCourse(createCourseBody, res, req);
  }

  @Patch("/update")
  async updateCourse(
    @Body() dataUpdate: UpdateCourseDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.updateCourse(dataUpdate, res, req);
  }

  @Post("view")
  handleViewUser(
    @Body() dataView: CreateCourseViewDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return this.courseHelper.processViewCourse(dataView, req, res);
  }

  @Post("join")
  handleFollowUser(
    @Body() dataFollow: CreateCourseLikeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return this.courseHelper.processFollowUser(dataFollow, req, res);
  }

  @Post("add-user")
  handleAddUser(
    @Body() addAdd: CreateCourseLikeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return this.courseHelper.handleAddUserToCorse(addAdd, req, res)
  }

  @Get("list-join")
  handleGetListLike(
    @Query() query: ListCourseDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return this.courseHelper.handleGetListLike(query, res, req);
  }

  @Get("list-member")
  handleGetListMember(
    @Query() query: ListMemberDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return this.courseHelper.handleGetListMember(query, res, req);
  }

  @Get("list-view")
  handleGetListView(
    @Query() query: ListCourseDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return this.courseHelper.handleGetListView(query, res, req);
  }

  @Post("un-join")
  handleUnFollowUser(
    @Body() dataFollow: CreateCourseLikeDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return this.courseHelper.processUnFollowUser(dataFollow, req, res);
  }

  @Patch("/update")
  async updateByAdmin(
    @Body() dataUpdate: UpdateCourseDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.handleUpdateCourseByAdmin(dataUpdate, res, req);
  }

  @Get("detail/:id")
  async getDetailCourse(@Query() query: ListCourseDto, @Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.handleGetDetailCourse(query, id, res, req);
  }

  @Delete("delete/:id")
  async deleteCourse(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.handleDeleteCourse(id, res, req);
  }

  @Get("/list-module")
  @ApiOperation({ summary: 'Variable: is_parent have 2 value is 0 and 1' })
  async getListModule(
    @Query() query: ListCourseModuleDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.getCourseModuleList(query, res, req);
  }

  @Post("/create-module")
  async createNewCourseModule(
    @Body() createCourseBody: CreateCourseModuleDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.courseHelper.createNewCourseModule(createCourseBody, res, req);
  }

  @Patch("/update-module")
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
  async deleteCourseModule(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.courseHelper.handleDeleteCourseModule(id, res, req);
  }
}
