-- ==========================================================================
-- Hermes Cloud Worker — Supabase Persistence Layer (Standalone)
-- Tables: hermes_sessions, hermes_memory, hermes_usage
-- 
-- Standalone RLS: company_id-based isolation via JWT claims.
-- No external table dependencies.
-- ==========================================================================

-- -------------------------------------------------------------------------
-- 1. hermes_sessions — Agent session state persistence
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hermes_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  agent_id UUID NOT NULL,
  profile_name TEXT NOT NULL,
  session_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hermes_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access sessions for their own company (via JWT claims)
CREATE POLICY "hermes_sessions_select_own"
  ON public.hermes_sessions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Service role (worker) can do everything
CREATE POLICY "hermes_sessions_service_all"
  ON public.hermes_sessions FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_hermes_sessions_company 
  ON public.hermes_sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_hermes_sessions_agent 
  ON public.hermes_sessions(agent_id);

-- -------------------------------------------------------------------------
-- 2. hermes_memory — Agent memory key-value store
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hermes_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  agent_id UUID NOT NULL,
  memory_key TEXT NOT NULL,
  memory_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agent_id, memory_key)
);

ALTER TABLE public.hermes_memory ENABLE ROW LEVEL SECURITY;

-- Users can access their own memory
CREATE POLICY "hermes_memory_select_own"
  ON public.hermes_memory FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Service role (worker) can do everything
CREATE POLICY "hermes_memory_service_all"
  ON public.hermes_memory FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_hermes_memory_company 
  ON public.hermes_memory(company_id);
CREATE INDEX IF NOT EXISTS idx_hermes_memory_agent 
  ON public.hermes_memory(agent_id);

-- -------------------------------------------------------------------------
-- 3. hermes_usage — Run cost tracking (10x markup billing)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hermes_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  agent_id UUID NOT NULL,
  run_id UUID NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_cost_usd NUMERIC(10,6) DEFAULT 0,
  markup_multiplier NUMERIC(4,2) DEFAULT 10.0,
  billed_cost_usd NUMERIC(10,6) DEFAULT 0,
  duration_ms INTEGER DEFAULT 0,
  iterations INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hermes_usage ENABLE ROW LEVEL SECURITY;

-- Users can read their own usage
CREATE POLICY "hermes_usage_select_own"
  ON public.hermes_usage FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Service role (worker) can do everything
CREATE POLICY "hermes_usage_service_all"
  ON public.hermes_usage FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_hermes_usage_company 
  ON public.hermes_usage(company_id);
CREATE INDEX IF NOT EXISTS idx_hermes_usage_agent 
  ON public.hermes_usage(agent_id);
CREATE INDEX IF NOT EXISTS idx_hermes_usage_run 
  ON public.hermes_usage(run_id);
CREATE INDEX IF NOT EXISTS idx_hermes_usage_created 
  ON public.hermes_usage(created_at DESC);

-- -------------------------------------------------------------------------
-- Billing trigger: billed_cost = total_cost * markup_multiplier
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.compute_billed_cost()
RETURNS TRIGGER AS $$
BEGIN
  NEW.billed_cost_usd := NEW.total_cost_usd * NEW.markup_multiplier;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_compute_billed_cost ON public.hermes_usage;
CREATE TRIGGER trg_compute_billed_cost
  BEFORE INSERT OR UPDATE ON public.hermes_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_billed_cost();
