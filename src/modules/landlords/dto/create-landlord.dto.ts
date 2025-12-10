import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateLandlordDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  @Length(6, 20)
  phone: string;

  @ApiProperty()
  @IsString()
  @Matches(/^[0-9]{8}$/)
  dni: string;

  @ApiProperty()
  @IsString()
  @Length(5, 500)
  address: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  propertyCount?: string;

  @ApiProperty({ description: 'URL of the front side of the DNI document', required: false })
  @IsOptional()
  @IsString()
  dniFrontUrl?: string;

  @ApiProperty({ description: 'URL of the back side of the DNI document', required: false })
  @IsOptional()
  @IsString()
  dniBackUrl?: string;

  @ApiProperty({ description: 'URL of the utility bill for address verification', required: false })
  @IsOptional()
  @IsString()
  utilityBillUrl?: string;
}

