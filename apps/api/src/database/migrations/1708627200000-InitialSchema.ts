import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1708627200000 implements MigrationInterface {
  name = 'InitialSchema1708627200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // 1. Extensions
    // =============================================
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);

    // pgvector — may not be available in all environments
    try {
      await queryRunner.query(`
        DO $$ BEGIN
          CREATE EXTENSION IF NOT EXISTS "vector";
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE 'pgvector extension not available';
        END $$
      `);
    } catch (e) {
      console.warn('⚠️  pgvector extension not available. Recommendation features will be limited.');
    }

    // =============================================
    // 2. Custom ENUM types
    // =============================================
    await queryRunner.query(`
      CREATE TYPE "auth_provider" AS ENUM ('local', 'google', 'github')
    `);
    await queryRunner.query(`
      CREATE TYPE "community_visibility" AS ENUM ('public', 'private', 'invite_only')
    `);
    await queryRunner.query(`
      CREATE TYPE "membership_status" AS ENUM ('pending', 'active', 'banned')
    `);
    await queryRunner.query(`
      CREATE TYPE "task_status" AS ENUM ('backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled')
    `);
    await queryRunner.query(`
      CREATE TYPE "task_priority" AS ENUM ('low', 'medium', 'high', 'urgent')
    `);
    await queryRunner.query(`
      CREATE TYPE "channel_type" AS ENUM ('text', 'announcement', 'task_linked')
    `);
    await queryRunner.query(`
      CREATE TYPE "event_type" AS ENUM ('online', 'offline', 'hybrid')
    `);
    await queryRunner.query(`
      CREATE TYPE "event_status" AS ENUM ('draft', 'published', 'ongoing', 'completed', 'cancelled')
    `);
    await queryRunner.query(`
      CREATE TYPE "rsvp_status" AS ENUM ('going', 'maybe', 'not_going')
    `);
    await queryRunner.query(`
      CREATE TYPE "portfolio_entry_type" AS ENUM (
        'task_completed', 'event_attended', 'event_organized',
        'community_founded', 'role_held', 'project', 'custom'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "score_type" AS ENUM ('builder', 'mentor', 'organizer')
    `);

    // =============================================
    // 3. Auth Module tables
    // =============================================
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "email"           VARCHAR(255) NOT NULL,
        "username"        VARCHAR(50) NOT NULL,
        "display_name"    VARCHAR(100) NOT NULL,
        "password_hash"   VARCHAR(255),
        "avatar_url"      VARCHAR(500),
        "bio"             TEXT,
        "location"        VARCHAR(100),
        "website"         VARCHAR(500),
        "is_verified"     BOOLEAN NOT NULL DEFAULT FALSE,
        "is_active"       BOOLEAN NOT NULL DEFAULT TRUE,
        "last_login_at"   TIMESTAMPTZ,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"      TIMESTAMPTZ,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_username" UNIQUE ("username")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "oauth_accounts" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"         UUID NOT NULL,
        "provider"        auth_provider NOT NULL,
        "provider_id"     VARCHAR(255) NOT NULL,
        "access_token"    TEXT,
        "refresh_token"   TEXT,
        "expires_at"      TIMESTAMPTZ,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "UQ_oauth_provider_id" UNIQUE ("provider", "provider_id"),
        CONSTRAINT "FK_oauth_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "sessions" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"         UUID NOT NULL,
        "refresh_token"   VARCHAR(500) NOT NULL,
        "user_agent"      TEXT,
        "ip_address"      INET,
        "expires_at"      TIMESTAMPTZ NOT NULL,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "UQ_sessions_refresh_token" UNIQUE ("refresh_token"),
        CONSTRAINT "FK_sessions_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // =============================================
    // 4. Community Module tables
    // =============================================
    await queryRunner.query(`
      CREATE TABLE "communities" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name"            VARCHAR(100) NOT NULL,
        "slug"            VARCHAR(100) NOT NULL,
        "description"     TEXT,
        "avatar_url"      VARCHAR(500),
        "banner_url"      VARCHAR(500),
        "visibility"      community_visibility NOT NULL DEFAULT 'public',
        "owner_id"        UUID NOT NULL,
        "member_count"    INTEGER NOT NULL DEFAULT 0,
        "tags"            VARCHAR(50)[] DEFAULT '{}',
        "settings"        JSONB NOT NULL DEFAULT '{}',
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"      TIMESTAMPTZ,
        CONSTRAINT "UQ_communities_slug" UNIQUE ("slug"),
        CONSTRAINT "FK_communities_owner" FOREIGN KEY ("owner_id")
          REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "community_id"    UUID NOT NULL,
        "name"            VARCHAR(50) NOT NULL,
        "color"           VARCHAR(7),
        "permissions"     JSONB NOT NULL DEFAULT '{}',
        "position"        INTEGER NOT NULL DEFAULT 0,
        "is_default"      BOOLEAN NOT NULL DEFAULT FALSE,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "UQ_roles_community_name" UNIQUE ("community_id", "name"),
        CONSTRAINT "FK_roles_community" FOREIGN KEY ("community_id")
          REFERENCES "communities"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "memberships" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"         UUID NOT NULL,
        "community_id"    UUID NOT NULL,
        "role_id"         UUID NOT NULL,
        "status"          membership_status NOT NULL DEFAULT 'active',
        "contribution_count" INTEGER NOT NULL DEFAULT 0,
        "joined_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "UQ_memberships_user_community" UNIQUE ("user_id", "community_id"),
        CONSTRAINT "FK_memberships_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_memberships_community" FOREIGN KEY ("community_id")
          REFERENCES "communities"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_memberships_role" FOREIGN KEY ("role_id")
          REFERENCES "roles"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "contributions" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"         UUID NOT NULL,
        "community_id"    UUID NOT NULL,
        "type"            VARCHAR(30) NOT NULL,
        "weight"          SMALLINT NOT NULL DEFAULT 1,
        "contributed_at"  DATE NOT NULL DEFAULT CURRENT_DATE,
        "metadata"        JSONB DEFAULT '{}',
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "FK_contributions_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_contributions_community" FOREIGN KEY ("community_id")
          REFERENCES "communities"("id") ON DELETE CASCADE
      )
    `);

    // =============================================
    // 5. Collaboration Module tables
    // =============================================
    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "community_id"    UUID NOT NULL,
        "title"           VARCHAR(255) NOT NULL,
        "description"     TEXT,
        "status"          task_status NOT NULL DEFAULT 'backlog',
        "priority"        task_priority NOT NULL DEFAULT 'medium',
        "creator_id"      UUID NOT NULL,
        "due_date"        TIMESTAMPTZ,
        "completed_at"    TIMESTAMPTZ,
        "position"        INTEGER NOT NULL DEFAULT 0,
        "tags"            VARCHAR(50)[] DEFAULT '{}',
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"      TIMESTAMPTZ,
        CONSTRAINT "FK_tasks_community" FOREIGN KEY ("community_id")
          REFERENCES "communities"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tasks_creator" FOREIGN KEY ("creator_id")
          REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "task_assignments" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "task_id"         UUID NOT NULL,
        "user_id"         UUID NOT NULL,
        "assigned_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "UQ_task_assignments" UNIQUE ("task_id", "user_id"),
        CONSTRAINT "FK_task_assignments_task" FOREIGN KEY ("task_id")
          REFERENCES "tasks"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_task_assignments_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "task_comments" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "task_id"         UUID NOT NULL,
        "author_id"       UUID NOT NULL,
        "content"         TEXT NOT NULL,
        "parent_id"       UUID,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"      TIMESTAMPTZ,
        CONSTRAINT "FK_task_comments_task" FOREIGN KEY ("task_id")
          REFERENCES "tasks"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_task_comments_author" FOREIGN KEY ("author_id")
          REFERENCES "users"("id"),
        CONSTRAINT "FK_task_comments_parent" FOREIGN KEY ("parent_id")
          REFERENCES "task_comments"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "attachments" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "task_id"         UUID,
        "message_id"      UUID,
        "uploader_id"     UUID NOT NULL,
        "filename"        VARCHAR(255) NOT NULL,
        "file_url"        VARCHAR(500) NOT NULL,
        "file_size"       BIGINT NOT NULL,
        "mime_type"       VARCHAR(100) NOT NULL,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "FK_attachments_task" FOREIGN KEY ("task_id")
          REFERENCES "tasks"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_attachments_uploader" FOREIGN KEY ("uploader_id")
          REFERENCES "users"("id")
      )
    `);

    // =============================================
    // 6. Messaging Module tables
    // =============================================
    await queryRunner.query(`
      CREATE TABLE "channels" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "community_id"    UUID NOT NULL,
        "name"            VARCHAR(100) NOT NULL,
        "description"     TEXT,
        "type"            channel_type NOT NULL DEFAULT 'text',
        "linked_task_id"  UUID,
        "is_archived"     BOOLEAN NOT NULL DEFAULT FALSE,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "FK_channels_community" FOREIGN KEY ("community_id")
          REFERENCES "communities"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_channels_task" FOREIGN KEY ("linked_task_id")
          REFERENCES "tasks"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "channel_id"      UUID NOT NULL,
        "author_id"       UUID NOT NULL,
        "content"         TEXT NOT NULL,
        "thread_id"       UUID,
        "is_pinned"       BOOLEAN NOT NULL DEFAULT FALSE,
        "is_edited"       BOOLEAN NOT NULL DEFAULT FALSE,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"      TIMESTAMPTZ,
        CONSTRAINT "FK_messages_channel" FOREIGN KEY ("channel_id")
          REFERENCES "channels"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_messages_author" FOREIGN KEY ("author_id")
          REFERENCES "users"("id"),
        CONSTRAINT "FK_messages_thread" FOREIGN KEY ("thread_id")
          REFERENCES "messages"("id")
      )
    `);

    // Deferred FK for attachments → messages
    await queryRunner.query(`
      ALTER TABLE "attachments"
        ADD CONSTRAINT "FK_attachments_message"
        FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE
    `);

    // =============================================
    // 7. Event Module tables
    // =============================================
    await queryRunner.query(`
      CREATE TABLE "events" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "community_id"    UUID NOT NULL,
        "title"           VARCHAR(255) NOT NULL,
        "description"     TEXT,
        "type"            event_type NOT NULL,
        "status"          event_status NOT NULL DEFAULT 'draft',
        "organizer_id"    UUID NOT NULL,
        "location"        VARCHAR(500),
        "meeting_url"     VARCHAR(500),
        "starts_at"       TIMESTAMPTZ NOT NULL,
        "ends_at"         TIMESTAMPTZ NOT NULL,
        "max_attendees"   INTEGER,
        "rsvp_count"      INTEGER NOT NULL DEFAULT 0,
        "tags"            VARCHAR(50)[] DEFAULT '{}',
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"      TIMESTAMPTZ,
        CONSTRAINT "FK_events_community" FOREIGN KEY ("community_id")
          REFERENCES "communities"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_events_organizer" FOREIGN KEY ("organizer_id")
          REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "rsvps" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "event_id"        UUID NOT NULL,
        "user_id"         UUID NOT NULL,
        "status"          rsvp_status NOT NULL DEFAULT 'going',
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "UQ_rsvps_event_user" UNIQUE ("event_id", "user_id"),
        CONSTRAINT "FK_rsvps_event" FOREIGN KEY ("event_id")
          REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_rsvps_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "attendance" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "event_id"        UUID NOT NULL,
        "user_id"         UUID NOT NULL,
        "checked_in_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "UQ_attendance_event_user" UNIQUE ("event_id", "user_id"),
        CONSTRAINT "FK_attendance_event" FOREIGN KEY ("event_id")
          REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_attendance_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "event_feedback" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "event_id"        UUID NOT NULL,
        "user_id"         UUID NOT NULL,
        "rating"          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        "comment"         TEXT,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "UQ_event_feedback_event_user" UNIQUE ("event_id", "user_id"),
        CONSTRAINT "FK_event_feedback_event" FOREIGN KEY ("event_id")
          REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_event_feedback_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // =============================================
    // 8. Portfolio Module tables
    // =============================================
    await queryRunner.query(`
      CREATE TABLE "portfolios" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"         UUID NOT NULL UNIQUE,
        "headline"        VARCHAR(200),
        "summary"         TEXT,
        "theme"           JSONB NOT NULL DEFAULT '{"color": "#6C5CE7"}',
        "is_public"       BOOLEAN NOT NULL DEFAULT TRUE,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "FK_portfolios_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "portfolio_entries" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "portfolio_id"    UUID NOT NULL,
        "type"            portfolio_entry_type NOT NULL,
        "title"           VARCHAR(255) NOT NULL,
        "description"     TEXT,
        "community_id"    UUID,
        "source_id"       UUID,
        "is_auto"         BOOLEAN NOT NULL DEFAULT TRUE,
        "is_visible"      BOOLEAN NOT NULL DEFAULT TRUE,
        "occurred_at"     TIMESTAMPTZ NOT NULL,
        "metadata"        JSONB DEFAULT '{}',
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "FK_portfolio_entries_portfolio" FOREIGN KEY ("portfolio_id")
          REFERENCES "portfolios"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_portfolio_entries_community" FOREIGN KEY ("community_id")
          REFERENCES "communities"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "user_skills" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"         UUID NOT NULL,
        "name"            VARCHAR(50) NOT NULL,
        "level"           SMALLINT NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 5),
        "is_auto"         BOOLEAN NOT NULL DEFAULT FALSE,
        "source"          VARCHAR(50),
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "UQ_user_skills_user_name" UNIQUE ("user_id", "name"),
        CONSTRAINT "FK_user_skills_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // =============================================
    // 9. Intelligence Layer tables
    // =============================================
    await queryRunner.query(`
      CREATE TABLE "reputation_scores" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"         UUID NOT NULL,
        "type"            score_type NOT NULL,
        "score"           NUMERIC(8,2) NOT NULL DEFAULT 0,
        "breakdown"       JSONB NOT NULL DEFAULT '{}',
        "calculated_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "UQ_reputation_user_type" UNIQUE ("user_id", "type"),
        CONSTRAINT "FK_reputation_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"         UUID NOT NULL,
        "type"            VARCHAR(50) NOT NULL,
        "title"           VARCHAR(255) NOT NULL,
        "message"         TEXT,
        "data"            JSONB NOT NULL DEFAULT '{}',
        "is_read"         BOOLEAN NOT NULL DEFAULT FALSE,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "FK_notifications_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Vector embedding tables (only if pgvector is available)
    try {
      await queryRunner.query(`
        CREATE TABLE "user_embeddings" (
          "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "user_id"       UUID NOT NULL UNIQUE,
          "embedding"     vector(384) NOT NULL,
          "source_text"   TEXT,
          "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT "FK_user_embeddings_user" FOREIGN KEY ("user_id")
            REFERENCES "users"("id") ON DELETE CASCADE
        )
      `);

      await queryRunner.query(`
        CREATE TABLE "community_embeddings" (
          "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "community_id"  UUID NOT NULL UNIQUE,
          "embedding"     vector(384) NOT NULL,
          "source_text"   TEXT,
          "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT "FK_community_embeddings_community" FOREIGN KEY ("community_id")
            REFERENCES "communities"("id") ON DELETE CASCADE
        )
      `);
    } catch (e) {
      console.warn('⚠️  Skipping vector embedding tables (pgvector not available)');
    }

    // =============================================
    // 10. Auto-update trigger for updated_at
    // =============================================
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION trigger_set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    // Apply updated_at trigger to all tables with that column
    const tablesWithUpdatedAt = [
      'users', 'communities', 'memberships', 'tasks', 'task_comments',
      'channels', 'messages', 'events', 'rsvps', 'portfolios',
    ];

    for (const table of tablesWithUpdatedAt) {
      await queryRunner.query(`
        CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON "${table}"
        FOR EACH ROW
        EXECUTE FUNCTION trigger_set_updated_at()
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse dependency order
    const tables = [
      'community_embeddings', 'user_embeddings',
      'notifications', 'reputation_scores',
      'user_skills', 'portfolio_entries', 'portfolios',
      'event_feedback', 'attendance', 'rsvps', 'events',
      'messages', 'channels',
      'attachments', 'task_comments', 'task_assignments', 'tasks',
      'contributions', 'memberships', 'roles', 'communities',
      'sessions', 'oauth_accounts', 'users',
    ];

    for (const table of tables) {
      await queryRunner.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    }

    // Drop trigger function
    await queryRunner.query(`DROP FUNCTION IF EXISTS trigger_set_updated_at() CASCADE`);

    // Drop custom types
    const types = [
      'score_type', 'portfolio_entry_type', 'rsvp_status',
      'event_status', 'event_type', 'channel_type',
      'task_priority', 'task_status', 'membership_status',
      'community_visibility', 'auth_provider',
    ];

    for (const type of types) {
      await queryRunner.query(`DROP TYPE IF EXISTS "${type}" CASCADE`);
    }
  }
}
