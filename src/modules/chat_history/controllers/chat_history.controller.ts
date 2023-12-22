import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { CreateChatHistoryWithMediaDto } from "../dto/create-chat_history_with_media.dto";

import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateChatRoomAdminDto } from "../../../modules/chat_room/dto/create-chat_room_admin.dto";
import { ChatRoomHelper } from "../../../modules/chat_room/helpers/chat_room.helper";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { ListChatHistoryDto } from "../dto/list-chat_history.dto";
import { ChatHistoryHelper } from "../helpers/chat_history.helper";

@Controller("chat-history")
export class ChatHistoryController {
  constructor(
    private readonly chatHistoryHelper: ChatHistoryHelper,
    private readonly userPermissionService: UserPermissionService,
    private readonly chatRoomHelper: ChatRoomHelper
  ) {}

  private readonly logger = new Logger("chat_history_controller");

  @Post("/create-media")
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "documents", maxCount: 10 },
      { name: "videos", maxCount: 10 },
      { name: "images", maxCount: 10 },
      { name: "voices", maxCount: 10 },
    ])
  )
  async createMedia(
    @Res() res: Response,
    @Req() req: ExpressRequestDto,
    @Body() createChatHistoryDto: any,
    @UploadedFiles() files: any
  ) {
    try {
      this.chatHistoryHelper.createMedia(res, req, createChatHistoryDto, files);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post("/create")
  async create(
    @Req() req: ExpressRequestDto,
    @Res() res: Response,
    @Body() createChatHistoryDto: CreateChatHistoryWithMediaDto
  ) {
    try {
      return this.chatHistoryHelper.createNewHistory(req, res, createChatHistoryDto, true, true);
    } catch (error) {
      this.logger.log("create Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  @Post("/chat-system")
  async createSystem(
    @Req() req: ExpressRequestDto,
    @Body() createChatRoomDto: CreateChatRoomAdminDto,
    @Res() res: Response
  ) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }
      if (createChatRoomDto.partner_id === userObject?._id.toString()) {
        throw new BadRequestException("Can't create new Room!");
      }
      if (await this.userPermissionService.isHavePermission(userObject?._id.toString(), "chat_history/create")) {
        let dataToReturnAll: any = [];
        if (createChatRoomDto.partner_id) {
          let dataPartner = createChatRoomDto.partner_id.split(",");
          for (let dataPartnerItem of dataPartner) {
            let dataCreateReturnRoom: any = await this.chatRoomHelper.handleCreateRoom(
              userObject,
              dataPartnerItem,
              "personal",
              "",
              true
            );

            if (!dataCreateReturnRoom) {
              continue;
            }

            let updatedAt = new Date(dataCreateReturnRoom?.updatedAt).getTime();
            let currentTime = new Date().getTime();

            let leftTime = currentTime - updatedAt;
            if (leftTime < 3600000 && Number(dataCreateReturnRoom?.chat_history_count) > 0) {
              console.log("Not return");
              continue;
            }

            let createChatHistoryDto = {
              chat_room_id: dataCreateReturnRoom.chat_room_id._id.toString(),
              chat_content: createChatRoomDto?.chat_content,
              media_data: createChatRoomDto?.media_data,
            };

            let dataReturnHistory: any = await this.chatHistoryHelper.createNewHistory(
              req,
              res,
              createChatHistoryDto,
              false,
              true
            );
            if (dataReturnHistory) {
              dataToReturnAll.push({ chat_history_id: dataReturnHistory?._id.toString(), status: "Done" });
            } else {
              dataToReturnAll.push({ chat_history_id: dataReturnHistory?._id.toString(), status: "False" });
            }
          }
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization" })
            .status(HttpStatus.OK)
            .json(dataToReturnAll);
        } else {
          throw new BadRequestException("Not have Data!");
        }
      } else {
        throw new BadRequestException("You not have Permission to this action!");
      }
    } catch (error) {
      this.logger.log("create Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  @Get("/room/:id")
  async findAll(
    @Req() req: ExpressRequestDto,
    @Query() query: ListChatHistoryDto,
    @Res() res: Response,
    @Param("id") id: string
  ) {
    try {
      return this.chatHistoryHelper.getRoomDetail(req, res, query, id);
    } catch (error) {
      this.logger.log("findAll Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }
}
