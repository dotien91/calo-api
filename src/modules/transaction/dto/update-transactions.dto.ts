import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsIn } from "class-validator";

export class UpdateTransactionDto {
  @IsString()
  @ApiProperty()
  _id?: String;

  @IsString()
  @ApiProperty()
  status: String;
}
