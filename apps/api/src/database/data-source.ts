import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const databaseUrl = process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;
// DB_ENDPOINT and DB_SERVERNAME are only needed for IP-based DNS bypass (local dev).
// When a database URL is set, the hostname already handles endpoint routing via SNI.
const dbEndpoint = databaseUrl ? undefined : process.env.DB_ENDPOINT;
const dbServername = databaseUrl ? undefined : process.env.DB_SERVERNAME;
const sslEnabled = process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: databaseUrl,
  host: databaseUrl ? undefined : (process.env.DB_HOST || 'localhost'),
  port: databaseUrl ? undefined : parseInt(process.env.DB_PORT || '5432', 10),
  username: databaseUrl ? undefined : (process.env.DB_USERNAME || 'commune'),
  password: databaseUrl ? undefined : (process.env.DB_PASSWORD || 'commune'),
  database: databaseUrl ? undefined : (process.env.DB_NAME || 'commune_dev'),
  entities: [path.resolve(__dirname, '../modules/**/entities/*.entity{.ts,.js}')],
  migrations: [path.resolve(__dirname, './migrations/*{.ts,.js}')],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl: sslEnabled
    ? {
      rejectUnauthorized: false,
      ...(dbServername ? { servername: dbServername } : {}),
    }
    : false,
  extra: dbEndpoint
    ? { options: `endpoint=${dbEndpoint}` }
    : undefined,
};

// This is the DataSource instance used by the TypeORM CLI
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
