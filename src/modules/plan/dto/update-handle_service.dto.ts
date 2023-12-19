import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { CreateHandleServiceDto } from "./create-handle_service.dto";

export class UpdateHandleServiceDto extends PartialType(CreateHandleServiceDto) {
  @IsString()
  @ApiProperty()
  _id?: string;
}
