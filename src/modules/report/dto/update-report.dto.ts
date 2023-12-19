import { PartialType } from "@nestjs/swagger";
import { CreateReportDto } from "./create-report.dto";
import { IsOptional, IsString } from "class-validator";

export class UpdateReportDto extends PartialType(CreateReportDto) {
  @IsString()
  @IsOptional(null)
  _id?: string;
}
