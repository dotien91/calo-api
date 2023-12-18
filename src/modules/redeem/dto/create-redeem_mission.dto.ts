import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsNumberString, IsJSON } from "class-validator";
export class CreateRedeemMissionDto {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  channel_id: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  number_of_day: number;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  mission_action: string | any[];

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  gift_data: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  gift_coin: number;
}
