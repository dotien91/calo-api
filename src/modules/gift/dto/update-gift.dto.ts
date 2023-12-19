import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { CreateGiftDto } from "./create-gift.dto";
import { IsNumberString, IsOptional, IsString } from "class-validator";

export class UpdateGiftDto extends CreateGiftDto {
  @IsString()
  @ApiProperty()
  _id?: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  media_id: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  name: string;

  @IsNumberString()
  @ApiPropertyOptional()
  @IsOptional(null)
  price: string;
}
