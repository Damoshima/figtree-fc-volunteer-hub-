export type OpportunityType = 'job' | 'duty';
export type ConflictMode = 'warn' | 'block';
export type ClaimStatus = 'claimed' | 'confirmed' | 'cancelled_late' | 'no_show';
export type DayLabel = 'Saturday' | 'Sunday';

export interface Team {
  id: string;
  name: string;
  age_group: string;
  match_day: DayLabel | null;
  match_start: string | null; // "HH:MM"
  match_end: string | null;   // "HH:MM"
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  team_id: string | null;
  has_wwcc: boolean;
  is_coordinator: boolean;
}

export interface Location {
  id: string;
  name: string;
  zone_notes: string | null;
  is_active: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  requires_wwcc: boolean;
  requires_approval: boolean;
}

export interface Opportunity {
  id: string;
  type: OpportunityType;
  title: string;
  role_id: string;
  location_id: string;
  shift_date: string; // "YYYY-MM-DD"
  day_label: DayLabel;
  start_time: string; // "HH:MM"
  end_time: string;   // "HH:MM"
  required_headcount: number;
  assigned_team_id: string | null;
  conflict_mode: ConflictMode;
  recurrence_group: string | null;
  notes: string | null;
}

export interface Claim {
  id: string;
  opportunity_id: string;
  profile_id: string;
  team_id: string | null;
  status: ClaimStatus;
  created_at: string;
}

export interface EnrichedOpportunity extends Opportunity {
  role: Role;
  location: Location;
  assigned_team: Team | null;
  active_claims: Array<Claim & { profile_name: string; team_name: string | null }>;
  spots_filled: number;
  spots_remaining: number;
}

export interface EligibilityResult {
  canClaim: boolean;
  hasMatchOverlap: boolean;
  conflictSeverity: 'none' | 'warn' | 'block';
  reason: string | null;
}