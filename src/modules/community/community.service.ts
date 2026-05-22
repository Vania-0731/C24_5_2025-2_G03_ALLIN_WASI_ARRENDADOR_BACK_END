import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityPost } from './entities/post.entity';
import { CommunityComment } from './entities/comment.entity';
import { CommunityReaction } from './entities/reaction.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReactionDto } from './dto/create-reaction.dto';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(CommunityPost)
    private readonly postRepository: Repository<CommunityPost>,

    @InjectRepository(CommunityComment)
    private readonly commentRepository: Repository<CommunityComment>,

    @InjectRepository(CommunityReaction)
    private readonly reactionRepository: Repository<CommunityReaction>,
  ) {}

  async createPost(authorId: string, dto: CreatePostDto): Promise<CommunityPost> {
    const post = this.postRepository.create({
      ...dto,
      authorId,
    });
    const savedPost = await this.postRepository.save(post);
    return this.findOnePost(savedPost.id);
  }

  async findAllPosts(category?: string): Promise<CommunityPost[]> {
    const queryBuilder = this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('comments.author', 'commentAuthor')
      .leftJoinAndSelect('post.reactions', 'reactions')
      .leftJoinAndSelect('reactions.user', 'reactionUser');

    if (category && category !== 'all') {
      queryBuilder.where('post.category = :category', { category });
    }

    queryBuilder.orderBy('post.createdAt', 'DESC');
    queryBuilder.addOrderBy('comments.createdAt', 'ASC');

    return await queryBuilder.getMany();
  }

  async findOnePost(id: string): Promise<CommunityPost> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'comments', 'comments.author', 'reactions', 'reactions.user'],
      order: {
        comments: {
          createdAt: 'ASC',
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Publicación no encontrada');
    }

    return post;
  }

  async deletePost(userId: string, id: string): Promise<void> {
    const post = await this.findOnePost(id);

    if (post.authorId !== userId) {
      throw new UnauthorizedException('No tienes permisos para eliminar esta publicación');
    }

    await this.postRepository.remove(post);
  }

  async createComment(authorId: string, dto: CreateCommentDto): Promise<CommunityComment> {
    // Verificar que el post existe
    await this.findOnePost(dto.postId);

    const comment = this.commentRepository.create({
      content: dto.content,
      postId: dto.postId,
      authorId,
    });

    const savedComment = await this.commentRepository.save(comment);
    
    // Devolver el comentario con el autor cargado
    const fullComment = await this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['author'],
    });

    if (!fullComment) {
      throw new NotFoundException('Error al recuperar el comentario creado');
    }

    return fullComment;
  }

  async deleteComment(userId: string, commentId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    if (comment.authorId !== userId) {
      throw new UnauthorizedException('No tienes permisos para eliminar este comentario');
    }

    await this.commentRepository.remove(comment);
  }

  async toggleReaction(userId: string, dto: CreateReactionDto): Promise<{ reacted: boolean; type: string; reactionsCount: number }> {
    // Verificar que el post existe
    await this.findOnePost(dto.postId);

    const existingReaction = await this.reactionRepository.findOne({
      where: { userId, postId: dto.postId },
    });

    let reacted = false;
    let type = dto.type;

    if (existingReaction) {
      if (existingReaction.type === dto.type) {
        // Si el tipo es el mismo, removemos la reacción (toggle off)
        await this.reactionRepository.remove(existingReaction);
        reacted = false;
      } else {
        // Si es diferente tipo, actualizamos el tipo de reacción
        existingReaction.type = dto.type;
        await this.reactionRepository.save(existingReaction);
        reacted = true;
      }
    } else {
      // Si no existe, creamos una nueva reacción
      const reaction = this.reactionRepository.create({
        userId,
        postId: dto.postId,
        type: dto.type,
      });
      await this.reactionRepository.save(reaction);
      reacted = true;
    }

    // Obtener contador total
    const reactionsCount = await this.reactionRepository.count({
      where: { postId: dto.postId },
    });

    return { reacted, type, reactionsCount };
  }
}
