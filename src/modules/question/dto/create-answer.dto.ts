import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsObject} from 'class-validator';
export class CreateAnswerDto {
  @IsString()
  question_id: string

  @IsString()
  answer: string
}
