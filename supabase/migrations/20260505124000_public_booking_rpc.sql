-- Public booking hard-fix:
-- Creates a SECURITY DEFINER RPC that inserts into booking_requests and logs request_events.
-- This avoids public insert failures caused by strict/misaligned RLS and trigger policy drift.

create or replace function public.create_booking_request_public(
  p_title text,
  p_first_name text,
  p_surname text,
  p_date_of_birth text,
  p_gender text,
  p_email text,
  p_mobile text,
  p_address_line text,
  p_gp_practice text,
  p_no_gp boolean,
  p_reason text,
  p_consent boolean,
  p_preferred_date date,
  p_preferred_time text
)
returns table (id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.booking_requests (
    title,
    first_name,
    surname,
    date_of_birth,
    gender,
    email,
    mobile,
    address_line,
    gp_practice,
    no_gp,
    reason,
    consent,
    preferred_date,
    preferred_time,
    status,
    category,
    next_action
  )
  values (
    nullif(p_title, ''),
    p_first_name,
    p_surname,
    nullif(p_date_of_birth, ''),
    nullif(p_gender, ''),
    p_email,
    p_mobile,
    nullif(p_address_line, ''),
    nullif(p_gp_practice, ''),
    coalesce(p_no_gp, false),
    nullif(p_reason, ''),
    coalesce(p_consent, false),
    p_preferred_date,
    p_preferred_time,
    'Submitted',
    'New Enquiry',
    'Book appointment'
  )
  returning booking_requests.id into v_id;

  insert into public.request_events (request_id, label, actor)
  values (v_id, 'Request submitted by patient', 'Portal');

  return query select v_id;
end;
$$;

alter function public.create_booking_request_public(
  text, text, text, text, text, text, text, text, text, boolean, text, boolean, date, text
) owner to postgres;

grant execute on function public.create_booking_request_public(
  text, text, text, text, text, text, text, text, text, boolean, text, boolean, date, text
) to anon, authenticated;

