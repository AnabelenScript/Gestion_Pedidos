import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrdersSchema1710000000000 implements MigrationInterface {
  name = 'CreateOrdersSchema1710000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "order" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" character varying NOT NULL,
        "sku" character varying NOT NULL,
        "quantity" integer NOT NULL,
        "totalAmount" numeric(12,2),
        "status" character varying NOT NULL DEFAULT 'PENDING',
        "reservationId" uuid,
        "paymentId" uuid,
        "failureReason" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_order" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_order_quantity" CHECK ("quantity" > 0)
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "order" ALTER COLUMN "totalAmount" DROP NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "order"
      ADD COLUMN IF NOT EXISTS "reservationId" uuid
    `);
    await queryRunner.query(`
      ALTER TABLE "order"
      ADD COLUMN IF NOT EXISTS "paymentId" uuid
    `);
    await queryRunner.query(`
      ALTER TABLE "order"
      ADD COLUMN IF NOT EXISTS "failureReason" text
    `);
    await queryRunner.query(`
      ALTER TABLE "order"
      ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_order_user"
      ON "order" ("userId")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "order"');
  }
}
