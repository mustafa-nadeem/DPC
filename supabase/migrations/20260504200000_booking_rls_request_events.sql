-- Fix public booking submissions failing with:
-- "new row violates row-level security policy for table booking_requests"
--
-- Cause: after insert on booking_requests, trigger log_booking_submitted() inserts
-- into request_events. RLS on request_events only allowed authenticated inserts, so
-- the trigger insert could fail and roll back the whole booking insert.
--
-- Also re-assert booking_requests INSERT for anon/authenticated (idempotent).

-- ---------------------------------------------------------------------------
-- booking_requests: public INSERT (patient form uses anon key)
-- ---------------------------------------------------------------------------
drop policy if exists "Public can create booking" on public.booking_requests;
create policy "Public can create booking" on public.booking_requests
  for insert
  to public
  with check (true);

-- ---------------------------------------------------------------------------
-- request_events: allow the portal submission audit row (trigger or future client)
-- ---------------------------------------------------------------------------
drop policy if exists "Public portal can log booking submitted" on public.request_events;
create policy "Public portal can log booking submitted" on public.request_events
  for insert
  to public
  with check (
    label = 'Request submitted by patient'
    and actor = 'Portal'
  );

-- ---------------------------------------------------------------------------
-- Trigger function: must run elevated so FK/RLS checks on related rows succeed
-- ---------------------------------------------------------------------------
create or replace function public.log_booking_submitted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.request_events (request_id, label, actor, event_time)
  values (new.id, 'Request submitted by patient', 'Portal', new.created_at);
  return new;
end;
$$;

-- Supabase migrations typically run as a superuser; this helps the definer bypass RLS
-- for the nested insert + FK validation in hosted projects.
alter function public.log_booking_submitted() owner to postgres;

grant usage on schema public to anon, authenticated;
grant insert on public.booking_requests to anon, authenticated;
grant insert on public.request_events to anon, authenticated;
