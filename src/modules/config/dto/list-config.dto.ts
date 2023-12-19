import { IsBooleanString, IsIn, IsNumberString, IsOptional, IsString } from "class-validator";

export class ListConfigDto {
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
  type: string;

  @IsString()
  @IsOptional(null)
  package_name: string;

  @IsString()
  @IsOptional(null)
  search: string;

  @IsString()
  @IsOptional(null)
  version: string;

  @IsBooleanString()
  @IsOptional(null)
  is_count_ab: string;
}
