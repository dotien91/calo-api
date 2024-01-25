import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ListPaymentMethodDto {
  @IsString()
  @ApiProperty()
  service_id: string;
}
