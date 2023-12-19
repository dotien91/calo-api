import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsIn } from "class-validator";

export class UpdateOrderUserDto {
  @IsString()
  @ApiProperty()
  _id?: String;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  order_note?: String;

  @IsIn(["pending", "processing"])
  @ApiProperty()
  status?: String;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  media_id?: string;
}
