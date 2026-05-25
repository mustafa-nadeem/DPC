-- Manual payment log for staff (no payment processor required in-app).

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
