import { IsIn, IsNumberString, IsOptional, IsString } from "class-validator";

export class GetSameGroupDto {
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
  partner_id: string;
}
