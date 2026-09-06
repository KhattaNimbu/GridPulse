import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronRight, Gauge, LineChart, RadioTower, Shield, Smartphone, Sparkles, Zap } from "lucide-react";

export default function Home() {
  const platformFeatures: Array<{ title: string; desc: string; icon: React.ReactNode }> = [
    {
      title: 'Prophet-powered forecasts',
      desc: '24-hour demand forecasts in 30-minute buckets, trained on session history per station.',
      icon: <LineChart className="h-5 w-5 text-[var(--color-gp-cyan)]" />,
    },
    {
      title: 'Serializable capacity guard',
      desc: 'Transactional booking engine rejects any request that would push a station past safe capacity.',
      icon: <Shield className="h-5 w-5 text-[var(--color-gp-green)]" />,
    },
    {
      title: 'Dynamic pricing engine',
      desc: 'Forecast-informed pricing shifts drivers away from predicted peak windows.',
      icon: <Gauge className="h-5 w-5 text-[var(--color-gp-cyan)]" />,
    },
    {
      title: 'Multi-station orchestration',
      desc: 'Model each station’s grid allocation, connector mix, and pricing rules independently.',
      icon: <RadioTower className="h-5 w-5 text-[var(--color-gp-green)]" />,
    },
    {
      title: 'Operator-grade dashboards',
      desc: 'Polling load curves, threshold alerts, and control-room visibility for every site.',
      icon: <Zap className="h-5 w-5 text-[var(--color-gp-cyan)]" />,
    },
    {
      title: 'Driver-first booking',
      desc: 'Frictionless slot picker with transparent pricing and instant confirmation.',
      icon: <Smartphone className="h-5 w-5 text-[var(--color-gp-green)]" />,
    },
  ];

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="gp-orb left-[8%] top-12 h-[18rem] w-[18rem] bg-[var(--color-gp-cyan)]/12" />
      <div className="gp-orb right-[4%] top-[24rem] h-[20rem] w-[20rem] bg-[var(--color-gp-green)]/10" />
      <div className="absolute inset-0 gp-grid-overlay opacity-40" />

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-28 px-6 pb-28 pt-14">
        <section className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col gap-8">
            <div className="gp-badge self-start rounded-full px-4 py-2 text-[0.82rem] text-[var(--color-gp-text-muted)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-gp-cyan)] shadow-[0_0_12px_rgba(34,211,238,0.85)]" />
              Live grid intelligence · v2.4
            </div>

            <div className="space-y-6">
              <h1 className="gp-section-title max-w-3xl text-white">
                Charge faster.
                <br />
                <span className="gp-gradient-text">Protect the grid.</span>
              </h1>
              <p className="max-w-2xl text-xl leading-relaxed text-[var(--color-gp-text-muted)]">
                GridPulse forecasts EV demand in 30-minute buckets, blocks bookings that would overload your capacity,
                and flattens peaks with forecast-informed dynamic pricing in one operator-grade platform.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/driver" className="gp-btn-primary inline-flex items-center gap-2 px-7 py-4 text-base">
                Book a live demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/operator" className="gp-btn-secondary inline-flex items-center gap-2 px-7 py-4 text-base">
                See the platform
              </Link>
            </div>

            <div className="grid gap-6 border-t border-[var(--color-gp-border)] pt-8 sm:grid-cols-3">
              {[
                ['Serializable', 'Transactional booking guard'],
                ['30 min', 'Demand forecast buckets'],
                ['24h', 'Forecast horizon'],
              ].map(([value, label]) => (
                <div key={label}>
                  <div className="text-4xl font-bold text-[var(--color-gp-cyan)]">{value}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--color-gp-text-dim)]">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="gp-panel relative overflow-hidden p-4 shadow-[0_0_60px_rgba(17,24,39,0.55)]">
            <div className="absolute left-10 top-10 h-48 w-48 rounded-full bg-[var(--color-gp-cyan)]/10 blur-[90px]" />
            <div className="absolute bottom-8 right-8 h-56 w-56 rounded-full bg-[var(--color-gp-green)]/10 blur-[110px]" />
            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/8 bg-[#04101d] p-6">
              <div className="mb-5 flex items-start justify-between">
                <div className="rounded-[1.2rem] border border-white/10 bg-[rgba(10,22,40,0.86)] px-4 py-3 shadow-[0_0_30px_rgba(2,8,19,0.6)]">
                  <div className="mb-1 flex items-center gap-2 text-sm text-[var(--color-gp-text-muted)]">
                    <ActivityIcon /> Live load
                  </div>
                  <div className="text-4xl font-bold text-white">
                    2.45 <span className="text-lg font-medium text-[var(--color-gp-text-muted)]">GW</span>
                  </div>
                </div>
                <div className="rounded-[1.2rem] border border-[var(--color-gp-green)]/20 bg-[rgba(10,22,40,0.72)] px-4 py-3 text-right shadow-[0_0_30px_rgba(2,8,19,0.5)]">
                  <div className="mb-1 flex items-center gap-2 text-sm text-[var(--color-gp-text-muted)]">
                    <Shield className="h-4 w-4 text-[var(--color-gp-green)]" /> Capacity
                  </div>
                  <div className="text-4xl font-bold text-[var(--color-gp-green)]">72%</div>
                </div>
              </div>

              <div className="relative aspect-[5/4] overflow-hidden rounded-[1.35rem] border border-white/8 bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_75%_60%,rgba(74,222,128,0.14),transparent_32%),linear-gradient(180deg,#03111f_0%,#040915_100%)]">
                <div className="absolute inset-0 opacity-65">
                  <svg viewBox="0 0 640 520" className="h-full w-full">
                    <defs>
                      <linearGradient id="pulseLineA" x1="0" x2="1">
                        <stop offset="0%" stopColor="#11d9f4" />
                        <stop offset="100%" stopColor="#7efb57" />
                      </linearGradient>
                      <linearGradient id="pulseLineB" x1="0" x2="1">
                        <stop offset="0%" stopColor="#0e5cff" />
                        <stop offset="100%" stopColor="#11d9f4" />
                      </linearGradient>
                    </defs>
                    <path d="M-40 250 C110 180, 200 335, 360 220 S 620 135, 690 170" fill="none" stroke="url(#pulseLineA)" strokeWidth="5" opacity="0.8" />
                    <path d="M-30 310 C105 245, 180 350, 335 255 S 595 165, 685 210" fill="none" stroke="url(#pulseLineB)" strokeWidth="3.5" opacity="0.65" />
                    <path d="M0 350 C130 285, 250 410, 420 300 S 575 230, 640 260" fill="none" stroke="#0b6de1" strokeWidth="2.5" opacity="0.55" />
                    <g transform="translate(315 165)">
                      <path d="M0 92 L48 0 L188 0 L236 92 L0 92 Z" fill="rgba(2,8,19,0.7)" stroke="#13dff4" strokeWidth="3" />
                      <path d="M38 92 L80 18 L156 18 L198 92" fill="none" stroke="#7efb57" strokeWidth="2" opacity="0.8" />
                      <rect x="54" y="45" width="34" height="47" rx="4" fill="rgba(34,211,238,0.12)" stroke="#21d9ee" />
                      <rect x="110" y="45" width="34" height="47" rx="4" fill="rgba(34,211,238,0.12)" stroke="#21d9ee" />
                      <rect x="166" y="45" width="34" height="47" rx="4" fill="rgba(34,211,238,0.12)" stroke="#21d9ee" />
                    </g>
                    <g transform="translate(210 260)">
                      <rect x="0" y="35" width="135" height="70" rx="16" fill="rgba(3,9,21,0.92)" stroke="#21d9ee" strokeWidth="2" />
                      <path d="M80 0 L102 42 L58 42 Z" fill="rgba(18,223,244,0.22)" stroke="#21d9ee" />
                      <circle cx="67" cy="70" r="28" fill="none" stroke="rgba(34,211,238,0.16)" strokeWidth="6" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col items-center gap-14 text-center">
          <div className="flex max-w-3xl flex-col items-center gap-5">
            <div className="gp-badge rounded-full px-4 py-2 text-[0.82rem] text-[var(--color-gp-text-muted)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--color-gp-cyan)]" /> The platform
            </div>
            <h2 className="max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-6xl">
              One control loop for <span className="gp-gradient-text">every kilowatt</span>
            </h2>
            <p className="text-lg leading-relaxed text-[var(--color-gp-text-muted)]">
              From forecast to booking to price, GridPulse closes the loop between predicted demand and the grid you are actually allowed to draw from.
            </p>
          </div>

          <div className="grid w-full gap-6 text-left md:grid-cols-2 xl:grid-cols-3">
            {platformFeatures.map((feature) => (
              <div key={feature.title} className="gp-panel p-7">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/4">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-base leading-8 text-[var(--color-gp-text-muted)]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="gp-panel overflow-hidden p-4">
            <div className="rounded-[1.5rem] border border-white/8 bg-[#050d18] p-6">
              <div className="mb-4 flex items-center gap-2 text-sm text-[var(--color-gp-text-muted)]">
                <Smartphone className="h-4 w-4 text-[var(--color-gp-green)]" /> For drivers
              </div>
              <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-5">
                  <h3 className="text-5xl font-bold tracking-tight text-white">
                    Book a slot in <span className="gp-gradient-text">under 10 seconds.</span>
                  </h3>
                  <p className="text-lg leading-8 text-[var(--color-gp-text-muted)]">
                    Drivers see live availability, transparent pricing, and confirmed slots with no wasted trip to a full station.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ['Live availability', 'Real-time slot data'],
                      ['Instant confirm', 'Transactional bookings'],
                      ['Smart pricing', 'Cheaper off-peak windows'],
                      ['Any station', 'Multi-network aware'],
                    ].map(([title, desc]) => (
                      <div key={title} className="rounded-[1.25rem] border border-white/10 bg-white/[0.025] p-4">
                        <div className="font-semibold text-white">{title}</div>
                        <div className="mt-1 text-sm text-[var(--color-gp-text-muted)]">{desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[1.5rem] border border-white/8 bg-[radial-gradient(circle_at_70%_25%,rgba(34,211,238,0.12),transparent_26%),linear-gradient(180deg,#07111e_0%,#03070f_100%)] p-5">
                  <div className="absolute inset-0 gp-grid-overlay opacity-20" />
                  <div className="relative z-10 mx-auto flex max-w-[18rem] flex-col rounded-[2rem] border border-white/10 bg-[rgba(6,16,29,0.95)] p-4 shadow-[0_0_40px_rgba(0,0,0,0.45)]">
                    <div className="mb-4 text-center text-xs tracking-[0.18em] text-[var(--color-gp-text-dim)]">BOOK YOUR CHARGING SLOT</div>
                    <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full border-4 border-[var(--color-gp-cyan)] shadow-[0_0_28px_rgba(34,211,238,0.25)]">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">2:30</div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-gp-text-dim)]">Today</div>
                      </div>
                    </div>
                    <div className="text-center text-sm text-[var(--color-gp-text-muted)]">GreenWay Station</div>
                    <div className="mt-1 text-center text-xs text-[var(--color-gp-text-dim)]">Fast charging · 30 min</div>
                    <div className="mt-5 rounded-full border border-[var(--color-gp-cyan)]/25 bg-gradient-to-r from-[var(--color-gp-cyan)]/20 to-[var(--color-gp-green)]/20 px-4 py-3 text-center text-sm font-semibold text-white">
                      Confirm Booking
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="gp-badge rounded-full px-4 py-2 text-[0.82rem] text-[var(--color-gp-text-muted)]">
              <LineChart className="h-3.5 w-3.5 text-[var(--color-gp-cyan)]" /> Forecasting engine
            </div>
            <h3 className="text-5xl font-bold tracking-tight text-white">
              Predict demand before it hits your <span className="gp-gradient-text">transformers.</span>
            </h3>
            <p className="text-lg leading-8 text-[var(--color-gp-text-muted)]">
              A dedicated FastAPI plus Prophet service produces 30-minute demand curves per station and feeds them directly into pricing and capacity logic. Retraining is triggered manually per station today, not on an automatic schedule.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['30 min', 'Bucket resolution'],
                ['24h', 'Forecast horizon'],
                ['Manual', 'Retrain trigger'],
                ['Per-station', 'Model isolation'],
              ].map(([title, desc]) => (
                <div key={title} className="gp-stat-card p-5">
                  <div className="text-3xl font-bold text-[var(--color-gp-cyan)]">{title}</div>
                  <div className="mt-2 text-sm text-[var(--color-gp-text-muted)]">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid items-center gap-14 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-6">
            <div className="gp-badge rounded-full px-4 py-2 text-[0.82rem] text-[var(--color-gp-text-muted)]">
              <Zap className="h-3.5 w-3.5 text-[var(--color-gp-cyan)]" /> For operators
            </div>
            <h3 className="text-5xl font-bold tracking-tight text-white">
              A control room that <span className="gp-gradient-text">never blinks.</span>
            </h3>
            <p className="text-lg leading-8 text-[var(--color-gp-text-muted)]">
              Watch stress build in real time, tune pricing rules on the fly, and get alerted the moment any station approaches its ceiling.
            </p>
            <ul className="space-y-4">
              {[
                'Live polling load curves with actual and forecast awareness',
                'Threshold alerts for grid stress and pricing intervention',
                'Point-and-click pricing rules with instant preview',
                'Role-protected access with session-based operator gating',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[var(--color-gp-text-muted)]">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-gp-green)]" />
                  <span className="text-base leading-7">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="gp-panel overflow-hidden p-4">
            <div className="rounded-[1.5rem] border border-white/8 bg-[#050d18] p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-sm uppercase tracking-[0.18em] text-[var(--color-gp-text-dim)]">Operator control room</div>
                  <div className="mt-1 text-2xl font-semibold text-white">All systems nominal</div>
                </div>
                <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-[var(--color-gp-text-muted)]">
                  5 stations online
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="gp-stat-card p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-gp-text-dim)]">Total load</div>
                  <div className="mt-3 text-4xl font-bold text-white">2.45<span className="ml-1 text-base font-medium text-[var(--color-gp-text-muted)]">GW</span></div>
                </div>
                <div className="gp-stat-card p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-gp-text-dim)]">Peak forecast</div>
                  <div className="mt-3 text-4xl font-bold text-white">3.62<span className="ml-1 text-base font-medium text-[var(--color-gp-text-muted)]">GW</span></div>
                </div>
              </div>
              <div className="mt-5 overflow-hidden rounded-[1.25rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-lg font-semibold text-white">System load curve</div>
                  <div className="text-sm text-[var(--color-gp-text-muted)]">24h</div>
                </div>
                <svg viewBox="0 0 540 220" className="h-full w-full">
                  <defs>
                    <linearGradient id="curveFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 175 C70 168, 120 155, 165 128 S 255 90, 320 82 S 418 115, 540 150" fill="none" stroke="#1be0f4" strokeWidth="4" />
                  <path d="M235 96 C290 82, 345 76, 410 98 S 485 128, 540 146" fill="none" stroke="#8cf94e" strokeWidth="4" strokeDasharray="7 7" />
                  <path d="M0 175 C70 168, 120 155, 165 128 S 255 90, 320 82 S 418 115, 540 150 L540 220 L0 220 Z" fill="url(#curveFill)" />
                  <circle cx="235" cy="96" r="6" fill="#22d3ee" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section className="gp-panel relative overflow-hidden px-8 py-16 text-center sm:px-16">
          <div className="gp-orb left-[20%] top-1/2 h-48 w-48 -translate-y-1/2 bg-[var(--color-gp-cyan)]/10" />
          <div className="gp-orb right-[12%] top-1/2 h-48 w-48 -translate-y-1/2 bg-[var(--color-gp-green)]/10" />
          <div className="relative z-10 mx-auto max-w-4xl">
            <h3 className="text-5xl font-bold tracking-tight text-white">
              Ready to see GridPulse on <span className="gp-gradient-text">your network?</span>
            </h3>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[var(--color-gp-text-muted)]">
              We’ll model one station, run a forecast on real history, and show peak-flattening in action in a 30-minute call.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/sign-in" className="gp-btn-primary inline-flex items-center gap-2 px-7 py-4 text-base">
                Book a demo
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link href="/operator" className="gp-btn-secondary inline-flex items-center gap-2 px-7 py-4 text-base">
                Read the docs
              </Link>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-5 border-t border-[var(--color-gp-border)] pt-8 text-sm text-[var(--color-gp-text-dim)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-gp-cyan)] to-[var(--color-gp-green)]">
              <Zap className="h-4 w-4 fill-[var(--color-gp-bg)] text-[var(--color-gp-bg)]" />
            </div>
            <span>© 2026 GridPulse. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap gap-6">
            {['Privacy', 'Terms', 'Security', 'Status'].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </footer>
      </main>
    </div>
  );
}

function ActivityIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}
