import { IsDate, IsNumberString, IsEmpty, IsIn, IsDefined, ValidateIf, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class ListOrderDto {
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
  plan_id: string;

  @IsString()
  @IsOptional(null)
  trans_id: string;

  @IsString()
  @IsOptional(null)
  service_id: string;

  @IsString()
  @IsOptional(null)
  payment_method: string;

  @IsString()
  @IsOptional(null)
  status: string;

  @IsString()
  @IsOptional(null)
  user_id: string;
}
