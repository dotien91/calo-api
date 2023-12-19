import { IsIn, IsNumberString, IsOptional, IsString } from "class-validator";

export class ListSubscribeDto {
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
  user_id?: string;

  @IsString()
  @IsOptional(null)
  service_id?: string;

  @IsString()
  @IsOptional(null)
  service_name?: string;
}
