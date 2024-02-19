import { IsDefined, IsIn, IsInt, IsNumberString, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateProductReviewDto {
  @IsString()
  @IsDefined()
  product_id: string;

  @IsString()
  @IsDefined()
  user_id: string;

  @IsString()
  @IsDefined()
  review: string;

  @IsInt()
  @IsDefined()
  @Min(0)
  @Max(5)
  rating: number;
}

export class UpdateProductReviewDto {
  @IsString()
  @IsDefined()
  _id: string;

  @IsString()
  @IsOptional()
  review?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(5)
  rating?: number;
}

export class FilterReviewProductDto {
  product_id?: string;
  rating?: number;
  user_id?: string;
}

export class ListProductReviewDto {
  @IsNumberString()
  @IsOptional(null)
  page?: number;

  @IsNumberString()
  @IsOptional(null)
  limit?: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  order_by?: "DESC" | "ASC";

  @IsString()
  @IsOptional(null)
  product_id?: string;

  @IsString()
  @IsOptional(null)
  user_id?: string;
}

