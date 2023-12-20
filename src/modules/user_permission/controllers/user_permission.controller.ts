import { Body, Controller, Delete, Get, Param, Post, Query, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { Permission, Permissions } from "../../../decorators/auth.decorator";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { Controllers } from "../../../modules/index.i";
import { CreateUserPermissionDto } from "../dto/create-user_permission.dto";
import { ListUserPermissionDto } from "../dto/list-user_permission.dto";
import { UserPermissionHelper } from "../helper/update_user_permission.helper";

@Controller(Controllers.USER_PERMISSION)
export class UserPermissionController {
  constructor(private readonly userPermissionHelper: UserPermissionHelper) {}

  @Get("/user/:id")
  @Permissions(Permission(Controllers.USER_PERMISSION).LIST)
  async getUserPermission(
    @Query() query: ListUserPermissionDto,
    @Param("id") id: string,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.userPermissionHelper.getUserPermission(query, id, res, req);
  }

  @Post("/create/:id")
  @Permissions(Permission(Controllers.USER_PERMISSION).CREATE)
  async createNewUserPermission(
    @Param("id") id: string,
    @Body() createPermissionBody: CreateUserPermissionDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.userPermissionHelper.createUserPermission(id, createPermissionBody, res, req);
  }

  @Get("/get/list")
  @Permissions(Permission(Controllers.USER_PERMISSION).LIST)
  async getAllUserPermission(
    @Query() query: ListUserPermissionDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.userPermissionHelper.getAllUserPermission(query, res, req);
  }

  @Delete("delete/:id")
  @Permissions(Permission(Controllers.USER_PERMISSION).DELETE)
  async removePermission(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.userPermissionHelper.removePermission(id, res, req);
  }
}
