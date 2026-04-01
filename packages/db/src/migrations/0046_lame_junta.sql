CREATE TABLE "agent_memory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"category" text DEFAULT 'memory' NOT NULL,
	"key" text NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb,
	"importance" integer DEFAULT 50 NOT NULL,
	"source_run_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_memory" ADD CONSTRAINT "agent_memory_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_memory" ADD CONSTRAINT "agent_memory_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agent_memory_company_agent_category_idx" ON "agent_memory" USING btree ("company_id","agent_id","category");--> statement-breakpoint
CREATE INDEX "agent_memory_company_agent_key_idx" ON "agent_memory" USING btree ("company_id","agent_id","key");--> statement-breakpoint
CREATE INDEX "agent_memory_importance_idx" ON "agent_memory" USING btree ("company_id","agent_id","importance");