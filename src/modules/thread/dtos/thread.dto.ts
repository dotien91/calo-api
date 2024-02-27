import {
  IsArray,
  IsDateString,
  IsDefined,
  IsEnum,
  IsIn,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator";
import { ThreadType } from "../interfaces/thread.interface.i";

export interface FilterThreadDTO {
  class_id?: string;
  user_id?: string;
  thread_type?: string;
  search?: string;
}

export class ListThreadDto {
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
  class_id?: string;

  @IsString()
  @IsOptional()
  user_id?: string;

  @IsEnum(ThreadType)
  @IsOptional()
  thread_type?: ThreadType;

  @IsString()
  @IsOptional()
  search?: string;
}

export class CreateThreadDTO {
  @IsString()
  @IsDefined()
  class_id: string;

  @IsString()
  @IsDefined()
  thread_title: string;

  @IsString()
  @IsDefined()
  thread_content: string;

  @IsEnum(ThreadType)
  @IsDefined()
  thread_type: ThreadType;

  @IsNumber()
  @IsOptional()
  max_mark?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attach_files?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assigned_user_ids?: string[];

  @IsDateString()
  @IsOptional()
  expired?: string;
}

export class UpdateThreadDTO {
  @IsString()
  @IsDefined()
  _id: string;

  @IsString()
  @IsOptional()
  class_id?: string;

  @IsString()
  @IsOptional()
  thread_title?: string;

  @IsString()
  @IsOptional()
  thread_content?: string;

  @IsEnum(ThreadType)
  @IsOptional()
  thread_type?: ThreadType;

  @IsNumber()
  @IsOptional()
  max_mark?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attach_files?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assigned_user_ids?: string[];

  @IsDateString()
  @IsOptional()
  expired?: string;
}

