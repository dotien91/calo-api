import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsObject, IsJSON } from "class-validator";
export class CreateRedeemPermissionDto {
  @IsString()
  @ApiProperty()
  redeem_id: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  user_id: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  redeem_mission_id?: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  channel_id?: string;

  start_time: Date;
  end_time: Date;
}
