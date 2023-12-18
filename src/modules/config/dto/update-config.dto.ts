import { IsString, IsOptional, IsIn} from 'class-validator';
import { CreateConfigDto } from './create-config.dto';

export class UpdateConfigDto extends CreateConfigDto {
  @IsString()
  _id?: String
}
