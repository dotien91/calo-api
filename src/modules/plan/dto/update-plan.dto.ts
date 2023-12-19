import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { CreatePlanDto } from "./create-plan.dto";

export class UpdatePlanDto extends PartialType(CreatePlanDto) {
  @IsString()
  @ApiProperty()
  _id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  channel_id?: string;
}
