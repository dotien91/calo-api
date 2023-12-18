import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateRequestPollDto {
  @IsString()
  @ApiProperty()
  _id?: string;

  @IsString()
  @ApiProperty()
  user_id?: string;

  @IsString()
  @ApiProperty()
  request_id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  users_choose?: any;
}
