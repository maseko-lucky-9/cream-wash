-- Cream Wash MVP - Database Schema Migration
-- Run this in the Supabase SQL Editor to set up the database.

-- =============================================================================
-- 1. Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS employees (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text         NOT NULL,
  pin           text         NOT NULL UNIQUE,
  role          text         NOT NULL DEFAULT 'staff' CHECK (role IN ('staff', 'owner')),
  created_at    timestamptz  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wash_tiers (
  id              uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text         NOT NULL,
  price_zar       integer      NOT NULL,
  duration_minutes integer     NOT NULL,
  description     text,
  sort_order      integer      NOT NULL DEFAULT 0,
  created_at      timestamptz  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jobs (
  id              uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  bay_id          uuid,
  employee_id     uuid,
  wash_tier_id    uuid         NOT NULL,
  customer_name   text         NOT NULL,
  customer_phone  text         NOT NULL,
  plate_number    text,
  source          text         NOT NULL CHECK (source IN ('walk_in', 'booking')),
  status          text         NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'in_progress', 'completed')),
  queued_at       timestamptz  NOT NULL DEFAULT now(),
  started_at      timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bays (
  id              uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text         NOT NULL,
  status          text         NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'in_progress')),
  current_job_id  uuid         REFERENCES jobs(id),
  created_at      timestamptz  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id              uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name   text         NOT NULL,
  customer_phone  text         NOT NULL,
  wash_tier_id    uuid         NOT NULL REFERENCES wash_tiers(id),
  date            date         NOT NULL,
  time_slot       time         NOT NULL,
  status          text         NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'checked_in', 'cancelled')),
  job_id          uuid         REFERENCES jobs(id),
  created_at      timestamptz  NOT NULL DEFAULT now()
);

-- Add foreign keys to jobs (after bays table exists)
ALTER TABLE jobs ADD CONSTRAINT fk_jobs_bay FOREIGN KEY (bay_id) REFERENCES bays(id);
ALTER TABLE jobs ADD CONSTRAINT fk_jobs_employee FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE jobs ADD CONSTRAINT fk_jobs_wash_tier FOREIGN KEY (wash_tier_id) REFERENCES wash_tiers(id);

-- =============================================================================
-- 2. Indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_queued_at ON jobs(queued_at);
CREATE INDEX IF NOT EXISTS idx_jobs_completed_at ON jobs(completed_at);
CREATE INDEX IF NOT EXISTS idx_bookings_date_slot ON bookings(date, time_slot);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_employees_pin ON employees(pin);

-- =============================================================================
-- 3. Views
-- =============================================================================

CREATE OR REPLACE VIEW daily_stats AS
SELECT
  DATE(completed_at AT TIME ZONE 'Africa/Johannesburg') AS date,
  COUNT(*)::integer AS cars_washed,
  SUM(wt.price_zar)::integer AS total_revenue_cents,
  AVG(EXTRACT(EPOCH FROM (started_at - queued_at)) / 60)::numeric(10,1) AS avg_wait_minutes,
  COUNT(DISTINCT bay_id)::integer AS bays_used
FROM jobs j
JOIN wash_tiers wt ON j.wash_tier_id = wt.id
WHERE j.status = 'completed'
GROUP BY DATE(completed_at AT TIME ZONE 'Africa/Johannesburg');

-- =============================================================================
-- 4. Row Level Security
-- =============================================================================

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE bays ENABLE ROW LEVEL SECURITY;
ALTER TABLE wash_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Permissive policies for demo (no Supabase Auth)
CREATE POLICY "wash_tiers_public_read" ON wash_tiers FOR SELECT USING (true);
CREATE POLICY "bays_public_read" ON bays FOR SELECT USING (true);
CREATE POLICY "bays_public_update" ON bays FOR UPDATE USING (true);
CREATE POLICY "jobs_public_read" ON jobs FOR SELECT USING (true);
CREATE POLICY "jobs_public_insert" ON jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "jobs_public_update" ON jobs FOR UPDATE USING (true);
CREATE POLICY "bookings_public_read" ON bookings FOR SELECT USING (true);
CREATE POLICY "bookings_public_insert" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "bookings_public_update" ON bookings FOR UPDATE USING (true);
CREATE POLICY "employees_public_read" ON employees FOR SELECT USING (true);

-- Allow seed endpoint to delete/insert
CREATE POLICY "employees_public_delete" ON employees FOR DELETE USING (true);
CREATE POLICY "employees_public_insert" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "bays_public_delete" ON bays FOR DELETE USING (true);
CREATE POLICY "bays_public_insert" ON bays FOR INSERT WITH CHECK (true);
CREATE POLICY "wash_tiers_public_delete" ON wash_tiers FOR DELETE USING (true);
CREATE POLICY "wash_tiers_public_insert" ON wash_tiers FOR INSERT WITH CHECK (true);
CREATE POLICY "jobs_public_delete" ON jobs FOR DELETE USING (true);
CREATE POLICY "bookings_public_delete" ON bookings FOR DELETE USING (true);

-- =============================================================================
-- 5. Realtime
-- =============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE bays;
ALTER PUBLICATION supabase_realtime ADD TABLE jobs;
