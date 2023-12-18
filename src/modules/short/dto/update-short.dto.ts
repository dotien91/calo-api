import { IsString, IsOptional, IsIn, IsNumberString} from 'class-validator';

export class UpdateShortDto {
  @IsString()
  _id: string

  @IsString()
  @IsOptional(null)
  caption: string;

  @IsNumberString()
  @IsOptional(null)
  short_status: number;

  @IsString()
  @IsOptional(null)
  ref_id: string

  @IsString()
  @IsOptional(null)
  post_category: string
}
