-- Enable realtime on agent_logs table
ALTER PUBLICATION supabase_realtime ADD TABLE agent_logs;

-- Verify realtime is enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
