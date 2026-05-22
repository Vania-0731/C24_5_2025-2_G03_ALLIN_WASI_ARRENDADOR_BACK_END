import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ description: 'Título de la publicación' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El título no puede exceder los 255 caracteres' })
  title: string;

  @ApiProperty({ description: 'Contenido de la publicación' })
  @IsNotEmpty({ message: 'El contenido es obligatorio' })
  @IsString({ message: 'El contenido debe ser una cadena de texto' })
  content: string;

  @ApiProperty({ description: 'Categoría o tema de la publicación (seguridad, cuartos, lugares, etc.)' })
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  @IsString({ message: 'La categoría debe ser una cadena de texto' })
  category: string;

  @ApiProperty({ description: 'URL de imagen opcional para la publicación', required: false })
  @IsOptional()
  @IsString({ message: 'La URL de la imagen debe ser una cadena de texto' })
  imageUrl?: string;
}
