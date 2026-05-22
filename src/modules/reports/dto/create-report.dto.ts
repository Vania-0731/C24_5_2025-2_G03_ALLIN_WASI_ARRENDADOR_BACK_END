import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({ description: 'ID del usuario que está siendo reportado' })
  @IsUUID()
  @IsNotEmpty()
  reportedUserId: string;

  @ApiProperty({ description: 'ID de la conversación relacionada (opcional)', required: false })
  @IsUUID()
  @IsOptional()
  conversationId?: string;

  @ApiProperty({ description: 'Motivo del reporte' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
