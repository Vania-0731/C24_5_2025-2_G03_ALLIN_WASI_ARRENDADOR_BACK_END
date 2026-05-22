import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { CommunityComment } from './comment.entity';
import { CommunityReaction } from './reaction.entity';

@Entity('community_posts')
export class CommunityPost {
  @ApiProperty({ description: 'ID único del artículo' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Título del artículo' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ description: 'Contenido del artículo' })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ description: 'Categoría del tema (seguridad, cuartos, lugares, etc.)' })
  @Column({ length: 100 })
  category: string;

  @ApiProperty({ description: 'URL de imagen opcional para el artículo', required: false })
  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl?: string;

  @ApiProperty({ description: 'ID del usuario autor del artículo' })
  @Column({ name: 'author_id' })
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @OneToMany(() => CommunityComment, (comment) => comment.post, { cascade: true })
  comments: CommunityComment[];

  @OneToMany(() => CommunityReaction, (reaction) => reaction.post, { cascade: true })
  reactions: CommunityReaction[];

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
