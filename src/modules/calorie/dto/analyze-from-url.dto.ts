import { IsOptional, IsString } from "class-validator";

/**
 * Body cho POST analyze-from-url – phân tích lại từ URL ảnh (vd. scanner chưa lưu, có gợi ý user).
 */
export class AnalyzeFromUrlDto {
  @IsString()
  image_url: string;

  @IsOptional()
  @IsString()
  user_edit_hint?: string;
}
