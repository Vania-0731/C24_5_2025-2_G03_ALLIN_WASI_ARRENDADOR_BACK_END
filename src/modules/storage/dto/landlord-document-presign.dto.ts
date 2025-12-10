import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class LandlordDocumentPresignDto {
    @ApiProperty({
        description: 'DNI number of the landlord (8 digits)',
        example: '12345678'
    })
    @IsString()
    @Matches(/^[0-9]{8}$/, { message: 'DNI must be exactly 8 digits' })
    dni: string;

    @ApiProperty({
        description: 'Content type for the front DNI image',
        example: 'image/jpeg'
    })
    @IsString()
    dniFrontContentType: string;

    @ApiProperty({
        description: 'Content type for the back DNI image',
        example: 'image/jpeg'
    })
    @IsString()
    dniBackContentType: string;

    @ApiProperty({
        description: 'Content type for the utility bill image',
        example: 'image/jpeg'
    })
    @IsString()
    utilityBillContentType: string;
}

export interface LandlordDocumentPresignResponse {
    dniFront: {
        uploadUrl: string;
        resourceUrl: string;
        key: string;
    };
    dniBack: {
        uploadUrl: string;
        resourceUrl: string;
        key: string;
    };
    utilityBill: {
        uploadUrl: string;
        resourceUrl: string;
        key: string;
    };
    expiresIn: number;
}
