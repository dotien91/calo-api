import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  Response,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response as ExpressResponse } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateChatRoomDto } from "../dto/create-chat_room.dto";
import { DeleteChatRoomUserRoleDto } from "../dto/delete-chat_room_user_role.dto";
import { FindChatRoomDto, GetChatRoomListDto } from "../dto/get-chat_room_list.dto";
import { GetSameGroupDto } from "../dto/get-same_group.dto";
import { UpdateChatRoomUserDto } from "../dto/update-chat_room_user.dto";
import { UpdateChatRoomUserRoleDto } from "../dto/update-chat_room_user_role.dto";
import { ChatRoomHelper } from "../helpers/chat_room.helper";
import { ChatRoomService } from "../services/chat_room.service";
import { ChatRoomUserOptionService } from "../services/chat_room_user_option.service";

@Controller("chat-room")
@ApiTags("chat")
@ApiBearerAuth("ICEO")
export class ChatRoomController {
  /**
   * @author Tony Vu
   * @param chatRoomUserOptionService
   * @param appUserService
   * @param chatRoomHelper
   */
  constructor(
    private readonly chatRoomUserOptionService: ChatRoomUserOptionService,
    private readonly chatRoomHelper: ChatRoomHelper,
    private readonly chatRoomService: ChatRoomService
  ) {}

  private readonly logger = new Logger("chat_room_controller");

  @Post("/create")
  async create(
    @Req() req: ExpressRequestDto,
    @Body() createChatRoomDto: CreateChatRoomDto,
    @Response() res: ExpressResponse
  ) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }
      if (createChatRoomDto.partner_id === userObject?._id.toString()) {
        throw new BadRequestException("Can't create new Room!");
      }
      if (createChatRoomDto.partner_id) {
        const dataCreateReturn = await this.chatRoomHelper.handleCreateRoom(
          userObject,
          createChatRoomDto.partner_id,
          createChatRoomDto.chat_type,
          createChatRoomDto?.room_name,
          false,
          req
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
      const userObject = req?.user_object;
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
      const userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }
      return this.chatRoomHelper.handleGetCountReply(query, userObject, res);
    } catch (error) {
      this.logger.log("getList Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  @Get("/find")
  async findChatRoom(@Req() req: ExpressRequestDto, @Query() query: FindChatRoomDto, @Res() res: ExpressResponse) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }
      return this.chatRoomHelper.findChatRoom(query, req, res);
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
      const ids = id.split(",");
      return this.chatRoomHelper.handleJoinGroup(ids, res, req);
    } catch (error) {
      this.logger.log("View Room Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Req() req: ExpressRequestDto, @Res() res: ExpressResponse) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }
      const dataFilter = {
        user_id: userObject._id.toString(),
        chat_room_id: id,
      };
      //Check User Permission in Room
      let dataRoomReturn: any = await this.chatRoomUserOptionService.findOne(dataFilter);
      if (!dataRoomReturn) {
        const dataRoom = await this.chatRoomService.findOneRoom({ _id: id });
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
      const userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }

      const page = query?.page ? query?.page : 1;

      const limit = query?.limit || 20;
      let orderBy = <"ASC" | "DESC">"DESC";
      if (query?.order_by) {
        orderBy = query?.order_by;
      }
      const dataFilter = {
        chat_room_id: id,
      };
      const dataOrder = {
        createdAt: orderBy,
      };

      //Check User In Room
      const dataUserRoomFilter = {
        chat_room_id: id,
        user_id: userObject._id.toString(),
      };
      const dataChatUserOption = await this.chatRoomUserOptionService.findOne(dataUserRoomFilter);
      if (!dataChatUserOption) {
        throw new BadRequestException("You not in Room!");
      }
      //Check User Permission in Room
      const dataMember = await this.chatRoomUserOptionService.filterMember(dataFilter, dataOrder, page, limit);

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
