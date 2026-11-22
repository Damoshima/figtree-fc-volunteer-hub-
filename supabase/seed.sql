-- Figtree FC Seed Data (Harry Graham Park, Wallawa St, Figtree)
-- Run after schema.sql in Supabase SQL Editor

-- Clean existing demo rows if re-seeding
truncate table notification_logs, claims, opportunities, roles, locations, profiles, teams restart identity cascade;

-- 1. Harry Graham Park Locations
insert into locations (id, name, zone_notes) values
  ('11111111-1111-1111-1111-111111111101', 'Field 1 (Main Pitch)', 'Main full-size pitch adjacent to clubhouse'),
  ('11111111-1111-1111-1111-111111111102', 'Field 2 (Upper Pitch)', 'Upper full-size pitch'),
  ('11111111-1111-1111-1111-111111111103', 'MiniRoos 6/7s Zone', '1 marshal covers all 3 U6/U7 small-sided games'),
  ('11111111-1111-1111-1111-111111111104', 'MiniRoos 8/9s Zone', 'Small-sided pitches on eastern side'),
  ('11111111-1111-1111-1111-111111111105', 'Clubhouse & BBQ Area', 'Canteen, BBQ tent, vests & match-day gear');

-- 2. Figtree FC Teams & Kickoff Windows
insert into teams (id, name, age_group, match_day, match_start, match_end) values
  ('22222222-2222-2222-2222-222222222201', 'U6 Red', 'U6', 'Saturday', '08:30', '09:15'),
  ('22222222-2222-2222-2222-222222222202', 'U8 Pink', 'U8', 'Saturday', '08:30', '09:20'),
  ('22222222-2222-2222-2222-222222222203', 'U10 Black', 'U10', 'Saturday', '10:15', '11:10'),
  ('22222222-2222-2222-2222-222222222204', 'U12 Div 5', 'U12', 'Saturday', '09:30', '10:30'),
  ('22222222-2222-2222-2222-222222222205', 'U15 Boys Div 1', 'U15', 'Saturday', '11:30', '12:45'),
  ('22222222-2222-2222-2222-222222222206', 'U9 Gold', 'U9', 'Sunday', '09:30', '10:20');

-- 3. Configurable Club Roles
insert into roles (id, name, description, requires_wwcc, requires_approval) values
  ('33333333-3333-3333-3333-333333333301', 'Match Marshal / Jacketed Official', 'High-vis sideline marshal supporting referees and crowd flow. No WWCC or prior approval needed.', false, false),
  ('33333333-3333-3333-3333-333333333302', 'Match Day Supervisor', 'Committee official running match day operations (FSC requirement). Verified WWCC required.', true, false),
  ('33333333-3333-3333-3333-333333333303', 'BBQ & Canteen Crew', 'Cooking sausages, serving drinks, and keeping the canteen queue moving.', false, false);

-- 4. Sample Profiles (Committee + Parents across teams)
insert into profiles (id, full_name, email, phone, team_id, has_wwcc, is_coordinator) values
  ('44444444-4444-4444-4444-444444444401', 'Dallas (VP Operations)', 'dallas@figtreefc.example.org.au', '0400 111 222', null, true, true),
  ('44444444-4444-4444-4444-444444444402', 'Sarah Jenkins', 'sarah.j@example.com', '0412 345 678', '22222222-2222-2222-2222-222222222203', false, false),
  ('44444444-4444-4444-4444-444444444403', 'Liam Vance', 'liam.v@example.com', '0423 456 789', '22222222-2222-2222-2222-222222222202', false, false),
  ('44444444-4444-4444-4444-444444444404', 'Chloe Mercer', 'chloe.m@example.com', '0434 567 890', '22222222-2222-2222-2222-222222222205', false, false);

-- 5. Sample Weekend Opportunities (Jobs + 2-Hour Duties)
insert into opportunities (
  id, type, title, role_id, location_id, shift_date, day_label,
  start_time, end_time, required_headcount, assigned_team_id, conflict_mode, recurrence_group, notes
) values
  -- Fixed Job: Clubhouse Opening
  (
    '55555555-5555-5555-5555-555555555501', 'job',
    'Open Clubhouse & Set Out Marshal Vests',
    '33333333-3333-3333-3333-333333333302',
    '11111111-1111-1111-1111-111111111105',
    '2026-12-05', 'Saturday', '07:15', '07:30', 1, null, 'block', 'weekly-sat-open',
    'Unlock clubhouse, turn on BBQ gas, place high-vis jackets at main table.'
  ),
  -- Saturday 8:00 AM - 10:00 AM Peak Block
  (
    '55555555-5555-5555-5555-555555555502', 'duty',
    'Field 1 Match Marshal (8–10am Block)',
    '33333333-3333-3333-3333-333333333301',
    '11111111-1111-1111-1111-111111111101',
    '2026-12-05', 'Saturday', '08:00', '10:00', 1, '22222222-2222-2222-2222-222222222203', 'warn', 'weekly-sat-8am',
    'Allocated to U10 Black (plays 10:15am, so clear of your kickoff!).'
  ),
  (
    '55555555-5555-5555-5555-555555555503', 'duty',
    'Field 2 Match Marshal (8–10am Block)',
    '33333333-3333-3333-3333-333333333301',
    '11111111-1111-1111-1111-111111111102',
    '2026-12-05', 'Saturday', '08:00', '10:00', 1, null, 'warn', 'weekly-sat-8am',
    'Open club shift — urgent gap for early Field 2 fixtures.'
  ),
  (
    '55555555-5555-5555-5555-555555555504', 'duty',
    'MiniRoos 6/7s Zone Marshal (Covers 3 U6 Pitches)',
    '33333333-3333-3333-3333-333333333301',
    '11111111-1111-1111-1111-111111111103',
    '2026-12-05', 'Saturday', '08:00', '10:00', 1, null, 'warn', 'weekly-sat-8am',
    '1 marshal covers all 3 U6 MiniRoos pitches. Soft warning if watching your own U6.'
  ),
  (
    '55555555-5555-5555-5555-555555555505', 'duty',
    'Morning BBQ & Canteen Shift',
    '33333333-3333-3333-3333-333333333303',
    '11111111-1111-1111-1111-111111111105',
    '2026-12-05', 'Saturday', '08:00', '10:00', 2, '22222222-2222-2222-2222-222222222205', 'block', 'weekly-sat-bbq',
    'Allocated to U15 Boys Div 1 (plays 11:30am). Strict conflict guard so BBQ stays staffed.'
  ),
  -- Saturday 10:00 AM - 12:00 PM Peak Block
  (
    '55555555-5555-5555-5555-555555555506', 'duty',
    'Field 1 Match Marshal — U15 Div 1 Extra Coverage',
    '33333333-3333-3333-3333-333333333301',
    '11111111-1111-1111-1111-111111111101',
    '2026-12-05', 'Saturday', '10:00', '12:00', 2, null, 'warn', 'weekly-sat-10am',
    '2 marshals rostered for higher-intensity late morning Div 1 fixtures.'
  ),
  (
    '55555555-5555-5555-5555-555555555507', 'duty',
    'MiniRoos 8/9s Zone Marshal (10am–12pm)',
    '33333333-3333-3333-3333-333333333301',
    '11111111-1111-1111-1111-111111111104',
    '2026-12-05', 'Saturday', '10:00', '12:00', 1, '22222222-2222-2222-2222-222222222202', 'warn', 'weekly-sat-10am',
    'Allocated to U8 Pink (played at 8:30am, free for 10am–12pm block).'
  ),
  -- Sunday Morning Block
  (
    '55555555-5555-5555-5555-555555555508', 'duty',
    'Sunday Morning Fields & MiniRoos Marshal',
    '33333333-3333-3333-3333-333333333301',
    '11111111-1111-1111-1111-111111111101',
    '2026-12-06', 'Sunday', '09:00', '11:00', 2, null, 'warn', 'weekly-sun-9am',
    'Sunday coverage aims for 2–3 marshals across Field 1, Field 2 & MiniRoos.'
  );

-- 6. Initial Claims (Leaves realistic gaps for demo testing!)
insert into claims (opportunity_id, profile_id, team_id, status) values
  ('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444401', null, 'confirmed'),
  ('55555555-5555-5555-5555-555555555505', '44444444-4444-4444-4444-444444444404', '22222222-2222-2222-2222-222222222205', 'confirmed'),
  ('55555555-5555-5555-5555-555555555507', '44444444-4444-4444-4444-444444444403', '22222222-2222-2222-2222-222222222202', 'claimed');