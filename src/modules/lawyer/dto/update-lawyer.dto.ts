import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsIn} from 'class-validator';
import { CreateLawyerDto } from './create-lawyer.dto';

export class UpdateLawyerDto extends PartialType(CreateLawyerDto) {
  @IsString()
  _id: string;
}
