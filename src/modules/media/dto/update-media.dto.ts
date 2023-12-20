import { PartialType } from "@nestjs/mapped-types";
import { IsString } from "class-validator";
import { CreateMediaPresignDto } from "./create-media_presign.dto";

export class UpdateMediaDto extends PartialType(CreateMediaPresignDto) {
  @IsString()
  _id: string;
}
