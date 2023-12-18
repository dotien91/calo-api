import { IsOptional, IsDateString, IsString} from 'class-validator';
export class CreateReportDto {
  @IsString()
  report_type: string

  @IsString()
  @IsOptional(null)
  partner_id: String

  @IsString()
  @IsOptional(null)
  report_content: string

  @IsString()
  @IsOptional(null)
  report_image: string

  @IsString()
  @IsOptional(null)
  report_status: string

  @IsString()
  @IsOptional(null)
  report_email: string;

  @IsString()
  @IsOptional(null)
  report_name: string;

  @IsString()
  @IsOptional(null)
  g_recaptcha_response: string;
}
