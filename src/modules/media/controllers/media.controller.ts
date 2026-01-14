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
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateMediaPresignDto } from "../dto/create-media_presign.dto";
import { GetMediaRoomDto } from "../dto/get-media_room.dto";
import { UpdateMediaDto } from "../dto/update-media.dto";
import { CloudinaryService } from "../services/cloudinary.service";
import { MediaService } from "../services/media.service";

@Controller("media")
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

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
      
      // Nếu có public_id từ Cloudinary, tạo thêm các URL variants
      if (dataReturn && dataReturn.media_meta) {
        const publicIdMeta = Array.isArray(dataReturn.media_meta) 
          ? dataReturn.media_meta.find((meta: any) => meta.key === "public_id")
          : null;
        if (publicIdMeta && publicIdMeta.value) {
          const publicId = publicIdMeta.value;
          const thumbnailUrl = this.cloudinaryService.getThumbnailUrl(publicId, 200);
          const squareUrl = this.cloudinaryService.getSquareUrl(publicId, 400);
          
          const mediaData = (dataReturn as any).toObject ? (dataReturn as any).toObject() : dataReturn;
          
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json({
              ...mediaData,
              urls: {
                original: dataReturn.media_url,
                thumbnail: thumbnailUrl,
                square: squareUrl,
              },
            });
        }
      }
      
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get("image-url/:publicId")
  async getImageUrl(
    @Param("publicId") publicId: string,
    @Query("width") width?: string,
    @Query("height") height?: string,
    @Query("crop") crop?: string,
    @Query("gravity") gravity?: string,
    @Query("radius") radius?: string,
    @Query("format") format?: string,
  ) {
    try {
      const url = this.cloudinaryService.getImageUrl(publicId, {
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
        crop: crop as any,
        gravity: gravity as any,
        radius: radius === "max" ? "max" : radius ? parseInt(radius) : undefined,
        format: format as any,
      });

      return {
        success: true,
        url: url,
      };
    } catch (error) {
      this.logger.error("getImageUrl Error: " + error.message);
      throw new BadRequestException(error.message);
    }
  }

  @Post("/upload-food")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFood(@UploadedFile() file: Express.Multer.File, @Req() req) {
    try {
      const userObject = req?.user_object;
      // if (!userObject) {
      //   throw new ForbiddenException("User is invalid");
      // }

      if (!file) {
        throw new BadRequestException("Vui lòng cung cấp hình ảnh món ăn");
      }

      // 1. Upload lên thư mục riêng cho Food
      const uploadResult = await this.cloudinaryService.uploadFoodImage(file);

      // 2. Tạo các URL variants với dynamic transformations
      const thumbnailUrl = this.cloudinaryService.getThumbnailUrl(uploadResult.public_id, 200);
      const squareUrl = this.cloudinaryService.getSquareUrl(uploadResult.public_id, 400);

      // 3. Tạo record lưu trữ media theo chuẩn của Tony Vu
      const dataToCreate = {
        media_url: uploadResult.secure_url,
        media_thumbnail: thumbnailUrl,
        media_square: squareUrl,
        createBy: userObject?._id?.toString() || null,
        media_type: "image",
        media_mime_type: file.mimetype,
        media_file_name: file.originalname,
        media_status: 1, // Đã hoàn tất upload
        media_meta: [
          {
            key: "public_id",
            value: uploadResult.public_id,
          },
          {
            key: "source",
            value: "cloudinary",
          },
          {
            key: "usage",
            value: "calorie_scan",
          },
        ],
      };

      // 4. Lưu vào database
      const savedMedia = await this.mediaService.create(dataToCreate);

      // Trả về kết quả kèm URL để frontend có thể hiển thị ảnh ngay lập tức
      const mediaData = (savedMedia as any).toObject ? (savedMedia as any).toObject() : savedMedia;
      return {
        success: true,
        message: "Upload ảnh đồ ăn thành công",
        data: {
          ...mediaData,
          urls: {
            original: uploadResult.secure_url,
            thumbnail: thumbnailUrl,
            square: squareUrl,
          },
        },
      };
    } catch (error) {
      this.logger.error("uploadFood Error: " + error.message);
      throw new BadRequestException(error.message);
    }
  }
}
