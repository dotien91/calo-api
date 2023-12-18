import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsString, IsNumberString, IsNumber} from 'class-validator';
export class CreateBuyGiftDto {
  @IsString()
  @ApiProperty()
  gift_id: string

  @ApiProperty()
  @IsNumberString()
  quantity: number
}
