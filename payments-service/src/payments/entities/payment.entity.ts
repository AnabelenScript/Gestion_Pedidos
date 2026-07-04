import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @Column('decimal')
  amount: number;

  @Column({ default: 'AUTHORIZED' }) // AUTHORIZED, VOIDED
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
