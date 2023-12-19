import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsNumberString } from "class-validator";
import { PartialType } from "@nestjs/mapped-types";
import { CreateRedeemPermissionDto } from "./create-redeem_permission.dto";

export class UpdateRedeemPermissionDto extends PartialType(CreateRedeemPermissionDto) {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  _id?: string;
}
