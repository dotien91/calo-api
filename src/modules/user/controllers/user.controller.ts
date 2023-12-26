import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { Request, Response } from "express";
import { Permission, Permissions } from "../../../decorators/auth.decorator";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { Controllers } from "../../../modules/index.i";
import { CreateChangePasswordDto } from "../dto/create-change-password.dto";
import { CreateForgotPasswordEmail, CreateForgotPasswordPhoneNumber } from "../dto/create-forgot-password.dto";
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
import { UpdateUserQuestionDto } from "../dto/update-user_question.dto";
import { ValidatePhoneDto } from "../dto/validate-phone.dto";
import { VerifyCodeDto } from "../dto/verify-code.dto";
import { UpdateUserHelper } from "../helper/update_user.helper";
import { UserFilterHelper } from "../helper/user_filter.helper";
import { UserLoginHelper } from "../helper/user_login.helper";

@Controller(Controllers.USER)
export class UserController {
  constructor(
    private readonly userLoginHelper: UserLoginHelper,
    private readonly updateUserHelper: UpdateUserHelper,
    private readonly userFilterHelper: UserFilterHelper
  ) {}

  /**
   * @description Login with Google
   * @author Tony Vu
   * @param loginData
   * @param res
   * @param req
   * @returns
   */
  @Post("login/google")
  loginWithGoogle(@Body() loginData: LoginUserDto, @Res() res: Response, @Req() req: Request) {
    return this.userLoginHelper.loginWithGoogle(loginData, res, req);
  }

  /**
   * @description Login with Apple
   * @author Tony Vu
   * @param loginData
   * @param res
   * @param req
   * @returns
   */
  @Post("login/apple")
  loginWithApple(@Body() loginData: LoginUserDto, @Res() res: Response, @Req() req: Request) {
    return this.userLoginHelper.loginWithApple(loginData, res, req);
  }

  /**
   * @description Login with Facebook
   * @param loginData
   * @param res
   * @param req
   * @returns
   */
  @Post("login/facebook")
  loginWithFacebook(@Body() loginData: LoginUserDto, @Res() res: Response, @Req() req: Request) {
    return this.userLoginHelper.loginWithFacebook(loginData, res, req);
  }

  /**
   * @description Login with Password
   * @param loginData
   * @param res
   * @param req
   * @returns
   */
  @Post("login/password")
  loginWithPassword(@Body() loginData: LoginUserPasswordDto, @Res() res: Response, @Req() req: Request) {
    return this.userLoginHelper.loginWithPassword(loginData, res, req);
  }

  /**
   * description Change Pasword
   * @param dataChangePassword
   * @param res
   * @param req
   * @returns
   */
  @Patch("create-password")
  handleChangePassword(@Body() dataChangePassword: CreateChangePasswordDto, @Res() res: Response, @Req() req: Request) {
    return this.userLoginHelper.handleChangePassword(dataChangePassword, res, req);
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

  @Post("forgot-password/email")
  @ApiOperation({ summary: "Forgot password - will send email" })
  async handleForgotPasswordEmail(
    @Body() dataForgot: CreateForgotPasswordEmail,
    @Req() req: ExpressRequestDto,
    @Res() res: Response
  ) {
    return await this.userLoginHelper.handleForgotPasswordEmail(dataForgot, res, req);
  }

  @Post("forgot-password/phone-number")
  @ApiOperation({ summary: "Forgot password - will send via phone" })
  async handleForgotPasswordPhoneNumber(
    @Body() dataForgot: CreateForgotPasswordPhoneNumber,
    @Req() req: ExpressRequestDto,
    @Res() res: Response
  ) {
    return await this.userLoginHelper.handleForgotPasswordPhoneNumber(dataForgot, res, req);
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
  @Permissions(Permission(Controllers.USER).UPDATE)
  update(@Body() updateUserDto: UpdateUserDto, @Res() res: Response, @Req() req: Request) {
    return this.updateUserHelper.processUserUpdate(updateUserDto, req, res);
  }

  @Patch("update/user-active")
  updateUserActive(@Body() updateUserDto: UpdateUserActiveDto, @Res() res: Response, @Req() req: Request) {
    return this.updateUserHelper.processUpdateUserActive(updateUserDto, req, res);
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
    Promise.all([
      this.updateUserHelper.processUnFollowUser({ partner_id: dataBlock.partner_id }, req, res),
      this.updateUserHelper.processBlockUser(dataBlock, req, res),
    ])
      .then((processedData) => {
        // processedData[0]: unfollow data
        // processedData[1]: block data
        return processedData[1];
      })
      .catch((e) => {
        return e;
      });
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

  @Post("verify-code")
  async handleVerifyCode(@Body() dataForgot: VerifyCodeDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return await this.userLoginHelper.handleVerifyCode(dataForgot, res, req);
  }
}
