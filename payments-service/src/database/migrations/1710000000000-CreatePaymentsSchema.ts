import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentsSchema1710000000000 implements MigrationInterface {
  name = 'CreatePaymentsSchema1710000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payment" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "orderId" uuid NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "status" character varying NOT NULL DEFAULT 'AUTHORIZED',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_payment_amount" CHECK ("amount" > 0)
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "payment"
      ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_payment_order"
      ON "payment" ("orderId")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "payment"');
  }
}
