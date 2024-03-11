import { Type } from "class-transformer";
import {
  IsArray,
  IsDefined,
  IsEnum,
  IsIn,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { TestQuestionPart, TestQuestionType } from "../interfaces/test.interface.i";

export interface FilterTestQuestionDTO {
  type?: TestQuestionType;
  part?: TestQuestionPart;
  parent_id?: string;
}

export class ListTestQuestionDto {
  @IsNumberString()
  @IsOptional()
  page?: number;

  @IsNumberString()
  @IsOptional()
  limit?: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional()
  order_by?: "DESC" | "ASC";

  @IsEnum(TestQuestionType)
  @IsOptional()
  type?: TestQuestionType;

  @IsEnum(TestQuestionPart)
  @IsOptional()
  part?: TestQuestionPart;

  @IsString()
  @IsOptional()
  parent_id?: string;

  @IsString()
  @IsOptional()
  test_id?: string;
}

export class CreateTestQuestion {
  @IsString()
  @IsDefined()
  test_id: string;

  @IsString()
  @IsOptional()
  parent_id?: string;

  @IsString()
  @IsOptional()
  media_id?: string;

  @IsString()
  @IsDefined()
  title: string;

  @IsString()
  @IsOptional()
  question: string;

  // this is defined by frontend developer
  @IsString()
  @IsOptional()
  content?: string;

  // this is defined by frontend developer
  @IsEnum(TestQuestionType)
  @IsDefined()
  type: TestQuestionType;

  @IsEnum(TestQuestionPart)
  @IsDefined()
  part: TestQuestionPart;

  @IsNumber()
  @IsDefined()
  index: number;

  @IsString()
  @IsDefined()
  answer: string;
}

export class CreateTestQuestionDTO {
  @IsArray()
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => CreateTestQuestion)
  data: CreateTestQuestion;
}

export class UpdateTestQuestionDTO {
  @IsString()
  @IsDefined()
  _id: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  question?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(TestQuestionType)
  @IsOptional()
  type?: TestQuestionType;

  @IsEnum(TestQuestionPart)
  @IsOptional()
  part?: TestQuestionPart;

  @IsNumber()
  @IsOptional()
  index?: number;

  @IsString()
  @IsOptional()
  answer?: string;

  @IsString()
  @IsOptional()
  parent_id?: string;

  @IsString()
  @IsOptional()
  media_id?: string;

  @IsString()
  @IsOptional()
  test_id?: string;
}
