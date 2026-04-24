import { IsString, IsOptional, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateUserDto {
    @IsString()
    @IsOptional()
    fullName?: string;
}

class UpdateTenantDto {
    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    code?: string;

    @IsString()
    @IsOptional()
    career?: string;

    @IsString()
    @IsOptional()
    cicle?: string;

    @IsOptional()
    monthly_budget?: number;

    @IsString()
    @IsOptional()
    origin_department?: string;

    @IsString()
    @IsOptional()
    studentIDCardUrl?: string;
}

export class UpdateUserTenantDto {
    @ValidateNested()
    @Type(() => UpdateUserDto)
    @IsOptional()
    user?: UpdateUserDto;

    @ValidateNested()
    @Type(() => UpdateTenantDto)
    @IsOptional()
    tenant?: UpdateTenantDto;
}
