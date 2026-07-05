import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInventorySchema1710000000000 implements MigrationInterface {
  name = 'CreateInventorySchema1710000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product" (
        "id" SERIAL NOT NULL,
        "sku" character varying NOT NULL,
        "name" character varying NOT NULL,
        "stock" integer NOT NULL,
        "unitPrice" numeric(12,2) NOT NULL DEFAULT 0,
        CONSTRAINT "PK_product" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_product_stock" CHECK ("stock" >= 0)
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "product"
      ADD COLUMN IF NOT EXISTS "unitPrice" numeric(12,2) NOT NULL DEFAULT 0
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_sku"
      ON "product" ("sku")
    `);
    await queryRunner.query(`
      UPDATE "product" SET "unitPrice" = 999.99
      WHERE "sku" = 'SKU-123' AND "unitPrice" = 0
    `);
    await queryRunner.query(`
      UPDATE "product" SET "unitPrice" = 29.99
      WHERE "sku" = 'SKU-456' AND "unitPrice" = 0
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "reservation" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "orderId" uuid NOT NULL,
        "sku" character varying NOT NULL,
        "quantity" integer NOT NULL,
        "unitPrice" numeric(12,2) NOT NULL,
        "status" character varying NOT NULL DEFAULT 'PENDING',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reservation" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_reservation_quantity" CHECK ("quantity" > 0)
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "reservation"
      ADD COLUMN IF NOT EXISTS "unitPrice" numeric(12,2) NOT NULL DEFAULT 0
    `);
    await queryRunner.query(`
      UPDATE "reservation" AS reservation
      SET "unitPrice" = product."unitPrice"
      FROM "product" AS product
      WHERE reservation."sku" = product."sku"
        AND reservation."unitPrice" = 0
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_reservation_order"
      ON "reservation" ("orderId")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "reservation"');
    await queryRunner.query('DROP TABLE IF EXISTS "product"');
  }
}
