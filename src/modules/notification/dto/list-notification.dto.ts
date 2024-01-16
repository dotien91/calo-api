import { IsIn, IsNumberString, IsOptional, IsString } from "class-validator";

export class ListNotificationDto {
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
  read_status: string;

  @IsString()
  @IsOptional(null)
  user_id: string;
}
