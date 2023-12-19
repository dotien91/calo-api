import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { CreatePlanDto } from "./create-plan.dto";
import { IsOptional, IsString } from "class-validator";

export class UpdatePlanDto extends PartialType(CreatePlanDto) {
  @IsString()
  @ApiProperty()
  _id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  channel_id?: string;
}
