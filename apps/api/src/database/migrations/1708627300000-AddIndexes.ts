import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexes1708627300000 implements MigrationInterface {
  name = 'AddIndexes1708627300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // Auth indexes
    // =============================================
    // Fast login/lookup — partial index excluding soft-deleted
    await queryRunner.query(`
      CREATE INDEX "IDX_users_email_active"
      ON "users" ("email")
      WHERE "deleted_at" IS NULL
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_users_username_active"
      ON "users" ("username")
      WHERE "deleted_at" IS NULL
    `);
    // Session lookup by refresh token (non-expired only)
    await queryRunner.query(`
      CREATE INDEX "IDX_sessions_refresh_token"
      ON "sessions" ("refresh_token")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_sessions_user"
      ON "sessions" ("user_id")
    `);

    // =============================================
    // Community indexes
    // =============================================
    // Slug lookup (partial — active only)
    await queryRunner.query(`
      CREATE INDEX "IDX_communities_slug_active"
      ON "communities" ("slug")
      WHERE "deleted_at" IS NULL
    `);
    // Discovery — sort by member count, filter by visibility
    await queryRunner.query(`
      CREATE INDEX "IDX_communities_discovery"
      ON "communities" ("visibility", "member_count" DESC)
      WHERE "deleted_at" IS NULL
    `);
    // Tag-based search (GIN for array overlap)
    await queryRunner.query(`
      CREATE INDEX "IDX_communities_tags"
      ON "communities" USING GIN ("tags")
      WHERE "deleted_at" IS NULL
    `);

    // =============================================
    // Membership indexes
    // =============================================
    // User's communities (active only)
    await queryRunner.query(`
      CREATE INDEX "IDX_memberships_user_active"
      ON "memberships" ("user_id", "status")
      WHERE "status" = 'active'
    `);
    // Community members (active only)
    await queryRunner.query(`
      CREATE INDEX "IDX_memberships_community_active"
      ON "memberships" ("community_id", "status")
      WHERE "status" = 'active'
    `);

    // =============================================
    // Contribution indexes (heatmap queries)
    // =============================================
    await queryRunner.query(`
      CREATE INDEX "IDX_contributions_user_date"
      ON "contributions" ("user_id", "contributed_at" DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_contributions_community_date"
      ON "contributions" ("community_id", "contributed_at" DESC)
    `);

    // =============================================
    // Task indexes
    // =============================================
    // Board view — community + status + position
    await queryRunner.query(`
      CREATE INDEX "IDX_tasks_board"
      ON "tasks" ("community_id", "status", "position")
      WHERE "deleted_at" IS NULL
    `);
    // Assignee lookup
    await queryRunner.query(`
      CREATE INDEX "IDX_task_assignments_user"
      ON "task_assignments" ("user_id")
    `);
    // Task comments by task
    await queryRunner.query(`
      CREATE INDEX "IDX_task_comments_task"
      ON "task_comments" ("task_id", "created_at" ASC)
      WHERE "deleted_at" IS NULL
    `);

    // =============================================
    // Message indexes
    // =============================================
    // Channel timeline — most recent first
    await queryRunner.query(`
      CREATE INDEX "IDX_messages_channel_timeline"
      ON "messages" ("channel_id", "created_at" DESC)
      WHERE "deleted_at" IS NULL
    `);
    // Thread replies — oldest first
    await queryRunner.query(`
      CREATE INDEX "IDX_messages_thread"
      ON "messages" ("thread_id", "created_at" ASC)
      WHERE "thread_id" IS NOT NULL AND "deleted_at" IS NULL
    `);

    // =============================================
    // Event indexes
    // =============================================
    // Upcoming events
    await queryRunner.query(`
      CREATE INDEX "IDX_events_upcoming"
      ON "events" ("community_id", "starts_at")
      WHERE "status" IN ('published', 'ongoing') AND "deleted_at" IS NULL
    `);

    // =============================================
    // Portfolio indexes
    // =============================================
    await queryRunner.query(`
      CREATE INDEX "IDX_portfolio_entries_visible"
      ON "portfolio_entries" ("portfolio_id", "occurred_at" DESC)
      WHERE "is_visible" = TRUE
    `);

    // =============================================
    // Notification indexes
    // =============================================
    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_user_unread"
      ON "notifications" ("user_id", "created_at" DESC)
      WHERE "is_read" = FALSE
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_user"
      ON "notifications" ("user_id", "created_at" DESC)
    `);

    // =============================================
    // Full-text search indexes (GIN)
    // =============================================
    await queryRunner.query(`
      CREATE INDEX "IDX_communities_fts"
      ON "communities"
      USING GIN (to_tsvector('english', "name" || ' ' || COALESCE("description", '')))
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_tasks_fts"
      ON "tasks"
      USING GIN (to_tsvector('english', "title" || ' ' || COALESCE("description", '')))
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_events_fts"
      ON "events"
      USING GIN (to_tsvector('english', "title" || ' ' || COALESCE("description", '')))
    `);
    // Trigram index for fuzzy username search
    await queryRunner.query(`
      CREATE INDEX "IDX_users_username_trgm"
      ON "users" USING GIN ("username" gin_trgm_ops)
    `);

    // =============================================
    // Vector similarity indexes (IVFFlat)
    // =============================================
    try {
      await queryRunner.query(`
        CREATE INDEX "IDX_user_embeddings_vector"
        ON "user_embeddings"
        USING ivfflat ("embedding" vector_cosine_ops)
        WITH (lists = 100)
      `);
      await queryRunner.query(`
        CREATE INDEX "IDX_community_embeddings_vector"
        ON "community_embeddings"
        USING ivfflat ("embedding" vector_cosine_ops)
        WITH (lists = 100)
      `);
    } catch (e) {
      console.warn('⚠️  Skipping vector indexes (pgvector not available)');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const indexes = [
      'IDX_community_embeddings_vector', 'IDX_user_embeddings_vector',
      'IDX_users_username_trgm',
      'IDX_events_fts', 'IDX_tasks_fts', 'IDX_communities_fts',
      'IDX_notifications_user', 'IDX_notifications_user_unread',
      'IDX_portfolio_entries_visible',
      'IDX_events_upcoming',
      'IDX_messages_thread', 'IDX_messages_channel_timeline',
      'IDX_task_comments_task', 'IDX_task_assignments_user', 'IDX_tasks_board',
      'IDX_contributions_community_date', 'IDX_contributions_user_date',
      'IDX_memberships_community_active', 'IDX_memberships_user_active',
      'IDX_communities_tags', 'IDX_communities_discovery', 'IDX_communities_slug_active',
      'IDX_sessions_user', 'IDX_sessions_refresh_token',
      'IDX_users_username_active', 'IDX_users_email_active',
    ];

    for (const idx of indexes) {
      await queryRunner.query(`DROP INDEX IF EXISTS "${idx}"`);
    }
  }
}
