import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Contenido del comentario' })
  @IsNotEmpty({ message: 'El contenido del comentario es obligatorio' })
  @IsString({ message: 'El contenido debe ser una cadena de texto' })
  content: string;

  @ApiProperty({ description: 'ID de la publicación comentada' })
  @IsNotEmpty({ message: 'El ID de la publicación es obligatorio' })
  @IsUUID('4', { message: 'El ID de la publicación debe ser un UUID válido' })
  postId: string;
}
