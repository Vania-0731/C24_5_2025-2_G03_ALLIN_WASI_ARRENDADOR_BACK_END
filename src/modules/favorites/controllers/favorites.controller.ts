import { Controller, Post, Get, Body, UseGuards, Req, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FavoritesService } from '../services/favorites.service';
import { CreateFavoriteDto } from '../dto/create-favorite.dto';
import { User } from '../../users/entities/user.entity';

@ApiTags('favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('toggle')
  @ApiOperation({ summary: 'Añadir o quitar una propiedad de favoritos' })
  async toggle(@Req() req: any, @Body() createFavoriteDto: CreateFavoriteDto) {
    const userId = req.user.id;
    return this.favoritesService.toggle(userId, createFavoriteDto.propertyId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las propiedades favoritas del usuario' })
  async findAll(@Req() req: any) {
    const userId = req.user.id;
    return this.favoritesService.findAllByUser(userId);
  }

  @Get('check/:propertyId')
  @ApiOperation({ summary: 'Verificar si una propiedad es favorita' })
  async check(@Req() req: any, @Param('propertyId') propertyId: string) {
    const userId = req.user.id;
    const isFavorite = await this.favoritesService.isFavorite(userId, propertyId);
    return { isFavorite };
  }
}
