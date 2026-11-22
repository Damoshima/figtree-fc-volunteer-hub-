import {
  SEED_CLAIMS,
  SEED_LOCATIONS,
  SEED_OPPORTUNITIES,
  SEED_PROFILES,
  SEED_ROLES,
  SEED_TEAMS,
} from '@/lib/seedData';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  Claim,
  EligibilityResult,
  EnrichedOpportunity,
  Location,
  Opportunity,
  Profile,
  Role,
  Team,
} from '@/types/hub';

export interface HubSnapshot {
  source: 'supabase' | 'local_seed';
  teams: Team[];
  profiles: Profile[];
  locations: Location[];
  roles: Role[];
  opportunities: EnrichedOpportunity[];
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.slice(0, 5).split(':').map(Number);
  return h * 60 + m;
}

/**
 * Evaluates capacity, WWCC badge rules, and Soft-Warn vs Hard-Block match conflicts.
 */
export function evaluateShiftEligibility(
  opportunity: EnrichedOpportunity,
  profile: Profile,
  team: Team | null
): EligibilityResult {
  if (opportunity.spots_remaining <= 0) {
    return {
      canClaim: false,
      hasMatchOverlap: false,
      conflictSeverity: 'block',
      reason: 'All spots for this shift are already filled.',
    };
  }

  if (opportunity.role.requires_wwcc && !profile.has_wwcc) {
    return {
      canClaim: false,
      hasMatchOverlap: false,
      conflictSeverity: 'block',
      reason: `${opportunity.role.name} requires a verified WWCC badge.`,
    };
  }

  if (
    team &&
    team.match_day === opportunity.day_label &&
    team.match_start &&
    team.match_end
  ) {
    const shiftStart = toMinutes(opportunity.start_time);
    const shiftEnd = toMinutes(opportunity.end_time);
    const matchStart = toMinutes(team.match_start);
    const matchEnd = toMinutes(team.match_end);

    const overlaps = shiftStart < matchEnd && shiftEnd > matchStart;
    if (overlaps) {
      if (opportunity.conflict_mode === 'block') {
        return {
          canClaim: false,
          hasMatchOverlap: true,
          conflictSeverity: 'block',
          reason: `Overlaps ${team.name}'s ${team.match_start.slice(0, 5)} game (strict coverage duty).`,
        };
      }
      return {
        canClaim: true,
        hasMatchOverlap: true,
        conflictSeverity: 'warn',
        reason: `Heads up: overlaps ${team.name}'s ${team.match_start.slice(0, 5)} game — fine if marshalling from the sideline!`,
      };
    }
  }

  return {
    canClaim: true,
    hasMatchOverlap: false,
    conflictSeverity: 'none',
    reason: null,
  };
}

function enrichOpportunities(
  opportunities: Opportunity[],
  roles: Role[],
  locations: Location[],
  teams: Team[],
  profiles: Profile[],
  claims: Claim[]
): EnrichedOpportunity[] {
  const roleMap = new Map(roles.map((r) => [r.id, r]));
  const locMap = new Map(locations.map((l) => [l.id, l]));
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  return opportunities.map((opp) => {
    const activeClaims = claims
      .filter(
        (c) =>
          c.opportunity_id === opp.id &&
          (c.status === 'claimed' || c.status === 'confirmed')
      )
      .map((c) => ({
        ...c,
        profile_name: profileMap.get(c.profile_id)?.full_name ?? 'Volunteer',
        team_name: c.team_id ? teamMap.get(c.team_id)?.name ?? null : null,
      }));

    const spotsFilled = activeClaims.length;
    return {
      ...opp,
      role: roleMap.get(opp.role_id) ?? roles[0],
      location: locMap.get(opp.location_id) ?? locations[0],
      assigned_team: opp.assigned_team_id
        ? teamMap.get(opp.assigned_team_id) ?? null
        : null,
      active_claims: activeClaims,
      spots_filled: spotsFilled,
      spots_remaining: Math.max(0, opp.required_headcount - spotsFilled),
    };
  });
}

export async function getHubSnapshot(): Promise<HubSnapshot> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const [teamsRes, profilesRes, locRes, rolesRes, oppRes, claimsRes] =
        await Promise.all([
          supabase.from('teams').select('*').order('name'),
          supabase.from('profiles').select('*').order('full_name'),
          supabase.from('locations').select('*').eq('is_active', true).order('name'),
          supabase.from('roles').select('*').order('name'),
          supabase
            .from('opportunities')
            .select('*')
            .order('shift_date')
            .order('start_time'),
          supabase.from('claims').select('*'),
        ]);

      if (
        !teamsRes.error &&
        !oppRes.error &&
        oppRes.data &&
        oppRes.data.length > 0
      ) {
        const teams = teamsRes.data as Team[];
        const profiles = (profilesRes.data ?? []) as Profile[];
        const locations = (locRes.data ?? []) as Location[];
        const roles = (rolesRes.data ?? []) as Role[];
        const opportunities = oppRes.data as Opportunity[];
        const claims = (claimsRes.data ?? []) as Claim[];

        return {
          source: 'supabase',
          teams,
          profiles,
          locations,
          roles,
          opportunities: enrichOpportunities(
            opportunities,
            roles,
            locations,
            teams,
            profiles,
            claims
          ),
        };
      }
    } catch {
      // Fall back cleanly to local seed data if tables aren't seeded yet
    }
  }

  return {
    source: 'local_seed',
    teams: SEED_TEAMS,
    profiles: SEED_PROFILES,
    locations: SEED_LOCATIONS,
    roles: SEED_ROLES,
    opportunities: enrichOpportunities(
      SEED_OPPORTUNITIES,
      SEED_ROLES,
      SEED_LOCATIONS,
      SEED_TEAMS,
      SEED_PROFILES,
      SEED_CLAIMS
    ),
  };
}