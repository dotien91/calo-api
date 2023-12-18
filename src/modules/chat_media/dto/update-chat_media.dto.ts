import { PartialType } from "@nestjs/mapped-types";
import { IsString } from "class-validator";
import { CreateChatMediaDto } from "./create-chat_media.dto";
import { CreateChatMediaPresignDto } from "./create-chat_media_presign.dto";

export class UpdateChatMediaDto extends PartialType(CreateChatMediaPresignDto) {
  @IsString()
  _id: string;
}
