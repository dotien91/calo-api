import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsObject} from 'class-validator';
export class CreateTopicPostDto {
  @IsString()
  @IsOptional(null)
  post_language: string

  @IsString()
  post_content: string

  @IsString()
  post_title: string

  @IsString()
  @IsOptional(null)
  post_excerpt: string

  @IsString()
  @IsOptional(null)
  post_parent: string

  @IsString()
  @IsOptional(null)
  post_status: string

  @IsString()
  @IsOptional(null)
  post_avatar: string

  @IsString()
  @IsOptional(null)
  post_type: string

  @IsString()
  @IsOptional(null)
  seo_title: string

  @IsString()
  @IsOptional(null)
  seo_description: string

  @IsString()
  @IsOptional(null)
  seo_keyword: string

  @IsString()
  topic_id: string
}
