import { Controller, Get, Query, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { ListReferralDto } from "../dtos/referral.dto";
import { ReferralHelper } from "../helpers/referral.helper";

@Controller("referral")
export class ReferralController {
  constructor(private readonly referralHelper: ReferralHelper) {}

  // referral apis
  @Get("/me")
  async listUserReferredByMe(@Query() query: ListReferralDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.referralHelper.listUserReferredByMe(query, res, req);
  }

  @Get("/me/product")
  async listProductReferredByMe(@Query() query: ListReferralDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.referralHelper.listProductReferredByMe(query, res, req);
  }

  @Get("/user")
  async listUserReferralMe(@Query() query: ListReferralDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.referralHelper.listUserReferralMe(query, res, req);
  }
}
