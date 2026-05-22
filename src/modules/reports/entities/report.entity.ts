import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export enum ReportStatus {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

@Entity('reports')
export class Report {
  @ApiProperty({ description: 'ID único del reporte' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID del usuario que envía el reporte', required: false })
  @Column({ name: 'reporter_id', nullable: true })
  reporterId: string | null;

  @ApiProperty({ description: 'ID del usuario reportado', required: false })
  @Column({ name: 'reported_user_id', nullable: true })
  reportedUserId: string | null;

  @ApiProperty({ description: 'ID de la conversación relacionada', required: false })
  @Column({ name: 'conversation_id', nullable: true })
  conversationId?: string;

  @ApiProperty({ description: 'Motivo del reporte' })
  @Column({ type: 'text' })
  reason: string;

  @ApiProperty({ description: 'Estado del reporte', enum: ReportStatus })
  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @ManyToOne(() => User, { eager: false, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @ManyToOne(() => User, { eager: false, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'reported_user_id' })
  reportedUser: User;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn()
  updatedAt: Date;
}
