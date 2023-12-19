import { PartialType } from "@nestjs/swagger";
import { CreateUserPermissionDto } from "./create-user_permission.dto";
import { IsOptional, IsString } from "class-validator";

export class UpdateUserPermissionDto extends PartialType(CreateUserPermissionDto) {
  @IsString()
  @IsOptional(null)
  _id?: string;
}
