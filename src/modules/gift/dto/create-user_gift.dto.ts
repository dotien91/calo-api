import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsDateString, IsString, IsNumberString } from "class-validator";
export class CreateUserGiftDto {
  @IsString()
  @ApiProperty()
  gift_id: string;

  @IsString()
  @ApiProperty()
  user_id: String;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  quantity?: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  total_price?: number;
}
