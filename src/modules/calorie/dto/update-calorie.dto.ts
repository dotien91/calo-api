import { PartialType } from "@nestjs/mapped-types";
import { CreateManualCalorieDto } from "./create-manual-calorie.dto";

/**
 * DTO cho cập nhật calorie analysis (sửa kết quả).
 * Tất cả field optional - chỉ gửi field cần sửa.
 */
export class UpdateCalorieDto extends PartialType(CreateManualCalorieDto) {}
