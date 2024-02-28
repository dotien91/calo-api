import { Type } from "class-transformer";
import {
  IsArray,
  IsDefined,
  IsEnum,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from "class-validator";
import { PayloadParams } from "../../order/dto/create-order.dto";
import { ProductType } from "../../product/interfaces/product.interface";

export class ProductItem {
  @IsString()
  @IsDefined()
  product_id: string;

  @IsEnum(ProductType)
  @IsDefined()
  product_type: ProductType;

  @IsPositive()
  @IsDefined()
  amount: number;

  @IsObject()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PayloadParams)
  payload?: PayloadParams;
}

export class CartHandleDTO {
  @IsArray()
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => ProductItem)
  items: ProductItem[];
}
