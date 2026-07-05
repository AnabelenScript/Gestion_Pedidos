import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  sku: string;

  @Column()
  quantity: number;

  @Column('decimal')
  totalAmount: number;

  @Column({ default: 'PENDING' }) // PENDING, CONFIRMED, CANCELLED
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
