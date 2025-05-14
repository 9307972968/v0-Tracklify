-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create keystroke_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.keystroke_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application VARCHAR(255) NOT NULL,
  window_title TEXT,
  keys TEXT NOT NULL,
  encrypted_data TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(45),
  device_info JSONB
);

-- Create sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  active_time INTEGER DEFAULT 0,
  device_info JSONB,
  ip_address VARCHAR(45)
);

-- Create anomalies table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.anomalies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  severity VARCHAR(50) DEFAULT 'medium',
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create devices table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  device_id VARCHAR(255) NOT NULL UNIQUE,
  os VARCHAR(100),
  os_version VARCHAR(100),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
-- Enable RLS on keystroke_logs
ALTER TABLE public.keystroke_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own logs
CREATE POLICY read_own_logs ON public.keystroke_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own logs
CREATE POLICY insert_own_logs ON public.keystroke_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow service role to manage all logs
CREATE POLICY service_role_manage_logs ON public.keystroke_logs
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on sessions
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own sessions
CREATE POLICY read_own_sessions ON public.sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own sessions
CREATE POLICY insert_own_sessions ON public.sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own sessions
CREATE POLICY update_own_sessions ON public.sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow service role to manage all sessions
CREATE POLICY service_role_manage_sessions ON public.sessions
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on anomalies
ALTER TABLE public.anomalies ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own anomalies
CREATE POLICY read_own_anomalies ON public.anomalies
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow service role to manage all anomalies
CREATE POLICY service_role_manage_anomalies ON public.anomalies
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on devices
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own devices
CREATE POLICY read_own_devices ON public.devices
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own devices
CREATE POLICY insert_own_devices ON public.devices
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own devices
CREATE POLICY update_own_devices ON public.devices
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow service role to manage all devices
CREATE POLICY service_role_manage_devices ON public.devices
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_keystroke_logs_user_id ON public.keystroke_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_keystroke_logs_timestamp ON public.keystroke_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON public.sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_anomalies_user_id ON public.anomalies(user_id);
CREATE INDEX IF NOT EXISTS idx_anomalies_detected_at ON public.anomalies(detected_at);
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON public.devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON public.devices(device_id);

-- Insert sample data for testing
-- Sample keystroke logs
INSERT INTO public.keystroke_logs (user_id, application, window_title, keys, timestamp, ip_address, device_info)
SELECT 
  auth.uid(),
  'Microsoft Word',
  'Document1.docx - Microsoft Word',
  'This is a sample keystroke log for testing purposes.',
  NOW() - (random() * interval '3 days'),
  '192.168.1.1',
  '{"os": "Windows 10", "browser": "Chrome", "version": "91.0.4472.124"}'
FROM auth.users
WHERE email = (SELECT email FROM auth.users LIMIT 1)
LIMIT 1;

INSERT INTO public.keystroke_logs (user_id, application, window_title, keys, timestamp, ip_address, device_info)
SELECT 
  auth.uid(),
  'Google Chrome',
  'Gmail - Inbox',
  'Composing an email to the team about the project status.',
  NOW() - (random() * interval '2 days'),
  '192.168.1.1',
  '{"os": "Windows 10", "browser": "Chrome", "version": "91.0.4472.124"}'
FROM auth.users
WHERE email = (SELECT email FROM auth.users LIMIT 1)
LIMIT 1;

-- Sample session
INSERT INTO public.sessions (user_id, start_time, end_time, active_time, device_info, ip_address)
SELECT 
  auth.uid(),
  NOW() - interval '3 hours',
  NOW() - interval '1 hour',
  7200,
  '{"os": "Windows 10", "browser": "Chrome", "version": "91.0.4472.124"}',
  '192.168.1.1'
FROM auth.users
WHERE email = (SELECT email FROM auth.users LIMIT 1)
LIMIT 1;

-- Sample anomaly
INSERT INTO public.anomalies (user_id, description, severity, detected_at)
SELECT 
  auth.uid(),
  'Unusual login time detected',
  'medium',
  NOW() - interval '2 hours'
FROM auth.users
WHERE email = (SELECT email FROM auth.users LIMIT 1)
LIMIT 1;

-- Sample device
INSERT INTO public.devices (user_id, name, device_id, os, os_version)
SELECT 
  auth.uid(),
  'Work Laptop',
  'device-' || uuid_generate_v4(),
  'Windows',
  '10 Pro'
FROM auth.users
WHERE email = (SELECT email FROM auth.users LIMIT 1)
LIMIT 1;
