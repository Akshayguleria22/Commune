import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'commune',
  password: process.env.DB_PASSWORD || 'commune',
  name: process.env.DB_NAME || 'commune_dev',
}));
