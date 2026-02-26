import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dbEndpoint = process.env.DB_ENDPOINT;
const dbServername = process.env.DB_SERVERNAME;
const sslEnabled = process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'commune',
  password: process.env.DB_PASSWORD || 'commune',
  database: process.env.DB_NAME || 'commune_dev',
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
