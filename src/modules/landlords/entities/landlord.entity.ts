import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity('landlords')
export class LandlordProfile {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'FK to users.id' })
  @Column({ name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty()
  @Column({ length: 20, default: '' })
  phone: string;

  @ApiProperty()
  @Column({ length: 15, default: '' })
  dni: string;

  @ApiProperty()
  @Column({ length: 500, default: '' })
  address: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 20, default: '' })
  propertyCount: string;

  @ApiProperty({ description: 'URL of the front side of the DNI document' })
  @Column({ nullable: true, length: 500 })
  dniFrontUrl: string;

  @ApiProperty({ description: 'URL of the back side of the DNI document' })
  @Column({ nullable: true, length: 500 })
  dniBackUrl: string;

  @ApiProperty({ description: 'URL of the utility bill (electricity/water) for address verification' })
  @Column({ nullable: true, length: 500 })
  utilityBillUrl: string;

  @ApiProperty({ description: 'Verification status of the landlord documents', enum: ['pending', 'verified', 'rejected'] })
  @Column({ type: 'varchar', length: 20, default: 'pending' })
  verificationStatus: string;

  @ApiProperty({ description: 'Message from admin when documents are rejected (reason for rejection)' })
  @Column({ nullable: true, length: 500 })
  verificationMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
