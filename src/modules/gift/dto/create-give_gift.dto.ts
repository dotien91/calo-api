import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsDateString, IsString, IsNumberString, IsNumber } from "class-validator";
export class CreateGiveGiftDto {
  @IsString()
  @ApiProperty()
  gift_id: string;

  @IsString()
  @ApiProperty()
  partner_id: string;

  @IsNumberString()
  @ApiProperty()
  quantity: number;
}
