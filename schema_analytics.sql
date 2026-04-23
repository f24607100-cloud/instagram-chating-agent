-- Create analytics events table
CREATE TABLE IF NOT EXISTS instagram_analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES instagram_conversations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'lead_captured', 'call_booked', 'handoff_to_human'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON instagram_analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_convo_id ON instagram_analytics_events(conversation_id);
