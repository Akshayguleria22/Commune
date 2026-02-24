import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../data-source';
import { runSeed } from './seed-inline';

/**
 * Seeds the database with comprehensive development data.
 * Delegates to seed-inline.ts for the actual seed logic (6 communities, 10 tasks, 5 events, etc.)
 * Run with: npx ts-node -r tsconfig-paths/register src/database/seeds/seed.ts
 */
async function seed() {
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();
  console.log('📦 Connected to database. Seeding...\n');

  const queryRunner = dataSource.createQueryRunner();

  try {
    await runSeed(queryRunner);
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Test accounts (password: Password1):');
    console.log('  alice@commune.dev  — AI Builders owner');
    console.log('  bob@commune.dev    — React Devs owner, Rust Enthusiasts owner');
    console.log('  carol@commune.dev  — Design Systems owner, Designer');
    console.log('  dave@commune.dev   — DevOps Guild owner, ML engineer');
    console.log('  eve@commune.dev    — Startup Studio owner, PM');

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
