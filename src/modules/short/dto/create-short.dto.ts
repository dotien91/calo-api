import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsObject, IsNumber} from 'class-validator';
export class CreateShortDto {
  @IsString()
  media_id: string

  @IsString()
  caption: string

  @IsString()
  @IsOptional(null)
  hashtag_id: string

  @IsNumberString()
  @IsOptional(null)
  short_status: number

  @IsString()
  @IsOptional(null)
  ref_id: string

  @IsString()
  @IsOptional(null)
  post_category: string
}
