import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFriendshipsAndFixChannels1708627400000 implements MigrationInterface {
  name = 'AddFriendshipsAndFixChannels1708627400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add 'dm' to channel_type enum
    await queryRunner.query(`
      ALTER TYPE "channel_type" ADD VALUE IF NOT EXISTS 'dm'
    `);

    // 2. Make channels.community_id nullable (needed for DM channels)
    await queryRunner.query(`
      ALTER TABLE "channels" ALTER COLUMN "community_id" DROP NOT NULL
    `);

    // 3. Create friendship_status enum
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "friendship_status" AS ENUM ('pending', 'accepted', 'declined', 'blocked');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$
    `);

    // 4. Create friendships table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "friendships" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "requester_id"    UUID NOT NULL,
        "addressee_id"    UUID NOT NULL,
        "status"          friendship_status NOT NULL DEFAULT 'pending',
        "dm_channel_id"   UUID,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "FK_friendships_requester" FOREIGN KEY ("requester_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_friendships_addressee" FOREIGN KEY ("addressee_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_friendships_dm_channel" FOREIGN KEY ("dm_channel_id")
          REFERENCES "channels"("id") ON DELETE SET NULL,
        CONSTRAINT "UQ_friendships_pair" UNIQUE ("requester_id", "addressee_id")
      )
    `);

    // 5. Indexes for friendships
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_friendships_requester"
      ON "friendships" ("requester_id", "status")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_friendships_addressee"
      ON "friendships" ("addressee_id", "status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "friendships"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "friendship_status"`);
    await queryRunner.query(`
      ALTER TABLE "channels" ALTER COLUMN "community_id" SET NOT NULL
    `);
    // Cannot remove enum value from PostgreSQL, would need to recreate
  }
}
