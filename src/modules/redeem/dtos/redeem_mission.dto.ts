import { IsDefined, IsEnum, IsIn, IsNumber, IsNumberString, IsOptional, IsString, Min } from "class-validator";
import { RedeemMissionActionTarget, RedeemMissionActionType } from "../interfaces/redeem.interface.i";

export interface FilterRedeemMissionDTO {
  title?: string;
  redeem_id?: string;
  action_type?: string;
  action_target?: string;
}

export class ListRedeemMissionDto {
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

  @IsString()
  @IsOptional()
  redeem_id?: string;
}

export class CreateRedeemMissionDTO {
  @IsString()
  @IsDefined()
  title: string;

  @IsString()
  @IsDefined()
  redeem_id: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  point?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  coin?: number;

  @IsEnum(RedeemMissionActionType)
  @IsDefined()
  action_type: RedeemMissionActionType;

  @IsEnum(RedeemMissionActionTarget)
  @IsDefined()
  action_target: RedeemMissionActionTarget;

  @IsNumber()
  @IsDefined()
  @Min(1)
  action_amount: number;

  @IsString()
  @IsOptional()
  navigate?: string;
}

export class UpdateRedeemMissionDTO {
  @IsString()
  @IsDefined()
  _id: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  redeem_id?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  point?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  coin?: number;

  @IsEnum(RedeemMissionActionType)
  @IsOptional()
  action_type?: RedeemMissionActionType;

  @IsEnum(RedeemMissionActionTarget)
  @IsOptional()
  action_target?: RedeemMissionActionTarget;

  @IsNumber()
  @IsOptional()
  @Min(1)
  action_amount?: number;

  @IsString()
  @IsOptional()
  navigate?: string;
}
