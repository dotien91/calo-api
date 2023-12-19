import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction, Response } from "express";

/**
 * @class AuthMiddleware
 * @author Tony Vu
 */
@Injectable()
export class RequireAuthMiddleware implements NestMiddleware {
  async use(req: any, res: Response, next: NextFunction) {
    const userObject = req?.user_object;
    if (!userObject) {
      throw new UnauthorizedException("Require Token!");
    } else {
      next();
    }
  }
}
