import { IsDefined, IsIn, IsNumberString, IsOptional, IsString } from "class-validator";

export interface FilterRedeemUserDTO {
  user_id?: string;
  redeem_id?: string;
}

export class ListRedeemUserDto {
  @IsNumberString()
  @IsOptional()
  page?: number;

  @IsNumberString()
  @IsOptional()
  limit?: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional()
  order_by?: "DESC" | "ASC";

  @IsString()
  @IsOptional()
  user_id?: string;

  @IsString()
  @IsOptional()
  redeem_id?: string;
}

export class CreateRedeemUserDTO {
  @IsString()
  @IsDefined()
  user_id: string;

  @IsString()
  @IsDefined()
  redeem_id: string;
}

export class UpdateRedeemUserDTO {
  @IsString()
  @IsDefined()
  _id: string;

  @IsString()
  @IsOptional()
  user_id?: string;

  @IsString()
  @IsOptional()
  redeem_id?: string;
}
