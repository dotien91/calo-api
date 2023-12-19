import {
  Controller,
  Get,
  Post,
  Logger,
  HttpStatus,
  Body,
  Param,
  Patch,
  Query,
  Res,
  Req,
  BadRequestException,
  NotAcceptableException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { ChatMediaService } from "../services/chat_media.service";
import { CreateChatMediaPresignDto } from "../dto/create-chat_media_presign.dto";
import { GetChatMediaRoomDto } from "../dto/get-chat_media_room.dto";
import { Response } from "express";
import { ChatRoomUserOptionService } from "../../../modules/chat_room/services/chat_room_user_option.service";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UpdateChatMediaDto } from "../dto/update-chat_media.dto";

@Controller("chat-media")
export class ChatMediaController {
  constructor(
    private readonly chatMediaService: ChatMediaService,
    private readonly chatRoomUserOptionService: ChatRoomUserOptionService,
    private readonly userPermissionService: UserPermissionService
  ) {}

  private readonly logger = new Logger("chat_media_controller");
  @Post("/create")
  async create(@Body() createChatMediaDto: CreateChatMediaPresignDto, @Req() req) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const mediaTypeAllowed = ["video", "image", "file", "audio", "link", "account", "gif"];
      if (mediaTypeAllowed.indexOf(createChatMediaDto.media_type) === -1) {
        throw new NotAcceptableException("Data input not valid!");
      }

      const fileNameObject = createChatMediaDto?.media_file_name.split(".");
      let fileExtensions = fileNameObject.pop();
      let fileNameOriginal = fileNameObject.join(".");

      const fileType = createChatMediaDto.media_mime_type;

      if (fileType === "video/mp4") {
        fileNameOriginal = fileNameOriginal + fileExtensions;
        fileExtensions = "mp4";
      }
      let mediaMeta = [];
      try {
        if (createChatMediaDto.media_meta) {
          mediaMeta = JSON.parse(createChatMediaDto.media_meta);
        }
      } catch (error) {
        mediaMeta = [];
      }

      let dataToCreate = {
        media_url: createChatMediaDto.media_url,
        createBy: userObject._id.toString(),
        media_type: createChatMediaDto.media_type,
        media_square: createChatMediaDto?.media_square,
        media_mime_type: createChatMediaDto.media_mime_type,
        media_file_name: createChatMediaDto.media_file_name,
        media_thumbnail: createChatMediaDto.media_thumbnail,
        media_meta: mediaMeta,
        media_content: createChatMediaDto?.media_content,
        chat_room_id: createChatMediaDto.chat_room_id ? createChatMediaDto.chat_room_id : null,
        chat_history_id: createChatMediaDto.chat_history_id ? createChatMediaDto.chat_history_id : null,
        media_status: 0,
      };
      if (createChatMediaDto.media_type === "account") {
        //Check
        const dataFilter = {
          media_file_name: createChatMediaDto.media_file_name,
        };
        const dataMedia = await this.chatMediaService.findOne(dataFilter);
        if (dataMedia) {
          dataToCreate = { ...dataToCreate, ...{ _id: dataMedia?._id } };
          return await this.chatMediaService.update(dataToCreate);
        } else {
          return await this.chatMediaService.create(dataToCreate);
        }
      }
      return await this.chatMediaService.create(dataToCreate);
    } catch (error) {
      this.logger.log("create Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  @Patch("/update")
  async updateMedia(@Body() createChatMediaDto: UpdateChatMediaDto, @Req() req) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      return await this.chatMediaService.update(createChatMediaDto);
    } catch (error) {
      this.logger.log("create Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  @Get("/room/:id")
  async findAll(
    @Req() req: ExpressRequestDto,
    @Query() query: GetChatMediaRoomDto,
    @Res() res: Response,
    @Param("id") id: string
  ) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const dataUserOptionFilter = {
        chat_room_id: id,
        user_id: userObject._id.toString(),
      };

      const dataPermission = await this.chatRoomUserOptionService.findOne(dataUserOptionFilter);
      if (!dataPermission) {
        throw new ForbiddenException("User role not exist in this Room!");
      }

      const page = Number(query?.page) || 1;
      const limit = query?.limit || 150;

      const mediaStatus = query?.media_status ? query?.media_status : "";
      const mediaType = query?.media_type ? query?.media_type : "";
      const orderBy = <"DESC" | "ASC">query?.order_by ? query.order_by : "DESC";
      const dataFilter = {
        chat_room_id: id.toString(),
        media_type: mediaType,
        media_status: Number(mediaStatus),
      };
      const dataOrder = {
        createdAt: orderBy,
      };

      const dataMedia = await this.chatMediaService.filter(dataFilter, dataOrder, page, limit);
      const countMedia = await this.chatMediaService.count(dataFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": countMedia })
        .status(HttpStatus.OK)
        .json(dataMedia);
    } catch (error) {
      this.logger.log("findAll Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  @Get("/list/admin")
  async findAllByAdmin(
    @Req() req: ExpressRequestDto,
    @Query() query: GetChatMediaRoomDto,
    @Res() res: Response,
    @Param("id") id: string
  ) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      if (await this.userPermissionService.isHavePermission(userObject._id.toString(), "chat_media/list")) {
        const page = Number(query?.page) || 1;
        const limit = query?.limit || 150;

        const orderBy = <"DESC" | "ASC">query?.order_by ? query.order_by : "DESC";

        const dataUserOptionFilter = query;
        delete dataUserOptionFilter.page;
        delete dataUserOptionFilter.limit;
        delete dataUserOptionFilter.order_by;

        const dataOrder = {
          createdAt: orderBy,
        };
        const dataMedia = await this.chatMediaService.filter(dataUserOptionFilter, dataOrder, page, limit);
        res.status(HttpStatus.OK).json(dataMedia);
      } else {
        throw new ForbiddenException("Not have permission !");
      }
    } catch (error) {
      this.logger.log("findAll Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  @Get("/list/user")
  async findByUserId(@Req() req: ExpressRequestDto, @Query() query: GetChatMediaRoomDto, @Res() res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const page = Number(query?.page) || 1;
      const limit = query?.limit || 150;

      const orderBy = <"DESC" | "ASC">query?.order_by ? query.order_by : "DESC";

      let dataUserOptionFilter = query;
      delete dataUserOptionFilter.page;
      delete dataUserOptionFilter.limit;
      delete dataUserOptionFilter.order_by;

      const dataOrder = {
        createdAt: orderBy,
      };
      dataUserOptionFilter = {
        ...dataUserOptionFilter,
        ...{
          createBy: userObject?._id?.toString(),
        },
      };
      const dataMedia = await this.chatMediaService.filter(dataUserOptionFilter, dataOrder, page, limit);
      res.status(HttpStatus.OK).json(dataMedia);
    } catch (error) {
      this.logger.log("findAll Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  @Get("detail-media/:id")
  async handleGetDetailMedia(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    try {
      //Check Permission
      const dataReturn = await this.chatMediaService.findById(id);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
