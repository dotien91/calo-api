import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";

export class UpdateOrderUserDto {
  @IsString()
  @ApiProperty()
  _id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  order_note?: string;

  @IsIn(["pending", "processing"])
  @ApiProperty()
  status?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  media_id?: string;
}
