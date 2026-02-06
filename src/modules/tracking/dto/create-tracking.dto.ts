import { IsDateString, IsDefined, IsIn, IsOptional, IsString, ValidateIf } from "class-validator";
import { TRACKING_TYPES, TrackingType } from "../enums/tracking.enum";

export class CreateTrackingDto {
  @IsDefined()
  @IsString()
  @IsIn(TRACKING_TYPES, { message: "type phải là screen | body" })
  type: string;

  /** Bắt buộc khi type = body: weight | water | ... */
  @ValidateIf((o) => o.type === TrackingType.BODY)
  @IsDefined()
  @IsString()
  metric?: string;

  /** Giá trị (number hoặc string). Dùng khi type = body */
  @IsOptional()
  value?: number | string;

  /** Thời gian track tùy chỉnh (ISO 8601, ví dụ: 2025-02-04T08:00:00.000Z). Không gửi thì dùng thời gian server */
  @IsOptional()
  @IsDateString()
  tracked_at?: string;

  @IsString()
  @IsOptional(null)
  user_id?: string;
}
