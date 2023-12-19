import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
  Query,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { CallKitHelper } from "../helper/call_kit.helper";
import { Response, Request } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { SearchMapDto } from "../dto/search.map.dto";
import { PostMakeRoomDto } from "../dto/post.make_room.dto";
import { SendVoipDto } from "../dto/send-voip.dto";
import { GetCallkitDto } from "../dto/get-callkit.dto";
import { UpdateCallkitDto } from "../dto/update-callkit.dto";

@Controller("callkit")
export class CallKitController {
  constructor(private readonly callKitHelper: CallKitHelper) {}
  @UsePipes(
    new ValidationPipe({
      forbidNonWhitelisted: false,
      whitelist: true,
    })
  )
  @Get("call")
  async handleCall(@Query() query: any, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return this.callKitHelper.handleCall(query, req, res);
  }
  @UsePipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      whitelist: true,
    })
  )
  @Post("call")
  async handleCallPost(@Query() query: any, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return this.callKitHelper.handleCall(query, req, res);
  }

  @Post("make-call")
  async handleMakeCall(@Query() query: PostMakeRoomDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return this.callKitHelper.handleMakeCall({ ...query, ...{ version: "1" } }, req, res);
  }

  @Post("make-call-v2")
  async handleMakeCallVersion2(@Body() query: PostMakeRoomDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return this.callKitHelper.handleMakeCall({ ...query, ...{ version: "2" } }, req, res);
  }

  @Patch("update-call")
  async handleUpdateCall(@Body() bodyUpdate: UpdateCallkitDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return this.callKitHelper.handleUpdateCall(bodyUpdate, req, res);
  }

  @Get("list")
  async handleGetListCall(@Query() query: GetCallkitDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return this.callKitHelper.getListCall(query, res, req);
  }

  @Post("end-call")
  async endCall(@Query() query: PostMakeRoomDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return this.callKitHelper.handleEndCall(query, req, res);
  }

  @Post("end-call-v2")
  async endCallVersion2(@Body() query: PostMakeRoomDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return this.callKitHelper.handleEndCall({ ...query, ...{ version: "2" } }, req, res);
  }
  @Post("send-voip")
  async handleSendVoIP(@Body() dataSendVoip: SendVoipDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return this.callKitHelper.handleSendVoIP(dataSendVoip, req, res);
  }
}
