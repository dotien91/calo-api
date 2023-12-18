import { IsDate, IsNumberString, IsEmpty, IsIn, IsDefined, ValidateIf, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ListPaymentMethodDto {
  @IsString()
  @ApiProperty()
  service_id: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  channel_id: string;
}
