import { IsDefined, IsNumber, IsString } from "class-validator";

export class CreateUserPointHistoryDto {
  @IsString()
  @IsDefined()
  user_id: string;

  @IsString()
  @IsDefined()
  entity_id: string;

  @IsString()
  @IsDefined()
  entity_target: string;

  @IsString()
  @IsDefined()
  entity_action: string;

  @IsNumber()
  @IsDefined()
  point: number;
}
