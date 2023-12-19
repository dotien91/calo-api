import { PartialType } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { CreateReportDto } from "./create-report.dto";

export class UpdateReportDto extends PartialType(CreateReportDto) {
  @IsString()
  @IsOptional(null)
  _id?: string;
}
