import { IsDefined, IsEnum, IsIn, IsNumber, IsNumberString, IsOptional, IsString, Min } from "class-validator";
import { RedeemMissionActionTarget, RedeemMissionActionType } from "../interfaces/redeem.interface.i";

export interface FilterRedeemDTO {
  title?: string;
}

export class ListRedeemDto {
  @IsNumberString()
  @IsOptional()
  page?: number;

  @IsNumberString()
  @IsOptional()
  limit?: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional()
  order_by?: "DESC" | "ASC";

  @IsString()
  @IsOptional()
  title?: string;
}

export class CreateRedeemDTO {
  @IsString()
  @IsDefined()
  title: string;

  @IsString()
  @IsOptional()
  start_time?: string;

  @IsString()
  @IsOptional()
  end_time?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  point?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  coin?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  required_level?: number;
}

export class UpdateRedeemDTO {
  @IsString()
  @IsDefined()
  _id: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  start_time?: string;

  @IsString()
  @IsOptional()
  end_time?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  point?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  coin?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  required_level?: number;
}

export class HandleUpdateUserRedeemDTO {
  @IsEnum(RedeemMissionActionType)
  @IsDefined()
  action_type: RedeemMissionActionType;

  @IsEnum(RedeemMissionActionTarget)
  @IsDefined()
  action_target: RedeemMissionActionTarget;
}
