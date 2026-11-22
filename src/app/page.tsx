import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { evaluateShiftEligibility, getHubSnapshot } from '@/lib/data/repository';
import { getNotificationAdapter } from '@/lib/notifications/adapter';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const snapshot = await getHubSnapshot();
  const notifier = getNotificationAdapter();

  // Preview conflict check using seeded U10 Black parent (Sarah)
  const demoVolunteer =
    snapshot.profiles.find((p) => !p.is_coordinator) ?? snapshot.profiles[0];
  const demoTeam =
    snapshot.teams.find((t) => t.id === demoVolunteer?.team_id) ?? null;

  const totalRequired = snapshot.opportunities.reduce(
    (sum, o) => sum + o.required_headcount,
    0
  );
  const totalFilled = snapshot.opportunities.reduce(
    (sum, o) => sum + o.spots_filled,
    0
  );

  return (
    <main className="mx-auto max-w-lg pb-12">
      {/* Figtree FC Club Header */}
      <header className="bg-figtree-red px-4 py-5 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-red-100">
              Harry Graham Park • Est. 1966
            </p>
            <h1 className="text-xl font-bold tracking-tight">
              Figtree FC Volunteer Hub
            </h1>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
            <Database className="h-3.5 w-3.5" />
            {snapshot.source === 'supabase' ? 'Live Postgres' : 'Local Seed Mode'}
          </span>
        </div>
        <p className="mt-2 text-xs text-red-50">
          Pass 1 Foundation Active • Email Adapter:{' '}
          <span className="font-mono font-semibold">{notifier.providerName}</span>
        </p>
      </header>

      {/* Quick Coverage Summary */}
      <section className="grid grid-cols-3 gap-2.5 px-4 pt-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <p className="text-xs text-slate-500">Weekend Spots</p>
          <p className="mt-0.5 text-lg font-bold text-slate-900">
            {totalFilled}/{totalRequired}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <p className="text-xs text-slate-500">HGP Zones</p>
          <p className="mt-0.5 text-lg font-bold text-slate-900">
            {snapshot.locations.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <p className="text-xs text-slate-500">Teams Loaded</p>
          <p className="mt-0.5 text-lg font-bold text-slate-900">
            {snapshot.teams.length}
          </p>
        </div>
      </section>

      {/* Active Demo Perspective Banner */}
      {demoVolunteer && (
        <section className="mx-4 mt-4 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              Previewing Rules As: {demoVolunteer.full_name}
            </span>
            {demoTeam && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                {demoTeam.name} ({demoTeam.match_day} {demoTeam.match_start?.slice(0, 5)})
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Pass 2 will add the 1-tap Demo Role Switcher, Claim Drawer, and My Shifts confirmation screen.
          </p>
        </section>
      )}

      {/* Seeded Weekend Opportunities */}
      <section className="mt-5 px-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">
          Seeded Weekend Roster ({snapshot.opportunities.length} Shifts)
        </h2>

        <div className="mt-3 space-y-3">
          {snapshot.opportunities.map((opp) => {
            const eligibility = demoVolunteer
              ? evaluateShiftEligibility(opp, demoVolunteer, demoTeam)
              : null;

            return (
              <article
                key={opp.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      opp.type === 'job'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {opp.type === 'job' ? 'Fixed Job' : '2-Hr Duty'}
                  </span>

                  {opp.assigned_team && (
                    <span className="rounded-full bg-figtree-light px-2.5 py-0.5 text-xs font-semibold text-figtree-red">
                      Team: {opp.assigned_team.name}
                    </span>
                  )}

                  {opp.role.requires_wwcc && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      WWCC Required
                    </span>
                  )}
                </div>

                <h3 className="mt-2 text-base font-bold text-slate-900">
                  {opp.title}
                </h3>

                <div className="mt-2 space-y-1 text-xs text-slate-600">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {opp.day_label} ({opp.shift_date}) •{' '}
                    <Clock className="ml-1 h-3.5 w-3.5 text-slate-400" />
                    {opp.start_time.slice(0, 5)} – {opp.end_time.slice(0, 5)}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {opp.location.name}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {opp.spots_filled} of {opp.required_headcount} filled
                    {opp.spots_remaining > 0 ? (
                      <span className="font-semibold text-emerald-700">
                        ({opp.spots_remaining} open)
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-500">(Full)</span>
                    )}
                  </p>
                </div>

                {opp.notes && (
                  <p className="mt-2.5 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600">
                    {opp.notes}
                  </p>
                )}

                {eligibility?.reason && (
                  <div
                    className={`mt-2.5 flex items-start gap-2 rounded-lg p-2.5 text-xs ${
                      eligibility.conflictSeverity === 'warn'
                        ? 'bg-amber-50 text-amber-900'
                        : 'bg-red-50 text-red-900'
                    }`}
                  >
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{eligibility.reason}</span>
                  </div>
                )}

                {eligibility && !eligibility.reason && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Clear to claim (no match conflict)</span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}