import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, Req } from '@nestjs/common';
import { UserPermissionHelper } from '../helper/update_user_permission.helper';
import { Response } from 'express';
import { ExpressRequestDto } from '../../../dto/express-request.dto';
import { CreateUserPermissionDto } from '../dto/create-user_permission.dto';
import { ListUserPermissionDto } from '../dto/list-user_permission.dto';

@Controller('user-permission')
export class UserPermissionController {
  constructor(
    private readonly userPermissionHelper: UserPermissionHelper,
  ) { }

  @Get('/user/:id')
  async getUserPermission(@Query() query: ListUserPermissionDto, @Param('id') id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.userPermissionHelper.getUserPermission(query, id, res, req);
  }

  @Post('/create/:id')
  async createNewUserPermission(@Param('id') id: string, @Body() createPermissionBody: CreateUserPermissionDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.userPermissionHelper.createUserPermission(id, createPermissionBody, res, req);
  }

  @Get('/get/list')
  async getAllUserPermission(@Query() query: ListUserPermissionDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.userPermissionHelper.getAllUserPermission(query, res, req);
  }

  @Delete('delete/:id')
  async removePermission(@Param('id') id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.userPermissionHelper.removePermission(id, res, req);
  }
}
