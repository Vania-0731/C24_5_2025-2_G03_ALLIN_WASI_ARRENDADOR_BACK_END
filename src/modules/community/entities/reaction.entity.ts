import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { CommunityPost } from './post.entity';

@Entity('community_reactions')
@Index(['userId', 'postId'], { unique: true })
export class CommunityReaction {
  @ApiProperty({ description: 'ID único de la reacción' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Tipo de reacción (like, love, etc.)' })
  @Column({ length: 50, default: 'like' })
  type: string;

  @ApiProperty({ description: 'ID del usuario que reaccionó' })
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ description: 'ID del artículo sobre el que se reaccionó' })
  @Column({ name: 'post_id' })
  postId: string;

  @ManyToOne(() => CommunityPost, (post) => post.reactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: CommunityPost;

  @ApiProperty({ description: 'Fecha de la reacción' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
