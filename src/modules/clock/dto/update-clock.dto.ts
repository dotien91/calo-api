import { PartialType } from "@nestjs/mapped-types";
import { IsDateString, IsOptional, IsString } from "class-validator";
import { CreateClockDto } from "./create-clock.dto";

export class UpdateClockDto {
  @IsString()
  _id: string;

  @IsString()
  name?: string;

  @IsDateString()
  wake_time?: string;

  @IsString()
  @IsOptional(null)
  device_id?: string;

  @IsString()
  @IsOptional(null)
  clock_type?: string;

  @IsString()
  @IsOptional(null)
  status?: string;
}
