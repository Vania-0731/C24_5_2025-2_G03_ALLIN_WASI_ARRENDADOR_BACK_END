import { IsString, IsInt, Min, Max, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'Calificación de 1 a 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @ApiProperty({ description: 'Comentario de la reseña' })
  @IsString()
  @IsNotEmpty()
  comment: string;

  @ApiProperty({ description: 'ID de la propiedad' })
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;
}
