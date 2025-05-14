-- Check if user_id column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'anomalies' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE anomalies ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END
$$;

-- Enable Row Level Security on anomalies table
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own anomalies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'anomalies' AND policyname = 'users_can_see_own_anomalies'
    ) THEN
        CREATE POLICY users_can_see_own_anomalies ON anomalies
            FOR SELECT
            USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Create policy for users to insert their own anomalies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'anomalies' AND policyname = 'users_can_insert_own_anomalies'
    ) THEN
        CREATE POLICY users_can_insert_own_anomalies ON anomalies
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Create policy for users to update their own anomalies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'anomalies' AND policyname = 'users_can_update_own_anomalies'
    ) THEN
        CREATE POLICY users_can_update_own_anomalies ON anomalies
            FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Create index on user_id for better performance
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_indexes 
        WHERE tablename = 'anomalies' AND indexname = 'idx_anomalies_user_id'
    ) THEN
        CREATE INDEX idx_anomalies_user_id ON anomalies(user_id);
    END IF;
END
$$;

-- Insert sample anomalies data if table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM anomalies LIMIT 1) THEN
        INSERT INTO anomalies (id, name, description, severity, detected_at, status, device_id, user_id)
        SELECT 
            gen_random_uuid(),
            'Unusual Login Time',
            'Login detected outside normal working hours',
            'medium',
            NOW() - (random() * interval '7 days'),
            'open',
            'device-' || floor(random() * 1000)::text,
            auth.uid()
        FROM generate_series(1, 5);
        
        INSERT INTO anomalies (id, name, description, severity, detected_at, status, device_id, user_id)
        SELECT 
            gen_random_uuid(),
            'Multiple Failed Login Attempts',
            'Several failed login attempts detected from unusual location',
            'high',
            NOW() - (random() * interval '3 days'),
            'open',
            'device-' || floor(random() * 1000)::text,
            auth.uid()
        FROM generate_series(1, 3);
        
        INSERT INTO anomalies (id, name, description, severity, detected_at, status, device_id, user_id)
        SELECT 
            gen_random_uuid(),
            'Unusual File Access',
            'Access to sensitive files detected',
            'low',
            NOW() - (random() * interval '14 days'),
            'resolved',
            'device-' || floor(random() * 1000)::text,
            auth.uid()
        FROM generate_series(1, 4);
    END IF;
END
$$;
