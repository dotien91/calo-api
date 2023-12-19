import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsDateString, IsString, IsNumberString, IsNumber } from "class-validator";
import { Gift } from "../schemas/gift.schema";
export class NotiGiveGiftDto {
  gift_id: Gift;

  partner_id: string;

  quantity: number;
}
