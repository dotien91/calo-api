import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class ListPaymentMethodDto {
  @IsString()
  @ApiProperty()
  service_id: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  channel_id: string;
}
