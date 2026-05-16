import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches, IsNumberString, IsOptional } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  @Length(6, 20)
  phone: string;

  @ApiProperty()
  @IsString()
  @Length(1, 50)
  code: string;

  @ApiProperty()
  @IsString()
  @Length(2, 100)
  career: string;

  @ApiProperty()
  @IsString()
  @Length(1, 50)
  cicle: string;

  @ApiProperty()
  @IsNumberString()
  monthly_budget: string;

  @ApiProperty()
  @IsString()
  @Length(2, 100)
  origin_department: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  studentIDCardUrl?: string;
}
