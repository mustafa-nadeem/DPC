-- Fix bookings still failing after 20260504200000:
-- SECURITY DEFINER trigger log_booking_submitted() runs as the function owner (e.g. postgres),
-- not as anon. RLS policies restricted INSERT to anon/authenticated only, so the trigger's
-- INSERT into request_events had no matching policy → transaction rolled back (often surfaced as
-- booking_requests RLS failure).

drop policy if exists "Public portal can log booking submitted" on public.request_events;
create policy "Public portal can log booking submitted" on public.request_events
  for insert
  to public
  with check (
    label = 'Request submitted by patient'
    and actor = 'Portal'
  );

-- Patient form still uses anon key; PUBLIC covers anon + allows trigger owner role.
drop policy if exists "Public can create booking" on public.booking_requests;
create policy "Public can create booking" on public.booking_requests
  for insert
  to public
  with check (true);
