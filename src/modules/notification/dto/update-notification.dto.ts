import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsIn} from 'class-validator';
import { CreateNotificationDto } from './create-notifcation.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @IsString()
  @ApiProperty()
  _id?: String

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  read_status?: string
}
