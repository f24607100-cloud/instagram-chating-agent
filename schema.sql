CREATE TABLE instagram_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  igsid text UNIQUE NOT NULL,
  name text,
  username text,
  profile_pic text,
  follower_count integer,
  is_user_follow_business boolean,
  is_business_follow_user boolean,
  mode text NOT NULL DEFAULT 'agent' CHECK (mode IN ('agent', 'human')),
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE instagram_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES instagram_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  instagram_msg_id text UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

-- Optional: Add RLS policies if you plan to access from the client side securely
-- However, based on the codebase, we use the Service Role Key for backend operations
-- so RLS isn't strictly necessary for the backend functionality.
