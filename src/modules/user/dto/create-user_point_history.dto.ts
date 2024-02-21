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
  entity_type: string;

  @IsString()
  @IsDefined()
  entity_action: string;

  @IsNumber()
  @IsDefined()
  point: number;
}

