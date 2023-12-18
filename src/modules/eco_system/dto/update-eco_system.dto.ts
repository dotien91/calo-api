import { IsString, IsOptional, IsIn} from 'class-validator';
import { CreateEcoSystemDto } from './create-eco_system.dto';

export class UpdateEcoSystemDto extends CreateEcoSystemDto {
  @IsString()
  _id?: String
}
