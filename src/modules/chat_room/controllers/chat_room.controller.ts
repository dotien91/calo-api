import {
  Controller,
  Get,
  Post,
  Logger,
  Body,
  Patch,
  NotFoundException,
  Param,
  Delete,
  Req,
  Query,
  Res,
  HttpStatus,
  Response,
  BadRequestException,
} from "@nestjs/common";
import { ChatRoomUserOptionService } from "../services/chat_room_user_option.service";
import { CreateChatRoomDto } from "../dto/create-chat_room.dto";
import { GetChatRoomListDto } from "../dto/get-chat_room_list.dto";
import { ConfigService } from "@nestjs/config";
import { Response as ExpressResponse } from "express";
import { UserService } from "../../../modules/user/services/user.service";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { ChatRoomHelper } from "../helpers/chat_room.helper";
import { UpdateChatRoomUserRoleDto } from "../dto/update-chat_room_user_role.dto";
import { DeleteChatRoomUserRoleDto } from "../dto/delete-chat_room_user_role.dto";
import { UpdateChatRoomDto } from "../dto/update-chat_room.dto";
import { UpdateChatRoomUserDto } from "../dto/update-chat_room_user.dto";
import { GetSameGroupDto } from "../dto/get-same_group.dto";
import { ChatRoomService } from "../services/chat_room.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@Controller("chat-room")
@ApiTags('chat')
@ApiBearerAuth('ICEO')
export class ChatRoomController {
  /**
   * @author Tony Vu
   * @param chatRoomUserOptionService
   * @param appUserService
   * @param chatRoomHelper
   */
  constructor(
    private readonly chatRoomUserOptionService: ChatRoomUserOptionService,
    private readonly appUserService: UserService,
    private readonly chatRoomHelper: ChatRoomHelper,
    private readonly chatRoomService: ChatRoomService
  ) { }

  private readonly logger = new Logger("chat_room_controller");

  /**
   * @author Tony Vu
   * @param dataCreateRoom
   * @param res
   * @param dataKey
   * @returns
   */
  @Post("/server/:key")
  async updateByServer(
    @Body() dataCreateRoom: CreateChatRoomDto,
    @Response() res: ExpressResponse,
    @Param("key") dataKey: string
  ) {
    let hashPassword = new ConfigService().get<string>("HASH_PASSWORD_CHAT");
    if (dataKey === hashPassword) {
      try {
        let userObject = await this.appUserService.findOne({ _id: dataCreateRoom.user_id });
        if (!userObject) {
          throw new BadRequestException("User create Not exist!");
        }
        let dataCreateReturn = await this.chatRoomHelper.handleCreateRoom(
          userObject,
          dataCreateRoom.partner_id,
          dataCreateRoom.chat_type,
          dataCreateRoom?.room_name
        );
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization" })
          .status(HttpStatus.OK)
          .json(dataCreateReturn);
      } catch (error) {
        this.logger.log(error.message);
        this.logger.log("Data update is not Invalid!");
        throw new BadRequestException("Data update is not Invalid!");
      }
    } else {
      this.logger.log("Data update is not Invalid!");
      throw new NotFoundException("Data update is not Invalid!");
    }
  }

  @Post("/create")
  async create(
    @Req() req: ExpressRequestDto,
    @Body() createChatRoomDto: CreateChatRoomDto,
    @Response() res: ExpressResponse
  ) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }
      if (createChatRoomDto.partner_id === userObject?._id.toString()) {
        throw new BadRequestException("Can't create new Room!");
      }
      if (createChatRoomDto.partner_id) {
        let dataCreateReturn = await this.chatRoomHelper.handleCreateRoom(
          userObject,
          createChatRoomDto.partner_id,
          createChatRoomDto.chat_type,
          createChatRoomDto?.room_name,
          false,
          req,
          createChatRoomDto.is_payment
        );
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization" })
          .status(HttpStatus.OK)
          .json(dataCreateReturn);
      } else {
        throw new BadRequestException("Not have Data!");
      }
    } catch (error) {
      this.logger.log("create Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  @Get("/list")
  async findAll(@Req() req: ExpressRequestDto, @Query() query: GetChatRoomListDto, @Res() res: ExpressResponse) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }
      return this.chatRoomHelper.handleGetRoomByUser(query, userObject, res);
    } catch (error) {
      this.logger.log("getList Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  @Get("/count-reply")
  async countReply(@Req() req: ExpressRequestDto, @Query() query: GetChatRoomListDto, @Res() res: ExpressResponse) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }
      return this.chatRoomHelper.handleGetCountReply(query, userObject, res);
    } catch (error) {
      this.logger.log("getList Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  @Post("/view/:id")
  async viewRoom(@Param("id") id: string, @Req() req: ExpressRequestDto, @Res() res: ExpressResponse) {
    try {
      if (!id) {
        throw new BadRequestException("Room ID not exist!");
      }
      return this.chatRoomHelper.handleViewRoom(id, res, req);
    } catch (error) {
      this.logger.log("View Room Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  @Get("/same-group")
  async getSameGroup(@Req() req, @Res() res, @Query() query: GetSameGroupDto) {
    return this.chatRoomHelper.getSameGroup(req, res, query);
  }

  @Post("/join/:id")
  async joinGroup(@Param("id") id: string, @Req() req: ExpressRequestDto, @Res() res: ExpressResponse) {
    try {
      if (!id) {
        throw new BadRequestException("Room ID not exist!");
      }
      let ids = id.split(",");
      return this.chatRoomHelper.handleJoinGroup(ids, res, req);
    } catch (error) {
      this.logger.log("View Room Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Req() req: ExpressRequestDto, @Res() res: ExpressResponse) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }
      let dataFilter = {
        user_id: userObject._id.toString(),
        chat_room_id: id,
      };
      //Check User Permission in Room
      let dataRoomReturn: any = await this.chatRoomUserOptionService.findOne(dataFilter);
      if (!dataRoomReturn) {
        let dataRoom = await this.chatRoomService.findOneRoom({ _id: id });
        if (Number(dataRoom?.room_private) === 1) {
          throw new BadRequestException("User role have exist in this Room!");
        } else {
          dataRoomReturn = {
            ...{
              chat_room_id: dataRoom,
            },
            ...{
              user_role: "admin",
              user_permission: "read",
              room_title: "",
              room_type: "group",
              room_image: "",
              query_from: "",
              read_count: 0,
              call_count: 0,
              chat_history_count: 1,
              mute_status: 0,
              is_payment: 0,
              last_view: null,
              user_block: "",
            },
          };
        }
      }
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataRoomReturn);
    } catch (error) {
      this.logger.log("getById Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  @Delete("delete-room/:id")
  async removeRoom(@Param("id") id: string, @Res() res: ExpressResponse, @Req() req: ExpressRequestDto) {
    return await this.chatRoomHelper.removeRoom(id, res, req);
  }

  @Get("/member/:id")
  async findMemberByRoom(@Param("id") id: string, @Req() req, @Res() res, @Query() query: GetChatRoomListDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }

      let page = query?.page ? query?.page : 1;

      let limit = query?.limit || 20;
      let orderBy = <"ASC" | "DESC">"DESC";
      if (query?.order_by) {
        orderBy = query?.order_by;
      }
      let dataFilter = {
        chat_room_id: id,
      };
      let dataOrder = {
        createdAt: orderBy,
      };

      //Check User In Room
      let dataUserRoomFilter = {
        chat_room_id: id,
        user_id: userObject._id.toString(),
      };
      let dataChatUserOption = await this.chatRoomUserOptionService.findOne(dataUserRoomFilter);
      if (!dataChatUserOption) {
        throw new BadRequestException("You not in Room!");
      }
      //Check User Permission in Room
      let dataMember = await this.chatRoomUserOptionService.filterMember(dataFilter, dataOrder, page, limit);

      return res.status(HttpStatus.OK).json(dataMember);
    } catch (error) {
      this.logger.log("findMemberByRoom Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  @Post("/user-role")
  async addUserRole(@Res() res, @Req() req, @Body() updateChatRoomDto: UpdateChatRoomUserRoleDto) {
    return this.chatRoomHelper.addUserRole(res, req, updateChatRoomDto);
  }

  @Delete("/user-role")
  async removeUserRole(@Res() res, @Req() req, @Body() deleteChatRoomDto: DeleteChatRoomUserRoleDto) {
    return this.chatRoomHelper.removeUserRole(res, req, deleteChatRoomDto);
  }

  @Patch("/update-room")
  async updateRoom(@Req() req, @Res() res, @Body() updateChatRoomDto: UpdateChatRoomUserDto) {
    return this.chatRoomHelper.handleUpdateRoom(res, req, updateChatRoomDto);
  }

  @Patch("/update-room-option")
  async updateRoomOption(@Req() req, @Res() res, @Body() updateChatRoomDto: UpdateChatRoomUserDto) {
    return this.chatRoomHelper.handleUpdateRoomOption(res, req, updateChatRoomDto);
  }
}
