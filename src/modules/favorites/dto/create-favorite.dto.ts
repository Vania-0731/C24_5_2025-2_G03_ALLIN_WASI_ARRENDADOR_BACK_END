import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateFavoriteDto {
  @ApiProperty({ description: 'ID de la propiedad a marcar como favorita' })
  @IsUUID()
  propertyId: string;
}
