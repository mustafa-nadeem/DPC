-- DPC: clinic availability + booking requests. Run in Supabase SQL editor or via `supabase db push`.
-- After: Authentication → add staff user(s). Only authenticated users are treated as staff in the app.

create table if not exists public.clinic_settings (
  id int primary key check (id = 1),
  availability jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Empty schedule: staff set dates/slots in Admin → Schedule; nothing is pre-seeded.
insert into public.clinic_settings (id, availability)
values (1, '[]'::jsonb)
on conflict (id) do nothing;

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  title text,
  first_name text not null,
  surname text not null,
  date_of_birth text,
  gender text,
  email text not null,
  mobile text,
  address_line text,
  gp_practice text,
  no_gp boolean not null default false,
  reason text,
  consent boolean not null default false,

  preferred_date date,
  preferred_time text,

  status text not null default 'Submitted',
  category text not null default 'New Enquiry',
  next_action text not null default 'Book appointment',
  internal_notes text
);

create table if not exists public.request_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.booking_requests (id) on delete cascade,
  event_time timestamptz not null default now(),
  label text not null,
  actor text not null
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

drop trigger if exists tr_booking_requests_updated on public.booking_requests;
create trigger tr_booking_requests_updated
  before update on public.booking_requests
  for each row
  execute procedure public.set_updated_at();

drop trigger if exists tr_booking_request_submitted on public.booking_requests;
create trigger tr_booking_request_submitted
  after insert on public.booking_requests
  for each row
  execute procedure public.log_booking_submitted();

alter table public.clinic_settings enable row level security;
alter table public.booking_requests enable row level security;
alter table public.request_events enable row level security;

drop policy if exists "Anyone can read clinic availability" on public.clinic_settings;
create policy "Anyone can read clinic availability" on public.clinic_settings
  for select
  to anon, authenticated
  using (id = 1);

drop policy if exists "Staff can update clinic availability" on public.clinic_settings;
create policy "Staff can update clinic availability" on public.clinic_settings
  for update
  to authenticated
  using (id = 1)
  with check (id = 1);

drop policy if exists "Public can create booking" on public.booking_requests;
create policy "Public can create booking" on public.booking_requests
  for insert
  to public
  with check (true);

drop policy if exists "Staff can read bookings" on public.booking_requests;
create policy "Staff can read bookings" on public.booking_requests
  for select
  to authenticated
  using (true);

drop policy if exists "Staff can update bookings" on public.booking_requests;
create policy "Staff can update bookings" on public.booking_requests
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Staff can read request events" on public.request_events;
create policy "Staff can read request events" on public.request_events
  for select
  to authenticated
  using (true);

drop policy if exists "Staff can add request events" on public.request_events;
create policy "Staff can add request events" on public.request_events
  for insert
  to authenticated
  with check (true);

-- Portal (anon) can insert the audit row created when a patient submits a booking
-- (see trigger log_booking_submitted). Without this, the trigger fails and the booking insert rolls back.
drop policy if exists "Public portal can log booking submitted" on public.request_events;
create policy "Public portal can log booking submitted" on public.request_events
  for insert
  to public
  with check (
    label = 'Request submitted by patient'
    and actor = 'Portal'
  );

grant insert on public.booking_requests to anon, authenticated;
grant insert on public.request_events to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Manual payments (Admin → Payments). Safe to run if you already have the above;
-- uses public.set_updated_at() from this file.
-- ---------------------------------------------------------------------------

create table if not exists public.clinic_payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  request_ref text,
  patient_name text not null,
  amount_gbp numeric(10, 2) not null check (amount_gbp >= 0),
  status text not null default 'Payment Pending',
  method text not null default 'Manual',
  notes text
);

create index if not exists idx_clinic_payments_updated on public.clinic_payments (updated_at desc);
create index if not exists idx_clinic_payments_status on public.clinic_payments (status);

drop trigger if exists tr_clinic_payments_updated on public.clinic_payments;
create trigger tr_clinic_payments_updated
  before update on public.clinic_payments
  for each row
  execute procedure public.set_updated_at();

alter table public.clinic_payments enable row level security;

drop policy if exists "Staff can read payments" on public.clinic_payments;
create policy "Staff can read payments" on public.clinic_payments
  for select
  to authenticated
  using (true);

drop policy if exists "Staff can insert payments" on public.clinic_payments;
create policy "Staff can insert payments" on public.clinic_payments
  for insert
  to authenticated
  with check (true);

drop policy if exists "Staff can update payments" on public.clinic_payments;
create policy "Staff can update payments" on public.clinic_payments
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Staff can delete payments" on public.clinic_payments;
create policy "Staff can delete payments" on public.clinic_payments
  for delete
  to authenticated
  using (true);
