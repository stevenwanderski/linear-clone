ALTER TABLE "issues" DROP CONSTRAINT "issues_assignee_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "issues" DROP COLUMN "assignee_id";