import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";

export enum ReactType {
  LIKE = "like",
  LOVE = "love",
  CARE = "care",
  WOW = "wow",
  SAD = "sad",
  ANGRY = "angry",
  HAHA = "haha",
}

export class CreateLivestreamLikeDto {
  @IsString()
  @ApiProperty()
  livestream_id: string;

  @IsString()
  @IsEnum(ReactType)
  @ApiProperty()
  react_type: ReactType;
}

export class CreateLivestreamUnLikeDto {
  @IsString()
  @ApiProperty()
  livestream_id: string;
}
