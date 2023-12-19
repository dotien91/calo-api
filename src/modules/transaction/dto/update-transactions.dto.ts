import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsIn } from "class-validator";

export class UpdateTransactionDto {
  @IsString()
  @ApiProperty()
  _id?: string;

  @IsString()
  @ApiProperty()
  status: string;
}
