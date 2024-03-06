import { Type } from "class-transformer";
import {
  IsArray,
  IsDefined,
  IsIn,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export interface FilterTestUserDTO {
  user_id?: string;
  test_id?: string;
}

export class ListTestUserDto {
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
  test_id?: string;
}

export class UserAnswer {
  @IsNumber()
  @IsDefined()
  index: number;

  @IsString()
  @IsDefined()
  answer: string;

  // this property is private
  @IsString()
  @IsOptional()
  correct_answer: string | object;
}

export class CreateTestUserDTO {
  @IsString()
  @IsDefined()
  test_id: string;

  @IsArray()
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => UserAnswer)
  answers: UserAnswer[];

  @IsNumber()
  @IsDefined()
  finished_time: number;
}

export class UpdateTestUserDTO {
  @IsDefined()
  @IsString()
  _id: string;

  @IsString()
  @IsOptional()
  test_id?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UserAnswer)
  answers?: UserAnswer[];

  @IsNumber()
  @IsOptional()
  finished_time?: number;
}
