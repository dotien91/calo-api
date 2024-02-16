import { IsArray, IsDefined, IsIn, IsNumber, IsNumberString, IsOptional, IsString } from "class-validator";

export interface FilterShopDTO {
  name?: string;
  rating?: string;
}

export class ListShopDto {
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
  name?: string;

  @IsNumber()
  @IsOptional()
  rating?: number;
}

export class CreateShopDTO {
  @IsString()
  @IsDefined()
  name: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsArray()
  @IsOptional()
  coupon_ids?: string[];

  @IsArray()
  @IsOptional()
  banners?: string[];
}

export class UpdateShopDTO {
  @IsString()
  @IsDefined()
  _id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsArray()
  @IsOptional()
  coupon_ids?: string[];

  @IsArray()
  @IsOptional()
  banners?: string[];
}
