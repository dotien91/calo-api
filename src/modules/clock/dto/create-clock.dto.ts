import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsJSON } from "class-validator";
export class CreateClockDto {
  @IsString()
  name: string;

  @IsString()
  device_id: string;

  @IsDateString()
  wake_time: string;

  @IsString()
  @IsOptional(null)
  clock_type: string;

  @IsString()
  @IsOptional(null)
  status: string;
}
