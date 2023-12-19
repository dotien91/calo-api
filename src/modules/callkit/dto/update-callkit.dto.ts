import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateCallkitDto {
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

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  is_mic?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  is_camera?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  camera_position?: string;

  _id?: string;
}
