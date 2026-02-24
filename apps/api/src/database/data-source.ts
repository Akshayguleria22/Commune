import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'commune',
  password: process.env.DB_PASSWORD || 'commune',
  database: process.env.DB_NAME || 'commune_dev',
  entities: [path.resolve(__dirname, '../modules/**/entities/*.entity{.ts,.js}')],
  migrations: [path.resolve(__dirname, './migrations/*{.ts,.js}')],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
};

// This is the DataSource instance used by the TypeORM CLI
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
