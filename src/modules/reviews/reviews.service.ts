import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Property } from '../properties/entities/property.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {}

  async create(userId: string, dto: CreateReviewDto): Promise<Review> {
    const tenant = await this.tenantRepository.findOne({ where: { userId } });
    if (!tenant) {
      throw new NotFoundException('Perfil de inquilino no encontrado');
    }

    const property = await this.propertyRepository.findOne({ where: { id: dto.propertyId } });
    if (!property) {
      throw new NotFoundException('Propiedad no encontrada');
    }

    // Check if tenant already reviewed this property
    const existingReview = await this.reviewRepository.findOne({
      where: { tenantId: tenant.id, propertyId: dto.propertyId }
    });

    if (existingReview) {
      // Update existing review
      existingReview.rating = dto.rating;
      existingReview.comment = dto.comment;
      return await this.reviewRepository.save(existingReview);
    }

    const review = this.reviewRepository.create({
      ...dto,
      tenantId: tenant.id,
    });

    return await this.reviewRepository.save(review);
  }

  async findByProperty(propertyId: string): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: { propertyId },
      relations: ['tenant', 'tenant.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAverageRatingByProperty(propertyId: string): Promise<number> {
    const reviews = await this.reviewRepository.find({ where: { propertyId } });
    if (reviews.length === 0) return 0;

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return parseFloat((sum / reviews.length).toFixed(1));
  }

  async getAverageRatingByLandlord(landlordId: string): Promise<number> {
    const reviews = await this.reviewRepository.find({
      where: { property: { landlordId } },
      relations: ['property'],
    });

    if (reviews.length === 0) return 0;

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return parseFloat((sum / reviews.length).toFixed(1));
  }
}
