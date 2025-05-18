-- Create agents table
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  platform TEXT NOT NULL,
  last_active TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  is_revoked BOOLEAN DEFAULT FALSE,
  keylogging_enabled BOOLEAN DEFAULT TRUE,
  full_monitoring BOOLEAN DEFAULT FALSE
);

-- Add indexes
CREATE INDEX IF NOT EXISTS agents_user_id_idx ON public.agents(user_id);
CREATE INDEX IF NOT EXISTS agents_is_active_idx ON public.agents(is_active);

-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own agents"
ON public.agents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agents"
ON public.agents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents"
ON public.agents
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents"
ON public.agents
FOR DELETE
USING (auth.uid() = user_id);
