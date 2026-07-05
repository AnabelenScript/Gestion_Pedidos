import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OrderStatus {
  PENDING = 'PENDING',
  INVENTORY_RESERVED = 'INVENTORY_RESERVED',
  PAYMENT_AUTHORIZED = 'PAYMENT_AUTHORIZED',
  CONFIRMED = 'CONFIRMED',
  COMPENSATING = 'COMPENSATING',
  CANCELLED = 'CANCELLED',
  COMPENSATION_FAILED = 'COMPENSATION_FAILED',
}

@Entity()
@Index(['userId'])
@Check('"quantity" > 0')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  sku: string;

  @Column()
  quantity: number;

  @Column('decimal', {
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value === null ? null : Number(value)),
    },
  })
  totalAmount: number | null;

  @Column({ default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column('uuid', { nullable: true })
  reservationId: string | null;

  @Column('uuid', { nullable: true })
  paymentId: string | null;

  @Column('text', { nullable: true })
  failureReason: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
