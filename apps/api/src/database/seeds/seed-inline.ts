import type { QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * Seeds the database with development data.
 * This is an importable function (used by setup.ts).
 */
export async function runSeed(queryRunner: QueryRunner) {
  try {
    await queryRunner.startTransaction();

    // =============================================
    // 1. Users
    // =============================================
    const passwordHash = await bcrypt.hash('Password1', 12);

    const users = await queryRunner.query(`
      INSERT INTO "users" ("id", "email", "username", "display_name", "password_hash", "bio", "location", "is_verified")
      VALUES
        ('a0000000-0000-0000-0000-000000000001', 'alice@commune.dev', 'alice', 'Alice Chen', $1, 'Full-stack developer & community builder. Passionate about open source and AI.', 'San Francisco, CA', true),
        ('a0000000-0000-0000-0000-000000000002', 'bob@commune.dev', 'bob_dev', 'Bob Martinez', $1, 'Backend engineer. Rust & Go enthusiast. Building scalable systems.', 'Austin, TX', true),
        ('a0000000-0000-0000-0000-000000000003', 'carol@commune.dev', 'carol_designs', 'Carol Park', $1, 'Product designer & UX researcher. Making tech more human.', 'New York, NY', true),
        ('a0000000-0000-0000-0000-000000000004', 'dave@commune.dev', 'dave_ml', 'Dave Okonkwo', $1, 'Machine learning engineer. NLP & computer vision. Ex-Google.', 'London, UK', false),
        ('a0000000-0000-0000-0000-000000000005', 'eve@commune.dev', 'eve_pm', 'Eve Johnson', $1, 'Technical PM. Bridging engineering and business. Startup advisor.', 'Seattle, WA', true)
      RETURNING "id"
    `, [passwordHash]);

    console.log(`✅ Created ${users.length} users`);

    // =============================================
    // 2. Communities
    // =============================================
    const communities = await queryRunner.query(`
      INSERT INTO "communities" ("id", "name", "slug", "description", "visibility", "owner_id", "member_count", "tags")
      VALUES
        ('c0000000-0000-0000-0000-000000000001', 'AI Builders', 'ai-builders', 'A community for people building with AI. Share projects, collaborate on research, and push the boundaries of what''s possible.', 'public', 'a0000000-0000-0000-0000-000000000001', 4, ARRAY['ai', 'machine-learning', 'deep-learning', 'nlp']),
        ('c0000000-0000-0000-0000-000000000002', 'React Devs', 'react-devs', 'Modern React development — hooks, server components, Next.js, and everything in between. Ship better UIs together.', 'public', 'a0000000-0000-0000-0000-000000000002', 3, ARRAY['react', 'nextjs', 'typescript', 'frontend']),
        ('c0000000-0000-0000-0000-000000000003', 'Startup Studio', 'startup-studio', 'From idea to launch. A private community for founders building their next venture. Weekly pitch sessions and mentorship.', 'private', 'a0000000-0000-0000-0000-000000000005', 2, ARRAY['startups', 'entrepreneurship', 'fundraising']),
        ('c0000000-0000-0000-0000-000000000004', 'Rust Enthusiasts', 'rust-enthusiasts', 'Zero-cost abstractions and blazingly fast software. Memory safety without garbage collection.', 'public', 'a0000000-0000-0000-0000-000000000002', 2, ARRAY['rust', 'systems', 'wasm', 'performance']),
        ('c0000000-0000-0000-0000-000000000005', 'Design Systems', 'design-systems', 'Scalable design systems with Figma, Storybook, and design tokens. Building consistent UI at scale.', 'public', 'a0000000-0000-0000-0000-000000000003', 3, ARRAY['design', 'ui', 'figma', 'tokens']),
        ('c0000000-0000-0000-0000-000000000006', 'DevOps Guild', 'devops-guild', 'CI/CD, Kubernetes, infrastructure as code, and cloud-native tooling. Shipping faster, together.', 'public', 'a0000000-0000-0000-0000-000000000004', 2, ARRAY['devops', 'k8s', 'docker', 'cloud'])
      RETURNING "id"
    `);

    console.log(`✅ Created ${communities.length} communities`);

    // =============================================
    // 3. Roles (3 per community: Owner, Moderator, Member)
    // =============================================
    const communityIds = [
      'c0000000-0000-0000-0000-000000000001',
      'c0000000-0000-0000-0000-000000000002',
      'c0000000-0000-0000-0000-000000000003',
      'c0000000-0000-0000-0000-000000000004',
      'c0000000-0000-0000-0000-000000000005',
      'c0000000-0000-0000-0000-000000000006',
    ];

    for (const cid of communityIds) {
      await queryRunner.query(`
        INSERT INTO "roles" ("id", "community_id", "name", "color", "position", "is_default", "permissions")
        VALUES
          (gen_random_uuid(), $1, 'Owner', '#e74c3c', 100, false,
           '{"manage_community": true, "manage_roles": true, "manage_members": true, "manage_tasks": true, "manage_events": true, "manage_channels": true}'),
          (gen_random_uuid(), $1, 'Moderator', '#3498db', 50, false,
           '{"manage_members": true, "manage_tasks": true, "manage_events": true, "manage_channels": true}'),
          (gen_random_uuid(), $1, 'Member', '#2ecc71', 10, true,
           '{"create_tasks": true, "create_events": true, "send_messages": true}')
      `, [cid]);
    }
    console.log(`✅ Created roles for all communities`);

    // =============================================
    // 4. Memberships
    // =============================================
    // Helper to get role IDs
    const getRole = async (communityId: string, roleName: string) => {
      const result = await queryRunner.query(
        `SELECT id FROM roles WHERE community_id = $1 AND name = $2`, [communityId, roleName]
      );
      return result[0].id;
    };

    // AI Builders: Alice (owner), Bob, Dave, Carol
    const aiOwner = await getRole('c0000000-0000-0000-0000-000000000001', 'Owner');
    const aiMember = await getRole('c0000000-0000-0000-0000-000000000001', 'Member');
    await queryRunner.query(`
      INSERT INTO "memberships" ("user_id", "community_id", "role_id", "status") VALUES
        ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', $1, 'active'),
        ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', $2, 'active'),
        ('a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', $2, 'active'),
        ('a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', $2, 'active')
    `, [aiOwner, aiMember]);

    // React Devs: Bob (owner), Alice, Carol
    const reactOwner = await getRole('c0000000-0000-0000-0000-000000000002', 'Owner');
    const reactMember = await getRole('c0000000-0000-0000-0000-000000000002', 'Member');
    await queryRunner.query(`
      INSERT INTO "memberships" ("user_id", "community_id", "role_id", "status") VALUES
        ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', $1, 'active'),
        ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', $2, 'active'),
        ('a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', $2, 'active')
    `, [reactOwner, reactMember]);

    // Startup Studio: Eve (owner), Alice
    const startupOwner = await getRole('c0000000-0000-0000-0000-000000000003', 'Owner');
    const startupMember = await getRole('c0000000-0000-0000-0000-000000000003', 'Member');
    await queryRunner.query(`
      INSERT INTO "memberships" ("user_id", "community_id", "role_id", "status") VALUES
        ('a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000003', $1, 'active'),
        ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', $2, 'active')
    `, [startupOwner, startupMember]);

    // Rust Enthusiasts: Bob (owner), Dave
    const rustOwner = await getRole('c0000000-0000-0000-0000-000000000004', 'Owner');
    const rustMember = await getRole('c0000000-0000-0000-0000-000000000004', 'Member');
    await queryRunner.query(`
      INSERT INTO "memberships" ("user_id", "community_id", "role_id", "status") VALUES
        ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000004', $1, 'active'),
        ('a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', $2, 'active')
    `, [rustOwner, rustMember]);

    // Design Systems: Carol (owner), Alice, Eve
    const designOwner = await getRole('c0000000-0000-0000-0000-000000000005', 'Owner');
    const designMember = await getRole('c0000000-0000-0000-0000-000000000005', 'Member');
    await queryRunner.query(`
      INSERT INTO "memberships" ("user_id", "community_id", "role_id", "status") VALUES
        ('a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000005', $1, 'active'),
        ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', $2, 'active'),
        ('a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000005', $2, 'active')
    `, [designOwner, designMember]);

    // DevOps Guild: Dave (owner), Bob
    const devopsOwner = await getRole('c0000000-0000-0000-0000-000000000006', 'Owner');
    const devopsMember = await getRole('c0000000-0000-0000-0000-000000000006', 'Member');
    await queryRunner.query(`
      INSERT INTO "memberships" ("user_id", "community_id", "role_id", "status") VALUES
        ('a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000006', $1, 'active'),
        ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000006', $2, 'active')
    `, [devopsOwner, devopsMember]);

    console.log(`✅ Created memberships`);

    // =============================================
    // 5. Tasks
    // =============================================
    await queryRunner.query(`
      INSERT INTO "tasks" ("id", "community_id", "title", "description", "status", "priority", "creator_id", "position", "tags", "due_date")
      VALUES
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'Set up model training pipeline', 'Configure PyTorch training pipeline with distributed data parallel.', 'in_progress', 'high', 'a0000000-0000-0000-0000-000000000001', 1, ARRAY['infrastructure', 'ml'], NOW() + INTERVAL '7 days'),
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'Implement RAG retrieval layer', 'Build the retrieval-augmented generation layer using pgvector.', 'todo', 'high', 'a0000000-0000-0000-0000-000000000004', 2, ARRAY['rag', 'ai'], NOW() + INTERVAL '14 days'),
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'Write project README', 'Create comprehensive documentation for the AI project.', 'done', 'medium', 'a0000000-0000-0000-0000-000000000001', 3, ARRAY['docs'], NULL),
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'Design evaluation benchmarks', 'Define accuracy, latency, and cost metrics.', 'backlog', 'medium', 'a0000000-0000-0000-0000-000000000002', 4, ARRAY['ml', 'evaluation'], NULL),
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'Migrate to React Server Components', 'Refactor dashboard pages to use RSC for better performance.', 'in_progress', 'high', 'a0000000-0000-0000-0000-000000000002', 1, ARRAY['react', 'performance'], NOW() + INTERVAL '10 days'),
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'Build component library docs', 'Create Storybook documentation for shared UI components.', 'todo', 'medium', 'a0000000-0000-0000-0000-000000000003', 2, ARRAY['docs', 'ui'], NOW() + INTERVAL '21 days'),
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'Add E2E tests for auth flow', 'Playwright tests covering login, register, OAuth.', 'backlog', 'low', 'a0000000-0000-0000-0000-000000000002', 3, ARRAY['testing'], NULL),
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000004', 'Implement async runtime benchmarks', 'Compare tokio vs async-std performance.', 'todo', 'high', 'a0000000-0000-0000-0000-000000000002', 1, ARRAY['rust', 'async'], NOW() + INTERVAL '12 days'),
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', 'Create design token system', 'Set up design tokens for colors, spacing, and typography.', 'in_progress', 'high', 'a0000000-0000-0000-0000-000000000003', 1, ARRAY['design', 'tokens'], NOW() + INTERVAL '5 days'),
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000006', 'Set up GitOps pipeline', 'ArgoCD deployment with Kustomize overlays.', 'todo', 'medium', 'a0000000-0000-0000-0000-000000000004', 1, ARRAY['gitops', 'k8s'], NOW() + INTERVAL '15 days')
    `);
    console.log(`✅ Created 10 tasks`);

    // =============================================
    // 6. Channels
    // =============================================
    await queryRunner.query(`
      INSERT INTO "channels" ("id", "community_id", "name", "description", "type")
      VALUES
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'general', 'General discussion for AI Builders', 'text'),
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'announcements', 'Important updates', 'announcement'),
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'research-papers', 'Share and discuss interesting papers', 'text'),
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'general', 'General React discussion', 'text'),
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'help', 'Ask for help with React problems', 'text'),
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003', 'general', 'Startup Studio general', 'text'),
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003', 'pitch-prep', 'Prepare and review your pitch deck', 'text'),
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000004', 'general', 'Rust discussion', 'text'),
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', 'general', 'Design Systems discussion', 'text'),
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000006', 'general', 'DevOps Guild discussion', 'text')
    `);
    console.log(`✅ Created 10 channels`);

    // =============================================
    // 7. Events
    // =============================================
    await queryRunner.query(`
      INSERT INTO "events" ("id", "community_id", "title", "description", "type", "status", "organizer_id", "starts_at", "ends_at", "max_attendees", "tags", "meeting_url")
      VALUES
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'LLM Fine-tuning Workshop', 'Hands-on workshop on fine-tuning LLMs with LoRA and QLoRA.', 'online', 'published', 'a0000000-0000-0000-0000-000000000001', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 2 hours', 50, ARRAY['workshop', 'llm'], 'https://meet.commune.dev/llm-workshop'),
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'AI Demo Day', 'Show off what you''ve built! Each team gets 10 minutes.', 'hybrid', 'published', 'a0000000-0000-0000-0000-000000000004', NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days 3 hours', 100, ARRAY['demo', 'showcase'], 'https://meet.commune.dev/demo-day'),
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'React 19 Deep Dive', 'Exploring React 19 features — use(Promise), server actions, and the new compiler.', 'online', 'published', 'a0000000-0000-0000-0000-000000000002', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 1 hour', 200, ARRAY['react', 'webdev'], 'https://meet.commune.dev/react19'),
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000004', 'Rust Meetup: Error Handling Patterns', 'Deep dive into Result, Option, and custom error types.', 'online', 'published', 'a0000000-0000-0000-0000-000000000002', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days 1 hour 30 minutes', 75, ARRAY['rust', 'patterns'], 'https://meet.commune.dev/rust-errors'),
        (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', 'Design Tokens Workshop', 'Build a design token pipeline from Figma to code.', 'online', 'published', 'a0000000-0000-0000-0000-000000000003', NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days 2 hours', 40, ARRAY['design', 'tokens'], 'https://meet.commune.dev/tokens-workshop')
    `);
    console.log(`✅ Created 5 events`);

    // =============================================
    // 8. Contributions (heatmap data — last 90 days)
    // =============================================
    const contributionTypes = ['task_completed', 'event_attended', 'code_review', 'discussion'];
    const userIds = [
      'a0000000-0000-0000-0000-000000000001',
      'a0000000-0000-0000-0000-000000000002',
      'a0000000-0000-0000-0000-000000000003',
      'a0000000-0000-0000-0000-000000000004',
    ];

    const contribValues: string[] = [];
    for (const userId of userIds) {
      for (let daysAgo = 0; daysAgo < 90; daysAgo++) {
        if (Math.random() < 0.6) {
          const type = contributionTypes[Math.floor(Math.random() * contributionTypes.length)];
          const weight = Math.floor(Math.random() * 3) + 1;
          contribValues.push(
            `('${userId}', 'c0000000-0000-0000-0000-000000000001', '${type}', ${weight}, CURRENT_DATE - INTERVAL '${daysAgo} days')`
          );
        }
      }
    }

    if (contribValues.length > 0) {
      await queryRunner.query(`
        INSERT INTO "contributions" ("user_id", "community_id", "type", "weight", "contributed_at")
        VALUES ${contribValues.join(',\n')}
      `);
    }
    console.log(`✅ Created ${contribValues.length} contribution records`);

    // =============================================
    // 9. Portfolios & Skills
    // =============================================
    await queryRunner.query(`
      INSERT INTO "portfolios" ("user_id", "headline", "summary", "is_public")
      VALUES
        ('a0000000-0000-0000-0000-000000000001', 'Full-Stack AI Engineer', 'Building at the intersection of web and AI. 5+ years shipping production ML systems.', true),
        ('a0000000-0000-0000-0000-000000000002', 'Backend Systems Architect', 'Designing and building distributed systems that scale. Open source contributor.', true),
        ('a0000000-0000-0000-0000-000000000003', 'Product Designer', 'Creating delightful user experiences. Design systems advocate.', true),
        ('a0000000-0000-0000-0000-000000000004', 'ML Research Engineer', 'Pushing the boundaries of NLP and computer vision. Published researcher.', true),
        ('a0000000-0000-0000-0000-000000000005', 'Technical Product Manager', 'Shipping products users love. Y Combinator alumni mentor.', true)
    `);

    await queryRunner.query(`
      INSERT INTO "user_skills" ("user_id", "name", "level", "is_auto")
      VALUES
        ('a0000000-0000-0000-0000-000000000001', 'TypeScript', 5, false),
        ('a0000000-0000-0000-0000-000000000001', 'Python', 4, false),
        ('a0000000-0000-0000-0000-000000000001', 'React', 5, false),
        ('a0000000-0000-0000-0000-000000000001', 'Machine Learning', 4, false),
        ('a0000000-0000-0000-0000-000000000002', 'Go', 5, false),
        ('a0000000-0000-0000-0000-000000000002', 'Rust', 4, false),
        ('a0000000-0000-0000-0000-000000000002', 'PostgreSQL', 5, false),
        ('a0000000-0000-0000-0000-000000000002', 'React', 4, false),
        ('a0000000-0000-0000-0000-000000000003', 'Figma', 5, false),
        ('a0000000-0000-0000-0000-000000000003', 'CSS', 5, false),
        ('a0000000-0000-0000-0000-000000000003', 'User Research', 4, false),
        ('a0000000-0000-0000-0000-000000000004', 'PyTorch', 5, false),
        ('a0000000-0000-0000-0000-000000000004', 'NLP', 5, false),
        ('a0000000-0000-0000-0000-000000000004', 'Computer Vision', 4, false),
        ('a0000000-0000-0000-0000-000000000005', 'Product Strategy', 5, false),
        ('a0000000-0000-0000-0000-000000000005', 'Agile', 4, false)
    `);
    console.log(`✅ Created portfolios and skills`);

    // =============================================
    // 10. Reputation Scores
    // =============================================
    await queryRunner.query(`
      INSERT INTO "reputation_scores" ("user_id", "type", "score", "breakdown")
      VALUES
        ('a0000000-0000-0000-0000-000000000001', 'builder', 845, '{"tasks_completed": 32, "projects_shipped": 3, "code_contributions": 128}'),
        ('a0000000-0000-0000-0000-000000000001', 'mentor', 320, '{"task_comments_helpful": 45, "thread_replies": 89, "onboarding_assists": 5}'),
        ('a0000000-0000-0000-0000-000000000001', 'organizer', 210, '{"events_organized": 8, "avg_event_rating": 4.5}'),
        ('a0000000-0000-0000-0000-000000000002', 'builder', 720, '{"tasks_completed": 28, "projects_shipped": 2, "code_contributions": 95}'),
        ('a0000000-0000-0000-0000-000000000002', 'mentor', 580, '{"task_comments_helpful": 72, "thread_replies": 156}'),
        ('a0000000-0000-0000-0000-000000000004', 'builder', 650, '{"tasks_completed": 22, "projects_shipped": 4, "code_contributions": 67}'),
        ('a0000000-0000-0000-0000-000000000005', 'organizer', 890, '{"events_organized": 24, "avg_event_rating": 4.8, "communities_founded": 2}')
    `);
    console.log(`✅ Created reputation scores`);

    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  }
}
