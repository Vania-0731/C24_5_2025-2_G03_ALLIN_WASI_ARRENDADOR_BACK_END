import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Community')
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo artículo o publicación de la comunidad' })
  async createPost(@Req() req: any, @Body() dto: CreatePostDto) {
    return await this.communityService.createPost(req.user.id, dto);
  }

  @Get('posts')
  @ApiOperation({ summary: 'Obtener todas las publicaciones de la comunidad' })
  @ApiQuery({ name: 'category', required: false, description: 'Filtrar por categoría (seguridad, cuartos, lugares, etc.)' })
  async findAllPosts(@Query('category') category?: string) {
    return await this.communityService.findAllPosts(category);
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Obtener los detalles de una publicación específica' })
  async findOnePost(@Param('id') id: string) {
    return await this.communityService.findOnePost(id);
  }

  @Delete('posts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una publicación de la comunidad' })
  async deletePost(@Req() req: any, @Param('id') id: string) {
    await this.communityService.deletePost(req.user.id, id);
    return { message: 'Publicación eliminada correctamente' };
  }

  @Post('comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Agregar un comentario a una publicación' })
  async createComment(@Req() req: any, @Body() dto: CreateCommentDto) {
    return await this.communityService.createComment(req.user.id, dto);
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un comentario' })
  async deleteComment(@Req() req: any, @Param('id') id: string) {
    await this.communityService.deleteComment(req.user.id, id);
    return { message: 'Comentario eliminado correctamente' };
  }

  @Post('reactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Agregar o quitar una reacción a una publicación' })
  async toggleReaction(@Req() req: any, @Body() dto: CreateReactionDto) {
    return await this.communityService.toggleReaction(req.user.id, dto);
  }
}
