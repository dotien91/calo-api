import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsJSON, IsNumber} from 'class-validator';
export class CreateLawyerDto {
  @IsString()
  @ApiProperty()
  name: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  avatar: string

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  address: string

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  licensed: any

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  about: string

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  categories: any

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  maps: string

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  cost: number

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  work_experience: string

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  education: string

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  legal_case: string

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  associations: string

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  language_spoken: any

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  honors_awards: any

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  publications: string

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  engagements: string

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  contact: any
}
