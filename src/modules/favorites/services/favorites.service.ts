import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../entities/favorite.entity';
import { Property } from '../../properties/entities/property.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {}

  async toggle(userId: string, propertyId: string): Promise<{ isFavorite: boolean }> {
    const property = await this.propertyRepository.findOne({ where: { id: propertyId } });
    if (!property) {
      throw new NotFoundException('Propiedad no encontrada');
    }

    const existing = await this.favoriteRepository.findOne({
      where: { userId, propertyId },
    });

    if (existing) {
      await this.favoriteRepository.remove(existing);
      return { isFavorite: false };
    } else {
      const favorite = this.favoriteRepository.create({ userId, propertyId });
      await this.favoriteRepository.save(favorite);
      return { isFavorite: true };
    }
  }

  async findAllByUser(userId: string): Promise<Property[]> {
    const favorites = await this.favoriteRepository.find({
      where: { userId },
      relations: ['property', 'property.images'],
    });

    return favorites.map(f => f.property);
  }

  async isFavorite(userId: string, propertyId: string): Promise<boolean> {
    const existing = await this.favoriteRepository.findOne({
      where: { userId, propertyId },
    });
    return !!existing;
  }
}
