import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from "@nestjs/common";
import { CronExpression } from "@nestjs/schedule";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";
import { schedule } from "node-cron";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { ConfigService } from "../../../modules/config/services/config.service";
import { CreateChangePasswordDto } from "../dto/create-change-password.dto";
import { CreateForgotPassword } from "../dto/create-forgot-password.dto";
import { CreateUserAnonymousDto } from "../dto/create-user_anonymous.dto";
import { CreateUserBlockDto } from "../dto/create-user_block.dto";
import { CreateUserFollowDto } from "../dto/create-user_follow.dto";
import { CreateUserInterestDto } from "../dto/create-user_interest.dto";
import { CreateUserLocationDto } from "../dto/create-user_location.dto";
import { CreateUserQuestionDto } from "../dto/create-user_question.dto";
import { CreateUserViewDto } from "../dto/create-user_view.dto";
import { LoginUserDto } from "../dto/login-user.dto";
import { LoginUserPasswordDto } from "../dto/login-user_password.dto";
import { RegisterUserDto } from "../dto/register-user.dto";
import { RequestDataDto } from "../dto/request-data.dto";
import { SearchAdminFilterDto } from "../dto/search-admin_filter.dto";
import { SearchBaseUserDto } from "../dto/search-base_user.dto";
import { SearchBlockListDto } from "../dto/search-block_list.dto";
import { SearchFollowCountDto } from "../dto/search-follow_count.dto";
import { SearchUserDto } from "../dto/search-user.dto";
import { SearchUserFollowDto } from "../dto/search-user_follow.dto";
import { SearchUserInterestDto } from "../dto/search-user_interest.dto";
import { SearchUserLocationDto } from "../dto/search-user_location.dto";
import { SearchUserMoodDto } from "../dto/search-user_mood.dto";
import { SendPhoneDto } from "../dto/send-phone.dto";
import { UpdateSessionDto } from "../dto/update-session.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { UpdateUserActiveDto } from "../dto/update-user_active.dto";
import { UpdateUserInterestDto } from "../dto/update-user_interest.dto";
import { UpdateUserOptionDto } from "../dto/update-user_option.dto";
import { UpdateUserQuestionDto } from "../dto/update-user_question.dto";
import { ValidatePhoneDto } from "../dto/validate-phone.dto";
import { UpdateUserHelper } from "../helper/update_user.helper";
import { UserFilterHelper } from "../helper/user_filter.helper";
import { UserLoginHelper } from "../helper/user_login.helper";
import { UserService } from "../services/user.service";
import { UserOptionService } from "../services/user_option.service";

@Controller("user")
@ApiTags("user")
@ApiBearerAuth("ICEO")
export class UserController {
  constructor(
    private readonly appUserService: UserService,
    private readonly userLoginHelper: UserLoginHelper,
    private readonly updateUserHelper: UpdateUserHelper,
    private readonly userFilterHelper: UserFilterHelper,
    private readonly configService: ConfigService,
    private readonly userOptionService: UserOptionService
  ) {
    this.handleProcessCron();
    this.updateEvent();
  }

  /**
   *
   */
  async updateEvent() {
    //update Event
    console.log(process.env.BRANCH_NAME, ";process.env.BRANCH_NAME");
    // this.userLoginHelper.updateEvent();
    if (process.env.BRANCH_NAME === "chat_gpt") {
      // this.userFilterHelper.handleCronJob();
      const cronJob = schedule(CronExpression.EVERY_DAY_AT_3PM, async () => {
        try {
          // await this.bar();
          console.log("Start Cron Job Every Day at 1am");
          this.userLoginHelper.updateEvent();
        } catch (e) {
          console.error(e);
        }
      });
      // Start job
      // if (!cronJob.running) {
      //   cronJob.start();
      // }
    }
  }

  /**
   * @author Tony Vu
   */
  async handleProcessCron() {
    const cronJobOneHour = schedule(CronExpression.EVERY_HOUR, async () => {
      try {
        // await this.bar();
        console.log("Start Cron Job Every Hour");
        this.updateUserHelper.processUserCron();
      } catch (e) {
        console.error(e);
      }
    });
    // Start job
    // if (!cronJobOneHour.running) {
    //   cronJobOneHour.start();
    // }
    cronJobOneHour.start();

    // this.userFilterHelper.handleCronJob();

    const cronJob = schedule(CronExpression.EVERY_DAY_AT_1AM, async () => {
      try {
        // await this.bar();
        console.log("Start Cron Job Every Day at 1am");
        this.userFilterHelper.handleCronJob();
      } catch (e) {
        console.error(e);
      }
    });
    // Start job
    // if (!cronJob.running) {
    //   cronJob.start();
    // }
    cronJob.start();
  }

  @Post("login/google")
  loginWithGoogle(@Body() loginData: LoginUserDto, @Res() res: Response, @Req() req: Request) {
    return this.userLoginHelper.loginWithGoogle(loginData, res, req);
  }

  @Post("login/apple")
  @ApiOperation({ summary: "Login with Apple" })
  loginWithApple(@Body() loginData: LoginUserDto, @Res() res: Response, @Req() req: Request) {
    return this.userLoginHelper.loginWithApple(loginData, res, req);
  }

  @Post("login/facebook")
  @ApiOperation({ summary: "Login with Facebook" })
  loginWithFacebook(@Body() loginData: LoginUserDto, @Res() res: Response, @Req() req: Request) {
    return this.userLoginHelper.loginWithFacebook(loginData, res, req);
  }

  @Post("login/send-phone")
  @ApiOperation({ summary: "Send validate Phone" })
  sendPhone(@Body() dataValidate: SendPhoneDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.userLoginHelper.sendPhone(dataValidate, req, res);
  }

  @Post("login/validate-phone")
  @ApiOperation({ summary: "Send validate Phone" })
  validatePhone(@Body() dataValidate: ValidatePhoneDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.userLoginHelper.validatePhone(dataValidate, req, res);
  }

  @Post("login/password")
  @ApiOperation({ summary: "Login with username/password" })
  loginWithPassword(@Body() loginData: LoginUserPasswordDto, @Res() res: Response, @Req() req: Request) {
    return this.userLoginHelper.loginWithPassword(loginData, res, req);
  }

  @Post("change-password")
  @ApiOperation({ summary: "Change password - working only when receive Email forgot password!" })
  handleChangePassword(@Body() dataChangePassword: CreateChangePasswordDto, @Res() res: Response, @Req() req: Request) {
    return this.userLoginHelper.handleChangePassword(dataChangePassword, res, req);
  }

  @Post("login/sign-up")
  @ApiOperation({ summary: "Sign up new account with username/password" })
  register(@Body() loginData: RegisterUserDto, @Res() res: Response, @Req() req: Request) {
    return this.userLoginHelper.register(loginData, res, req);
  }

  @Get("list/admin")
  @ApiOperation({ summary: "List user - with admin permission" })
  async getListUser(@Query() query: SearchUserDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return await this.userFilterHelper.handleFilterUser(query, req, res);
  }

  @Get("me")
  @ApiOperation({ summary: "List user - with admin permission" })
  async getOwnUser(@Req() req: ExpressRequestDto, @Res() res: Response) {
    return await this.userFilterHelper.getOwnUser(req, res);
  }

  @Get("list/following")
  @ApiOperation({ summary: "User follow a user" })
  async getListFollowing(@Query() query: SearchUserFollowDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return await this.userFilterHelper.getListFollowing(query, req, res);
  }

  @Get("list/followers")
  @ApiOperation({ summary: "List follow user, can filter by user_id" })
  async getListFollower(@Query() query: SearchUserFollowDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return await this.userFilterHelper.getListFollower(query, req, res);
  }

  @Get("list/user-location")
  @ApiOperation({ summary: "Get list user by location" })
  async getListUserLocation(
    @Query() query: SearchUserLocationDto,
    @Req() req: ExpressRequestDto,
    @Res() res: Response
  ) {
    return await this.userFilterHelper.getListUserLocation(query, req, res);
  }

  @Get("list/match")
  @ApiOperation({ summary: "Get list user follow together" })
  async getListMatch(@Query() query: SearchUserFollowDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return await this.userFilterHelper.getListMatch(query, req, res);
  }

  @Get("list/match-location")
  @ApiOperation({ summary: "Get list user follow together by Location" })
  async getListMatchLocation(@Query() query: SearchUserFollowDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return await this.userFilterHelper.getListMatchLocation(query, req, res);
  }

  @Get("list/disagree")
  @ApiOperation({ summary: "Get list user un-like" })
  async getListDisagree(@Query() query: SearchUserFollowDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return await this.userFilterHelper.getListDisagree(query, req, res);
  }

  @Get("list/view")
  @ApiOperation({ summary: "Get list user like me" })
  async getListView(@Query() query: SearchUserFollowDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return await this.userFilterHelper.getListView(query, req, res);
  }

  @Get("list/admin-filter")
  @ApiOperation({ summary: "List user - admin permission" })
  async getListAdminFilter(@Query() query: SearchAdminFilterDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return await this.userFilterHelper.getListAdminFilter(query, req, res);
  }

  @Get("list/admin-search")
  @ApiOperation({ summary: "Search user - admin permission" })
  async getListAdminSearch(@Query() query: SearchAdminFilterDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return await this.userFilterHelper.getListAdminSearch(query, req, res);
  }

  // @Get("process-user")
  // async handleProcessUser(@Query() query: SearchAdminFilterDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
  //   return await this.userFilterHelper.handleProcessUser(query, req, res);
  // }

  @Post("forgot-password")
  @ApiOperation({ summary: "Forgot password - will send email" })
  async handleForgotPassword(
    @Body() dataForgot: CreateForgotPassword,
    @Req() req: ExpressRequestDto,
    @Res() res: Response
  ) {
    return await this.userLoginHelper.handleForgotPassword(dataForgot, res, req);
  }

  // @Get("process-face")
  // async handleProcessFace(@Query() query: SearchAdminFilterDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
  //   return await this.userFilterHelper.handleProcessFace(query, req, res);
  // }

  @Get("list/user-mood")
  @ApiOperation({ summary: "Get list mood of user" })
  async getUserMoodList(@Query() query: SearchUserMoodDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return await this.userFilterHelper.getUserMoodList(query, req, res);
  }
  @Get("list/user-question")
  @ApiOperation({ summary: "Get list question of user" })
  async getUserQuestionList(@Query() query: SearchUserMoodDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return await this.userFilterHelper.getUserQuestionList(query, req, res);
  }
  @Get("detail/:id")
  @ApiOperation({ summary: "Get detail of user" })
  async getUserDetail(@Param("id") id: string, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return await this.userFilterHelper.handleGetUserDetail(id, req, res);
  }

  @Get("user-question/:id")
  @ApiOperation({ summary: "Get user question by ID" })
  async getUserQuestionDetail(@Param("id") id: string, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return await this.userFilterHelper.getUserQuestionDetail(id, req, res);
  }

  @Get("logout")
  @ApiOperation({ summary: "Logout user" })
  async handleLogout(@Req() req: ExpressRequestDto, @Res() res: Response) {
    return this.userLoginHelper.handleLogout(res, req);
  }

  @Get("session")
  @ApiOperation({ summary: "Get session user" })
  async handleGetSession(@Req() req: ExpressRequestDto, @Res() res: Response) {
    return this.userLoginHelper.handleGetSession(res, req);
  }

  @Get("update-follow")
  async handleUpdateFollow(@Req() req: ExpressRequestDto, @Res() res: Response) {
    return this.updateUserHelper.handleUpdateFollow(res, req);
  }

  @Patch("update-session")
  async handleUpdateSession(@Body() dataUpdate: UpdateSessionDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return this.userLoginHelper.handleUpdateSession(dataUpdate, res, req);
  }

  @Get("get-password/:id/:password")
  async handleGetPassword(
    @Param("id") id: string,
    @Param("password") password: string,
    @Req() req: ExpressRequestDto,
    @Res() res: Response
  ) {
    return this.userLoginHelper.handleGetPassword(id, password, res, req);
  }

  @Patch("update/user")
  update(@Body() updateUserDto: UpdateUserDto, @Res() res: Response, @Req() req: Request) {
    return this.updateUserHelper.processUserUpdate(updateUserDto, req, res);
  }

  @Patch("update/remove-travel-city")
  updateTravelCity(@Res() res: Response, @Req() req: Request) {
    return this.updateUserHelper.updateTravelCity(req, res);
  }

  @Patch("update/user-active")
  updateUserActive(@Body() updateUserDto: UpdateUserActiveDto, @Res() res: Response, @Req() req: Request) {
    return this.updateUserHelper.processUpdateUserActive(updateUserDto, req, res);
  }

  @Patch("update/map-count")
  updateMapCount(@Res() res: Response, @Req() req: Request) {
    return this.updateUserHelper.processUserUpdateMapCount(req, res);
  }

  @Patch("update/user-option")
  updateUserOption(@Body() updateUserDto: UpdateUserOptionDto, @Res() res: Response, @Req() req: Request) {
    return this.updateUserHelper.processUpdateUserOption(updateUserDto, req, res);
  }

  @Post("request/user-location")
  handleRequestLocation(@Body() requestData: RequestDataDto, @Res() res: Response, @Req() req: Request) {
    return this.updateUserHelper.handleRequestLocation(requestData, req, res);
  }

  @Post("create/user-question")
  createUserQuestion(@Body() dataCreate: CreateUserQuestionDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.updateUserHelper.processCreateUserQuestion(dataCreate, res, req);
  }

  @Post("create/user-location")
  createUserLocation(@Body() dataCreate: CreateUserLocationDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.updateUserHelper.processCreateUserLocation(dataCreate, res, req);
  }

  @Post("anonymous/user-anonymous")
  createUserAnonymous(@Body() dataCreate: CreateUserAnonymousDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return this.updateUserHelper.processCreateUserAnonymous(dataCreate, res, req);
  }

  @Patch("update/user-question")
  updateUserQuestion(
    @Body() updateUserDto: UpdateUserQuestionDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return this.updateUserHelper.processUpdateUserQuestion(updateUserDto, res, req);
  }

  @Delete("delete-question/:id")
  removeQuestion(@Param("id") id: string, @Res() res: Response, @Req() req: Request) {
    return this.updateUserHelper.removeUserQuestion(id, res, req);
  }

  @Delete("delete/:id")
  remove(@Param("id") id: string, @Res() res: Response, @Req() req: Request) {
    return this.updateUserHelper.processDeleteUser(id, req, res);
  }

  @Get("list/base")
  async searchBaseUser(@Query() query: SearchBaseUserDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return await this.userFilterHelper.searchBaseUser(query, req, res);
  }

  @Get("block-list")
  async getBlockList(@Query() query: SearchBlockListDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return await this.userFilterHelper.searchBlockList(query, req, res);
  }

  @Post("view")
  handleViewUser(@Body() dataView: CreateUserViewDto, @Res() res: Response, @Req() req: Request) {
    return this.updateUserHelper.processViewUser(dataView, req, res);
  }

  @Post("follow")
  handleFollowUser(@Body() dataFollow: CreateUserFollowDto, @Res() res: Response, @Req() req: Request) {
    return this.updateUserHelper.processFollowUser(dataFollow, req, res);
  }

  @Post("un-follow")
  handleUnFollowUser(@Body() dataFollow: CreateUserFollowDto, @Res() res: Response, @Req() req: Request) {
    return this.updateUserHelper.processUnFollowUser(dataFollow, req, res);
  }

  @Post("disagree")
  handleDisagreeUser(@Body() dataFollow: CreateUserFollowDto, @Res() res: Response, @Req() req: Request) {
    return this.updateUserHelper.processDisagreeUser(dataFollow, req, res);
  }

  @Post("un-disagree")
  handleUnDisagreeUser(@Body() dataFollow: CreateUserFollowDto, @Res() res: Response, @Req() req: Request) {
    return this.updateUserHelper.processUnDisagreeUser(dataFollow, req, res);
  }

  @Post("block")
  handleBlockUser(@Body() dataBlock: CreateUserBlockDto, @Res() res: Response, @Req() req: Request) {
    return this.updateUserHelper.processBlockUser(dataBlock, req, res);
  }

  @Post("un-block")
  handleUnBlockUser(@Body() dataBlock: CreateUserBlockDto, @Res() res: Response, @Req() req: Request) {
    return this.updateUserHelper.processUnBlockUser(dataBlock, req, res);
  }

  @Get("follow-count")
  async handleGetFollowCount(
    @Query() dataQuery: SearchFollowCountDto,
    @Req() req: ExpressRequestDto,
    @Res() res: Response
  ) {
    return await this.userFilterHelper.getFollowCount(dataQuery, req, res);
  }

  @Delete("user-interest/:id")
  async removeHandle(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.updateUserHelper.removeUserInterest(id, res, req);
  }

  @Get("user-interest/list")
  async handleGetUserInterestList(
    @Query() query: SearchUserInterestDto,
    @Req() req: ExpressRequestDto,
    @Res() res: Response
  ) {
    return await this.updateUserHelper.getListUserInterestByAdmin(query, res, req);
  }

  @Post("user-interest/create")
  async createNewUserInterest(
    @Body() bodyCreate: CreateUserInterestDto,
    @Req() req: ExpressRequestDto,
    @Res() res: Response
  ) {
    return await this.updateUserHelper.createUserInterest(bodyCreate, res, req);
  }

  @Get("user-interest/:id")
  async getUserInterestDetail(@Param("id") id: string, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return await this.updateUserHelper.handleGetUserInterestByUserId(id, req, res);
  }

  @Patch("user-interest/update")
  async updateUserInterest(
    @Body() bodyUpdate: UpdateUserInterestDto,
    @Req() req: ExpressRequestDto,
    @Res() res: Response
  ) {
    return await this.updateUserHelper.updateUserInterestByAdmin(bodyUpdate, res, req);
  }
}
