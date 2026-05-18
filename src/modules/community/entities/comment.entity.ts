import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { CommunityPost } from './post.entity';

@Entity('community_comments')
export class CommunityComment {
  @ApiProperty({ description: 'ID único del comentario' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Contenido del comentario' })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ description: 'ID del usuario autor del comentario' })
  @Column({ name: 'author_id' })
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ApiProperty({ description: 'ID del artículo comentado' })
  @Column({ name: 'post_id' })
  postId: string;

  @ManyToOne(() => CommunityPost, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: CommunityPost;

  @ApiProperty({ description: 'Fecha de creación del comentario' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización del comentario' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
