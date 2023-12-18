import { IsString, IsOptional, IsIn} from 'class-validator';
import { CreateClockHistoryDto } from './create-clock_history.dto';

export class UpdateClockHistoryDto {
  @IsString()
  _id: string

  @IsString()
  @IsOptional(null)
  clock_id: string

  @IsString()
  @IsOptional(null)
  sleep_time: string

  @IsString()
  @IsOptional(null)
  wake_time_setup: string

  @IsString()
  @IsOptional(null)
  sound: string

  @IsString()
  @IsOptional(null)
  temperature: string

  @IsString()
  @IsOptional(null)
  oxy_ratio: string

  @IsString()
  @IsOptional(null)
  wake_time: string

  @IsString()
  @IsOptional(null)
  brightness: string

  @IsString()
  @IsOptional(null)
  air_pressure: string

  @IsString()
  @IsOptional(null)
  breathing: string

  @IsString()
  @IsOptional(null)
  heartbeat: string

  @IsString()
  @IsOptional(null)
  magnetic: string

  @IsString()
  @IsOptional(null)
  note: string
}
