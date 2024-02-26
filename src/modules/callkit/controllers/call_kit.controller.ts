import { Body, Controller, Get, Patch, Post, Query, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { GetCallkitDto } from "../dto/get-callkit.dto";
import { PostMakeRoomDto } from "../dto/post.make_room.dto";
import { SendVoipDto } from "../dto/send-voip.dto";
import { UpdateCallkitDto } from "../dto/update-callkit.dto";
import { CallKitHelper } from "../helper/call_kit.helper";

@Controller("callkit")
export class CallKitController {
  constructor(private readonly callKitHelper: CallKitHelper) {}

  @Post("make-call")
  async handleMakeCall(@Body() query: PostMakeRoomDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
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
  async endCall(@Body() query: PostMakeRoomDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return this.callKitHelper.handleEndCall({ ...query, ...{ version: "2" } }, req, res);
  }

  @Post("send-voip")
  async handleSendVoIP(@Body() dataSendVoip: SendVoipDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    return this.callKitHelper.handleSendVoIP(dataSendVoip, req, res);
  }
}
