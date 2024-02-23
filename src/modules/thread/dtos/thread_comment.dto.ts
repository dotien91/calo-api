import { IsArray, IsDefined, IsEnum, IsIn, IsNumber, IsNumberString, IsOptional, IsString } from "class-validator";
import { ThreadCommentType } from "../interfaces/thread.interface.i";

export interface FilterThreadCommentDTO {
  thread_id?: string;
  user_id?: string;
  content?: string;
  type?: ThreadCommentType;
}

export class ListThreadCommentDto {
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
  thread_id?: string;

  @IsString()
  @IsOptional()
  user_id?: string;

  @IsEnum(ThreadCommentType)
  @IsOptional()
  type?: ThreadCommentType;

  @IsString()
  @IsOptional()
  content?: string;
}

export class CreateThreadCommentDTO {
  @IsString()
  @IsDefined()
  thread_id: string;

  @IsString()
  @IsDefined()
  content: string;

  @IsEnum(ThreadCommentType)
  @IsDefined()
  type: ThreadCommentType;

  @IsString()
  @IsOptional()
  reply_to_user_id?: string;
}

export class UpdateThreadCommentDTO {
  @IsString()
  @IsDefined()
  _id: string;

  @IsString()
  @IsOptional()
  thread_id?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(ThreadCommentType)
  @IsOptional()
  type?: ThreadCommentType;
}

export class HandleGiveMarkDTO {
  @IsString()
  @IsDefined()
  thread_id: string;

  @IsNumber()
  @IsDefined()
  mark: number;

  @IsString()
  @IsDefined()
  user_id: string;
}

export class UploadCommentDTO {
  @IsString()
  @IsDefined()
  thread_id: string;

  @IsArray()
  @IsString({ each: true })
  @IsDefined()
  attach_files: string[];
}

