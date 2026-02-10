-- Create table for storing security OTPs
create table if not exists public.security_otps (
    id uuid default gen_random_uuid() primary key,
    email text not null,
    otp text not null,
    created_at timestamp with time zone default now(),
    expires_at timestamp with time zone not null
);

-- Index for fast lookup
create index if not exists idx_security_otps_email on public.security_otps(email);

-- Enable RLS
alter table public.security_otps enable row level security;

-- Policy: Only service role can access OTPs
create policy "Service role only" on public.security_otps
    for all using (auth.role() = 'service_role');
    
-- Cleanup policy: Auto-delete expired OTPs could be done via cron or manually
-- For now, we just let them sit or delete them during the next OTP request
