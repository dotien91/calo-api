import { Injectable, NestMiddleware, UnauthorizedException, HttpStatus, Module } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtHelperService } from '../modules/core/services/jwt_helper.service';

/**
 * @class AuthMiddleware
 * @author Tony Vu
 */
@Module({
  providers: [JwtHelperService]
})
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtHelper: JwtHelperService
  ) { }

  async use(req: any, res: Response, next: NextFunction) {
    let authObject = await this.jwtHelper.validateAuth(req, true);
    let channelId = await this.jwtHelper.validateChannel(req);
    req.channel_id = channelId;
    if (authObject.status) {
      req.user_id = authObject?.data?._id;
      req.user_object = authObject?.data?.user_object;
      req.auth_code = authObject?.auth_code;
      req.session_data = authObject?.data?.session_data;
      req.session_id = authObject?.session_id;
      next();
    } else {
      next();
    }
  }
}
