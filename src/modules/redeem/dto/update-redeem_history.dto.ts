import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsNumberString } from "class-validator";
import { PartialType } from "@nestjs/mapped-types";
import { CreateRedeemHistoryDto } from "./create-redeem_history.dto";

export class UpdateRedeemHistoryDto extends PartialType(CreateRedeemHistoryDto) {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  _id?: string;
}
