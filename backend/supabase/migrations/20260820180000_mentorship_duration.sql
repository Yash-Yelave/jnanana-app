-- Minutes actually given, recorded when a mentor marks a request complete.
-- The public "hours donated" counter sums only this column, so the figure is a
-- ledger of logged sessions rather than an assumed session length.
alter table public.mentorship_requests
  add column duration_minutes integer check (duration_minutes is null or duration_minutes > 0);
