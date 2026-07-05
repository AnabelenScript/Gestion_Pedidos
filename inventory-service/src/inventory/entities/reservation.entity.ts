import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @Column()
  sku: string;

  @Column()
  quantity: number;

  @Column({ default: 'PENDING' }) // PENDING, CONFIRMED, CANCELLED
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
