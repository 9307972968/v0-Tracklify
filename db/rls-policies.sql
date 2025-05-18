-- Enable RLS on agent_logs table
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own logs
CREATE POLICY "Users can view their own logs"
ON agent_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own logs
CREATE POLICY "Users can insert their own logs"
ON agent_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own logs
CREATE POLICY "Users can update their own logs"
ON agent_logs
FOR UPDATE
USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own logs
CREATE POLICY "Users can delete their own logs"
ON agent_logs
FOR DELETE
USING (auth.uid() = user_id);
