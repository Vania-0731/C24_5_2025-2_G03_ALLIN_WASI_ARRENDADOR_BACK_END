import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva reseña' })
  async create(@Req() req: any, @Body() dto: CreateReviewDto) {
    return await this.reviewsService.create(req.user.id, dto);
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Obtener todas las reseñas de una propiedad' })
  async findByProperty(@Param('propertyId') propertyId: string) {
    return await this.reviewsService.findByProperty(propertyId);
  }

  @Get('property/:propertyId/average')
  @ApiOperation({ summary: 'Obtener el promedio de calificación de una propiedad' })
  async getAverage(@Param('propertyId') propertyId: string) {
    const average = await this.reviewsService.getAverageRatingByProperty(propertyId);
    return { average };
  }

  @Get('landlord/:landlordId/average')
  @ApiOperation({ summary: 'Obtener el promedio de calificación de un arrendador' })
  async getLandlordAverage(@Param('landlordId') landlordId: string) {
    const average = await this.reviewsService.getAverageRatingByLandlord(landlordId);
    return { average };
  }
}
