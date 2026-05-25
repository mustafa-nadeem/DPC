-- If you already ran the older migration with demo dates, this clears the seed to match dynamic-only availability.
-- Safe to run multiple times.

update public.clinic_settings
set
  availability = '[]'::jsonb,
  updated_at = now()
where id = 1;
