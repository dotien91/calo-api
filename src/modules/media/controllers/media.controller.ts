import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  Logger,
  NotAcceptableException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateMediaPresignDto } from "../dto/create-media_presign.dto";
import { GetMediaRoomDto } from "../dto/get-media_room.dto";
import { UpdateMediaDto } from "../dto/update-media.dto";
import { MediaService } from "../services/media.service";

@Controller("media")
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  private readonly logger = new Logger("media_controller");
  @Post("/create")
  async create(@Body() createMediaDto: CreateMediaPresignDto, @Req() req) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const mediaTypeAllowed = ["video", "image", "file", "audio", "link", "account", "gif"];
      if (mediaTypeAllowed.indexOf(createMediaDto.media_type) === -1) {
        throw new NotAcceptableException("Data input not valid!");
      }

      const fileNameObject = createMediaDto?.media_file_name.split(".");
      let fileExtensions = fileNameObject.pop();
      let fileNameOriginal = fileNameObject.join(".");

      const fileType = createMediaDto.media_mime_type;

      if (fileType === "video/mp4") {
        fileNameOriginal = fileNameOriginal + fileExtensions;
        fileExtensions = "mp4";
      }
      let mediaMeta = [];
      try {
        if (createMediaDto.media_meta) {
          mediaMeta = JSON.parse(createMediaDto.media_meta);
        }
      } catch (error) {
        mediaMeta = [];
      }

      let dataToCreate = {
        media_url: createMediaDto.media_url,
        createBy: userObject._id.toString(),
        media_type: createMediaDto.media_type,
        media_square: createMediaDto?.media_square,
        media_mime_type: createMediaDto.media_mime_type,
        media_file_name: createMediaDto.media_file_name,
        media_thumbnail: createMediaDto.media_thumbnail,
        media_meta: mediaMeta,
        media_content: createMediaDto?.media_content,
        chat_room_id: createMediaDto.chat_room_id ? createMediaDto.chat_room_id : null,
        chat_history_id: createMediaDto.chat_history_id ? createMediaDto.chat_history_id : null,
        media_status: 0,
      };
      if (createMediaDto.media_type === "account") {
        //Check
        const dataFilter = {
          media_file_name: createMediaDto.media_file_name,
        };
        const dataMedia = await this.mediaService.findOne(dataFilter);
        if (dataMedia) {
          dataToCreate = { ...dataToCreate, ...{ _id: dataMedia?._id } };
          return await this.mediaService.update(dataToCreate);
        } else {
          return await this.mediaService.create(dataToCreate);
        }
      }
      return await this.mediaService.create(dataToCreate);
    } catch (error) {
      this.logger.log("create Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  @Patch("/update")
  async updateMedia(@Body() createMediaDto: UpdateMediaDto, @Req() req) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      return await this.mediaService.update(createMediaDto);
    } catch (error) {
      this.logger.log("create Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  @Get("/room/:id")
  async findAll(
    @Req() req: ExpressRequestDto,
    @Query() query: GetMediaRoomDto,
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

      // const dataPermission = await this.chatRoomUserOptionService.findOne(dataUserOptionFilter);
      // if (!dataPermission) {
      //   throw new ForbiddenException("User role not exist in this Room!");
      // }

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

      const dataMedia = await this.mediaService.filter(dataFilter, dataOrder, page, limit);
      const countMedia = await this.mediaService.count(dataFilter);
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
    @Query() query: GetMediaRoomDto,
    @Res() res: Response,
    @Param("id") id: string
  ) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

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
      const dataMedia = await this.mediaService.filter(dataUserOptionFilter, dataOrder, page, limit);
      res.status(HttpStatus.OK).json(dataMedia);
    } catch (error) {
      this.logger.log("findAll Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  @Get("/list/user")
  async findByUserId(@Req() req: ExpressRequestDto, @Query() query: GetMediaRoomDto, @Res() res: Response) {
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
      const dataMedia = await this.mediaService.filter(dataUserOptionFilter, dataOrder, page, limit);
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
      const dataReturn = await this.mediaService.findById(id);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
