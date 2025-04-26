-- Create keystroke_logs table
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

-- Add RLS policies
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

-- Add some sample data for testing
INSERT INTO public.keystroke_logs (user_id, application, window_title, keys, timestamp)
SELECT 
  auth.uid(),
  'Microsoft Word',
  'Document1.docx - Microsoft Word',
  'This is a sample keystroke log for testing purposes.',
  NOW() - (random() * interval '3 days')
FROM auth.users
WHERE email = (SELECT email FROM auth.users LIMIT 1)
LIMIT 1;

INSERT INTO public.keystroke_logs (user_id, application, window_title, keys, timestamp)
SELECT 
  auth.uid(),
  'Google Chrome',
  'Gmail - Inbox',
  'Composing an email to the team about the project status.',
  NOW() - (random() * interval '2 days')
FROM auth.users
WHERE email = (SELECT email FROM auth.users LIMIT 1)
LIMIT 1;

INSERT INTO public.keystroke_logs (user_id, application, window_title, keys, timestamp)
SELECT 
  auth.uid(),
  'Visual Studio Code',
  'project.tsx - tracklify',
  'function handleSubmit() { console.log("Form submitted"); }',
  NOW() - (random() * interval '1 day')
FROM auth.users
WHERE email = (SELECT email FROM auth.users LIMIT 1)
LIMIT 1;
