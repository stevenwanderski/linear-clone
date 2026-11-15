-- Give every project an owner. Existing projects go to whoever created their first issue, or, for a project
-- with no issues, to the oldest user. (When this ran there was only one user, who owned everything.)
ALTER TABLE "projects" ADD COLUMN "owner_id" text;--> statement-breakpoint
UPDATE "projects" p SET "owner_id" = COALESCE(
  (SELECT i."creator_id" FROM "issues" i WHERE i."project_id" = p."id" ORDER BY i."number" LIMIT 1),
  (SELECT u."id" FROM "user" u ORDER BY u."created_at" LIMIT 1)
);--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "owner_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- Keys are now unique per owner, not across everyone.
ALTER TABLE "projects" DROP CONSTRAINT "projects_key_unique";--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_key_unique" UNIQUE("owner_id","key");
