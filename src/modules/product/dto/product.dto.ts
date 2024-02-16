import { IsArray, IsDefined, IsEnum, IsNumberString, IsOptional, IsString } from "class-validator";
import { ProductLabel } from "../interfaces/product.interface";

export class CreateProductDTO {
  @IsString()
  @IsDefined()
  name: string;

  @IsNumberString()
  @IsDefined(null)
  price: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional(null)
  long_description?: string;

  @IsString()
  @IsOptional(null)
  media_id?: string;

  @IsArray()
  @IsEnum(ProductLabel, { each: true })
  @IsOptional()
  labels?: ProductLabel[];

  @IsString()
  @IsOptional()
  coupon_id?: string;
}

export class UpdateProductDTO {
  @IsString()
  @IsDefined()
  _id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional(null)
  long_description?: string;

  @IsString()
  @IsOptional(null)
  media_id?: string;

  @IsNumberString()
  @IsOptional(null)
  price?: string;

  @IsArray()
  @IsEnum(ProductLabel, { each: true })
  @IsOptional()
  labels?: ProductLabel[];

  @IsString()
  @IsOptional()
  coupon_id?: string;
}

export interface SearchProductParams {
  name?: string;
  shop_id?: string;
}

export class ListProductDTO {
  @IsNumberString()
  @IsOptional(null)
  page?: number;

  @IsNumberString()
  @IsOptional(null)
  limit?: number;

  // @IsIn(["DESC", "ASC"])
  // @IsOptional(null)
  // order_by?: "DESC" | "ASC";

  // @IsEnum(CourseSortBy)
  // @IsOptional(null)
  // sort_by?: ProductSortBy;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  shop_id?: string;
}

