import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsString, IsNumberString, IsNumber} from 'class-validator';
export class CreateSellGiftDto {
  @IsString()
  @ApiProperty()
  gift_id: string

  @IsNumberString()
  @ApiProperty()
  quantity: number
}
