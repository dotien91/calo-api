import {IsString, IsOptional, IsNumberString, IsNumber, IsIn} from "class-validator";

export class SearchUserFollowEventDto {
  @IsNumberString()
  @IsOptional(null)
  page?: number

  @IsNumberString()
  @IsOptional(null)
  limit?: number

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  order_by?: "DESC"|"ASC"
}
