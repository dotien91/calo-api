import { IsOptional, IsString } from "class-validator";

/**
 * Body cho POST reanalyze/:id – gợi ý chỉnh sửa của user để AI ưu tiên khi phân tích lại.
 */
export class ReanalyzeCalorieDto {
  @IsOptional()
  @IsString()
  user_edit_hint?: string;
}
