import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReactionDto {
  @ApiProperty({ description: 'Tipo de reacción (like, love, haha, wow, sad, angry)' })
  @IsNotEmpty({ message: 'El tipo de reacción es obligatorio' })
  @IsString({ message: 'El tipo de reacción debe ser una cadena de texto' })
  type: string;

  @ApiProperty({ description: 'ID de la publicación sobre la que se reacciona' })
  @IsNotEmpty({ message: 'El ID de la publicación es obligatorio' })
  @IsUUID('4', { message: 'El ID de la publicación debe ser un UUID válido' })
  postId: string;
}
