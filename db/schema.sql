-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create agents table
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  device_id TEXT NOT NULL UNIQUE,
  os TEXT,
  version TEXT,
  last_ping TIMESTAMPTZ DEFAULT NOW(),
  is_online BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tracklify_logs table
CREATE TABLE IF NOT EXISTS public.tracklify_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  application TEXT NOT NULL,
  window_title TEXT,
  keys TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  metadata JSONB
);

-- Create anomalies table
CREATE TABLE IF NOT EXISTS public.anomalies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT,
  resource_id UUID,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system',
  notifications BOOLEAN DEFAULT TRUE,
  cpu_threshold INTEGER DEFAULT 80,
  ram_threshold INTEGER DEFAULT 80,
  disk_threshold INTEGER DEFAULT 90,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Apply RLS policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracklify_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Agents policies
CREATE POLICY "Users can view their own agents" ON public.agents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agents" ON public.agents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents" ON public.agents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents" ON public.agents
  FOR DELETE USING (auth.uid() = user_id);

-- Tracklify logs policies
CREATE POLICY "Users can view their own logs" ON public.tracklify_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own logs" ON public.tracklify_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Anomalies policies
CREATE POLICY "Users can view their own anomalies" ON public.anomalies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own anomalies" ON public.anomalies
  FOR UPDATE USING (auth.uid() = user_id);

-- Audit logs policies
CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Settings policies
CREATE POLICY "Users can view their own settings" ON public.settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON public.agents(user_id);
CREATE INDEX IF NOT EXISTS idx_tracklify_logs_user_id ON public.tracklify_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_tracklify_logs_agent_id ON public.tracklify_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_tracklify_logs_timestamp ON public.tracklify_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_anomalies_user_id ON public.anomalies(user_id);
CREATE INDEX IF NOT EXISTS idx_anomalies_agent_id ON public.anomalies(agent_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON public.settings(user_id);

-- Create a function to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Also create default settings for the new user
  INSERT INTO public.settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id UUID,
  p_action TEXT,
  p_resource TEXT,
  p_resource_id UUID,
  p_metadata JSONB,
  p_ip_address TEXT
)
RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource,
    resource_id,
    metadata,
    ip_address
  ) VALUES (
    p_user_id,
    p_action,
    p_resource,
    p_resource_id,
    p_metadata,
    p_ip_address
  )
  RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample data for testing
-- Only insert if tables are empty
DO $$
BEGIN
  -- Insert sample agent if none exists
  IF NOT EXISTS (SELECT 1 FROM public.agents LIMIT 1) THEN
    -- Get the first user
    DECLARE
      v_user_id UUID;
    BEGIN
      SELECT id INTO v_user_id FROM auth.users LIMIT 1;
      
      IF v_user_id IS NOT NULL THEN
        -- Insert sample agent
        INSERT INTO public.agents (
          user_id,
          name,
          device_id,
          os,
          version,
          is_online
        ) VALUES (
          v_user_id,
          'Work Laptop',
          'device-' || uuid_generate_v4(),
          'Windows',
          '10 Pro',
          TRUE
        );
        
        -- Insert sample logs
        INSERT INTO public.tracklify_logs (
          user_id,
          agent_id,
          application,
          window_title,
          keys,
          timestamp,
          ip_address,
          metadata
        )
        SELECT
          v_user_id,
          (SELECT id FROM public.agents WHERE user_id = v_user_id LIMIT 1),
          CASE floor(random() * 3)
            WHEN 0 THEN 'Microsoft Word'
            WHEN 1 THEN 'Google Chrome'
            ELSE 'Visual Studio Code'
          END,
          CASE floor(random() * 3)
            WHEN 0 THEN 'Document1.docx - Microsoft Word'
            WHEN 1 THEN 'Gmail - Inbox'
            ELSE 'index.js - Visual Studio Code'
          END,
          CASE floor(random() * 3)
            WHEN 0 THEN 'Hello world'
            WHEN 1 THEN 'const app = express();'
            ELSE 'SELECT * FROM users;'
          END,
          NOW() - (random() * interval '7 days'),
          '192.168.1.' || (floor(random() * 254) + 1)::text,
          jsonb_build_object(
            'keyCount', floor(random() * 100) + 1,
            'duration', floor(random() * 3600) + 1
          )
        FROM generate_series(1, 50);
        
        -- Insert sample anomalies
        INSERT INTO public.anomalies (
          user_id,
          agent_id,
          type,
          description,
          severity,
          is_resolved,
          created_at
        )
        SELECT
          v_user_id,
          (SELECT id FROM public.agents WHERE user_id = v_user_id LIMIT 1),
          CASE floor(random() * 3)
            WHEN 0 THEN 'Unusual Login Time'
            WHEN 1 THEN 'High CPU Usage'
            ELSE 'Suspicious Activity'
          END,
          CASE floor(random() * 3)
            WHEN 0 THEN 'Login detected outside normal working hours'
            WHEN 1 THEN 'CPU usage exceeded threshold for over 10 minutes'
            ELSE 'Multiple failed login attempts detected'
          END,
          CASE floor(random() * 3)
            WHEN 0 THEN 'low'
            WHEN 1 THEN 'medium'
            ELSE 'high'
          END,
          random() > 0.7,
          NOW() - (random() * interval '7 days')
        FROM generate_series(1, 10);
        
        -- Insert sample audit logs
        INSERT INTO public.audit_logs (
          user_id,
          action,
          resource,
          resource_id,
          metadata,
          ip_address,
          created_at
        )
        SELECT
          v_user_id,
          CASE floor(random() * 4)
            WHEN 0 THEN 'login'
            WHEN 1 THEN 'view_logs'
            WHEN 2 THEN 'resolve_anomaly'
            ELSE 'update_settings'
          END,
          CASE floor(random() * 4)
            WHEN 0 THEN 'auth'
            WHEN 1 THEN 'logs'
            WHEN 2 THEN 'anomalies'
            ELSE 'settings'
          END,
          uuid_generate_v4(),
          jsonb_build_object(
            'browser', CASE floor(random() * 3)
              WHEN 0 THEN 'Chrome'
              WHEN 1 THEN 'Firefox'
              ELSE 'Safari'
            END,
            'os', CASE floor(random() * 3)
              WHEN 0 THEN 'Windows'
              WHEN 1 THEN 'macOS'
              ELSE 'Linux'
            END
          ),
          '192.168.1.' || (floor(random() * 254) + 1)::text,
          NOW() - (random() * interval '7 days')
        FROM generate_series(1, 20);
      END IF;
    END;
  END IF;
END;
$$;
