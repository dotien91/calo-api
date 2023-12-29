import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";

export class UpdateCallkitDto {
  @IsString()
  @ApiProperty()
  _id?: string;

  @IsString()
  @ApiProperty()
  room_id?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  offer_candidates?: any;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  answer_candidates?: any;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  offer?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  answer?: string;

  @IsBoolean()
  @IsOptional(null)
  @ApiProperty()
  is_mic?: boolean;

  @IsBoolean()
  @IsOptional(null)
  @ApiProperty()
  is_camera?: boolean;

  @IsString()
  @IsOptional(null)
  @IsEnum(["front", "back"])
  @ApiProperty()
  camera_position?: string;
}
