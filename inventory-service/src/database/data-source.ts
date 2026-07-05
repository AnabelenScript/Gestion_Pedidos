import { DataSource } from 'typeorm';
import { Product } from '../inventory/entities/product.entity';
import { Reservation } from '../inventory/entities/reservation.entity';

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`La variable ${key} es obligatoria`);
  return value;
}

const ssl = process.env.DATABASE_SSL === 'true';

export default new DataSource({
  type: 'postgres',
  host: required('DATABASE_HOST'),
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: required('DATABASE_USER'),
  password: required('DATABASE_PASS'),
  database: required('DATABASE_NAME'),
  entities: [Product, Reservation],
  migrations: [__dirname + '/migrations/*{.js,.ts}'],
  synchronize: false,
  ssl: ssl
    ? {
        rejectUnauthorized:
          process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false',
      }
    : false,
});
