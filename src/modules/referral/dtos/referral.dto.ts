import { IsIn, IsNumberString, IsOptional, IsString } from "class-validator";

export interface FilterReferralDTO {
  user_id?: string;
  from_user_id?: string;
  type?: string;
}

export class ListReferralDto {
  @IsNumberString()
  @IsOptional()
  page?: number;

  @IsNumberString()
  @IsOptional()
  limit?: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional()
  order_by?: "DESC" | "ASC";

  @IsIn(["time", "price"])
  @IsOptional()
  sort_by?: "time" | "price";

  @IsString()
  @IsOptional()
  user_id?: string;
}
