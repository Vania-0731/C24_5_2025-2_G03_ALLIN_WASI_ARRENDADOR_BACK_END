import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Property } from '../../properties/entities/property.entity';

@Entity('reviews')
@Index(['tenantId', 'propertyId'], { unique: true })
export class Review {
  @ApiProperty({ description: 'ID único de la reseña' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Calificación (1-5 estrellas)' })
  @Column({ type: 'int' })
  rating: number;

  @ApiProperty({ description: 'Comentario o reseña' })
  @Column({ type: 'text' })
  comment: string;

  @ApiProperty({ description: 'ID del inquilino que hizo la reseña' })
  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ApiProperty({ description: 'ID de la propiedad reseñada' })
  @Column({ name: 'property_id' })
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn()
  updatedAt: Date;
}
