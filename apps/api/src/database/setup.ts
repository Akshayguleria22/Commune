import { DataSource } from 'typeorm';
import { dataSourceOptions } from './data-source';
import { InitialSchema1708627200000 } from './migrations/1708627200000-InitialSchema';
import { AddIndexes1708627300000 } from './migrations/1708627300000-AddIndexes';

/**
 * Sets up the database: runs migrations (or creates tables) and seeds data.
 * Run with: npx ts-node src/database/setup.ts
 */
async function setup() {
  const dataSource = new DataSource({
    ...dataSourceOptions,
    logging: true,
  });

  await dataSource.initialize();
  console.log('📦 Connected to database.\n');

  const queryRunner = dataSource.createQueryRunner();

  // Step 1: Drop everything if exists (fresh start)
  console.log('🗑️  Dropping existing tables...');
  try {
    const migration = new InitialSchema1708627200000();
    await migration.down(queryRunner);
    console.log('✅ Tables dropped.\n');
  } catch (e) {
    console.log('⚠️  No existing tables to drop (fresh database).\n');
  }

  // Step 2: Run migrations
  console.log('🔨 Running migrations...');
  try {
    const migration1 = new InitialSchema1708627200000();
    await migration1.up(queryRunner);
    console.log('✅ InitialSchema migration complete.');

    const migration2 = new AddIndexes1708627300000();
    await migration2.up(queryRunner);
    console.log('✅ AddIndexes migration complete.\n');
  } catch (e: any) {
    console.error('❌ Migration failed:', e.message);
    await dataSource.destroy();
    process.exit(1);
  }

  // Step 3: Seed data
  console.log('🌱 Seeding data...');
  try {
    // Dynamically import and run the seed
    const seedModule = await import('./seeds/seed-inline');
    await seedModule.runSeed(queryRunner);
    console.log('\n🎉 Database setup complete!');
    console.log('\n📋 Test accounts (password: Password1):');
    console.log('  alice@commune.dev  — AI Builders owner');
    console.log('  bob@commune.dev    — React Devs owner');
    console.log('  carol@commune.dev  — Designer, member');
    console.log('  dave@commune.dev   — ML engineer, member');
    console.log('  eve@commune.dev    — Startup Studio owner');
  } catch (e: any) {
    console.error('❌ Seeding failed:', e.message);
    console.error(e);
  }

  await dataSource.destroy();
}

setup().catch((error) => {
  console.error(error);
  process.exit(1);
});
