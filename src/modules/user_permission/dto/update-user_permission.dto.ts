import { PartialType } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { CreateUserPermissionDto } from "./create-user_permission.dto";

export class UpdateUserPermissionDto extends PartialType(CreateUserPermissionDto) {
  @IsString()
  @IsOptional(null)
  _id?: string;
}
