-- Create table for pending password changes
create table if not exists public.pending_password_changes (
    id uuid default gen_random_uuid() primary key,
    email text not null,
    new_password text not null, -- Temp storage until approved
    token uuid default gen_random_uuid() not null,
    created_at timestamp with time zone default now(),
    expires_at timestamp with time zone not null
);

-- Index for lookup
create index if not exists idx_pending_pass_token on public.pending_password_changes(token);

-- Enable RLS
alter table public.pending_password_changes enable row level security;

-- Only service role can access
create policy "Service role access" on public.pending_password_changes
    for all using (auth.role() = 'service_role');
