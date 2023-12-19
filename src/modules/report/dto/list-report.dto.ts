import { IsIn, IsNumberString, IsOptional, IsString } from "class-validator";

export class ListReportDto {
  @IsNumberString()
  @IsOptional(null)
  page: number;

  @IsNumberString()
  @IsOptional(null)
  limit: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  order_by: "DESC" | "ASC";

  @IsString()
  @IsOptional(null)
  report_type: string;

  @IsString()
  @IsOptional(null)
  user_id: string;

  @IsString()
  @IsOptional(null)
  report_status: string;

  @IsString()
  @IsOptional(null)
  partner_id: string;
}
