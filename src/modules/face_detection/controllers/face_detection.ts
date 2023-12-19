import { Controller, Get, Post, Res, Req, Query, Body } from "@nestjs/common";
import { FaceDetectionHelper } from "../helper/face_detection.helper";
import { Response, Request } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateFaceDetectionDto } from "../dto/create-face_detection.dto";

@Controller("face-detection")
export class CallKitController {
  constructor(private readonly faceDetectionHelper: FaceDetectionHelper) {}

  @Post("validate-avatar")
  async validateAvatar(
    @Body() createValidate: CreateFaceDetectionDto,
    @Req() req: ExpressRequestDto,
    @Res() res: Response
  ) {
    return this.faceDetectionHelper.handleValidateAvatar(createValidate, res, req);
  }

  @Get("total-today")
  async getTotalToday(@Req() req: ExpressRequestDto, @Res() res: Response) {
    return this.faceDetectionHelper.getTotalToday(res, req);
  }
}
