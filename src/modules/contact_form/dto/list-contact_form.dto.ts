import { IsIn, IsNumberString, IsOptional, IsString } from "class-validator";

export class ListContactFormDto {
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
  form_status: string;

  @IsString()
  @IsOptional(null)
  user_id: string;

  @IsString()
  @IsOptional(null)
  partner_id: string;

  @IsString()
  @IsOptional(null)
  entity_id?: string;
}
