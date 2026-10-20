import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Gauge,
  LayoutGrid,
  LineChart,
  RadioTower,
  Shield,
  Smartphone,
  TrendingUp,
  Zap,
} from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import { getAuthSession } from "@/lib/auth";

export default async function Home() {
  const session = await getAuthSession();
  if (session?.user?.id) {
    redirect(session.user.role === 'OPERATOR' ? '/operator' : '/driver');
  }

  const platformFeatures: Array<{ eyebrow: string; title: string; desc: string; icon: React.ReactNode }> = [
    {
      eyebrow: 'Forecasting',
      title: 'Prophet-powered forecasts',
      desc: '24-hour demand forecasts in 30-minute buckets, trained on session history per station.',
      icon: <LineChart className="h-5 w-5 text-mint-green" strokeWidth={1.5} />,
    },
    {
      eyebrow: 'Capacity',
      title: 'Serializable capacity guard',
      desc: 'Transactional booking engine rejects any request that would push a station past safe capacity.',
      icon: <Shield className="h-5 w-5 text-mint-green" strokeWidth={1.5} />,
    },
    {
      eyebrow: 'Pricing',
      title: 'Dynamic pricing engine',
      desc: 'Forecast-informed pricing shifts drivers away from predicted peak windows.',
      icon: <Gauge className="h-5 w-5 text-mint-green" strokeWidth={1.5} />,
    },
    {
      eyebrow: 'Network',
      title: 'Multi-station orchestration',
      desc: 'Model each station’s grid allocation, connector mix, and pricing rules independently.',
      icon: <RadioTower className="h-5 w-5 text-mint-green" strokeWidth={1.5} />,
    },
    {
      eyebrow: 'Operations',
      title: 'Operator-grade dashboards',
      desc: 'Polling load curves, threshold alerts, and control-room visibility for every site.',
      icon: <Zap className="h-5 w-5 text-mint-green" strokeWidth={1.5} />,
    },
    {
      eyebrow: 'Drivers',
      title: 'Driver-first booking',
      desc: 'Frictionless slot picker with transparent pricing and instant confirmation.',
      icon: <Smartphone className="h-5 w-5 text-mint-green" strokeWidth={1.5} />,
    },
  ];

  return (
    <div className="flex flex-col">
      {/* ── Hero: the only colored surface in the system ─────────────── */}
      {/* The teal band stops short of the section's bottom edge so the product
          mockup spans the seam between the hero and the white page below. */}
      <section className="relative">
        <div className="gp-hero absolute inset-x-0 top-0 bottom-[180px] overflow-hidden">
          <CloudLandscape />
        </div>

        <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-center px-6 pb-24 pt-24 text-center">
          <p className="text-[13px] font-medium uppercase leading-[1.5] tracking-[0.65px] text-paper-white/70">
            Live grid intelligence · v2.4
          </p>

          <h1 className="mt-6 max-w-4xl text-[40px] font-semibold leading-[1.15] tracking-[-0.4px] text-paper-white sm:text-[57px] sm:leading-[1.1] sm:tracking-[-1.14px]">
            Charge faster. Protect the grid.
          </h1>

          <p className="mt-6 max-w-2xl text-[18px] font-normal leading-[1.5] text-paper-white/80">
            GridPulse forecasts EV demand in 30-minute buckets, blocks bookings that would overload your
            capacity, and flattens peaks with forecast-informed dynamic pricing.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/driver" className="gp-btn-primary">
              Start for free
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <Link
              href="/operator"
              className="inline-flex items-center gap-2 rounded-md border border-paper-white/25 px-4 py-2 text-[15px] font-medium text-paper-white transition-colors hover:bg-paper-white/10"
            >
              See the platform
            </Link>
          </div>
        </div>

        {/* Product mockup bridges the hero into the white section below. */}
        <div className="relative z-10 mx-auto w-full max-w-[1080px] px-6">
          <ProductMockup />
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-20 px-6 pb-24 pt-20">
        {/* ── Platform stats band ──────────────────────────────────────── */}
        <section className="grid gap-8 border-y border-mist-gray py-10 sm:grid-cols-4">
          {[
            ['30 min', 'Forecast bucket'],
            ['24 h', 'Forecast horizon'],
            ['Serializable', 'Booking isolation'],
            ['Per-station', 'Model + pricing scope'],
          ].map(([value, label]) => (
            <div key={label}>
              <div className="text-[24px] font-semibold leading-[1.33] tracking-[-0.24px] text-ink-black">{value}</div>
              <div className="mt-1 text-[14px] text-muted-gray">{label}</div>
            </div>
          ))}
        </section>

        {/* ── Capability grid ──────────────────────────────────────────── */}
        <section className="flex flex-col gap-12">
          <div className="flex max-w-2xl flex-col gap-4">
            <span className="gp-eyebrow">
              <span className="gp-eyebrow-dot" />
              The platform
            </span>
            <h2 className="text-[40px] font-semibold leading-[1.15] tracking-[-0.4px] text-ink-black">
              One control loop for every kilowatt
            </h2>
            <p className="text-[16px] leading-[1.5] tracking-[-0.16px] text-muted-gray">
              From forecast to booking to price, GridPulse closes the loop between predicted demand and the
              grid you are actually allowed to draw from.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {platformFeatures.map((feature) => (
              <article key={feature.title} className="gp-feature-card">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-paper-white">
                  {feature.icon}
                </div>
                <span className="gp-eyebrow">{feature.eyebrow}</span>
                <h3 className="mt-2 text-[20px] font-semibold leading-[1.3] tracking-[-0.2px] text-ink-black">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[16px] leading-[1.5] tracking-[-0.16px] text-true-black">{feature.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── For drivers ──────────────────────────────────────────────── */}
        <section className="grid items-center gap-14 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <span className="gp-eyebrow">
              <span className="gp-eyebrow-dot" />
              For drivers
            </span>
            <h3 className="text-[40px] font-semibold leading-[1.15] tracking-[-0.4px] text-ink-black">
              Book a slot in under 10 seconds.
            </h3>
            <p className="text-[16px] leading-[1.5] tracking-[-0.16px] text-muted-gray">
              Drivers see live availability, transparent pricing, and confirmed slots with no wasted trip to a
              full station.
            </p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {[
                ['Live availability', 'Real-time slot data'],
                ['Instant confirm', 'Transactional bookings'],
                ['Smart pricing', 'Cheaper off-peak windows'],
                ['Any station', 'Multi-network aware'],
              ].map(([title, desc]) => (
                <div key={title} className="gp-card p-6">
                  <div className="text-[16px] font-medium tracking-[-0.16px] text-ink-black">{title}</div>
                  <div className="mt-1 text-[14px] text-muted-gray">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          <BookingMockup />
        </section>

        {/* ── Forecasting engine ───────────────────────────────────────── */}
        <section className="grid items-center gap-14 lg:grid-cols-2">
          <div className="order-2 flex flex-col gap-5 lg:order-1">
            <span className="gp-eyebrow">
              <span className="gp-eyebrow-dot" />
              Forecasting engine
            </span>
            <h3 className="text-[40px] font-semibold leading-[1.15] tracking-[-0.4px] text-ink-black">
              Predict demand before it hits your transformers.
            </h3>
            <p className="text-[16px] leading-[1.5] tracking-[-0.16px] text-muted-gray">
              A dedicated FastAPI plus Prophet service produces 30-minute demand curves per station and feeds
              them directly into pricing and capacity logic. Retraining is triggered manually per station
              today, not on an automatic schedule.
            </p>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              {[
                ['30 min', 'Bucket resolution'],
                ['24 h', 'Forecast horizon'],
                ['Manual', 'Retrain trigger'],
                ['Per-station', 'Model isolation'],
              ].map(([value, label]) => (
                <div key={value} className="gp-stat-card">
                  <span className="gp-eyebrow">{label}</span>
                  <div className="mt-2 text-[24px] font-semibold leading-[1.33] tracking-[-0.24px] text-ink-black">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <LoadCurveMockup />
          </div>
        </section>

        {/* ── For operators ────────────────────────────────────────────── */}
        <section className="grid items-center gap-14 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <span className="gp-eyebrow">
              <span className="gp-eyebrow-dot" />
              For operators
            </span>
            <h3 className="text-[40px] font-semibold leading-[1.15] tracking-[-0.4px] text-ink-black">
              A control room that never blinks.
            </h3>
            <p className="text-[16px] leading-[1.5] tracking-[-0.16px] text-muted-gray">
              Watch stress build in real time, tune pricing rules on the fly, and get alerted the moment any
              station approaches its ceiling.
            </p>
            <ul className="mt-2 flex flex-col gap-3">
              {[
                'Live polling load curves with actual and forecast awareness',
                'Threshold alerts for grid stress and pricing intervention',
                'Point-and-click pricing rules with instant preview',
                'Role-protected access with session-based operator gating',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-mint-green" strokeWidth={1.5} />
                  <span className="text-[16px] leading-[1.5] tracking-[-0.16px] text-true-black">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <ControlRoomMockup />
        </section>

        {/* ── Closing CTA ──────────────────────────────────────────────── */}
        <section className="gp-panel flex flex-col items-center gap-6 px-8 py-16 text-center">
          <h3 className="max-w-2xl text-[40px] font-semibold leading-[1.15] tracking-[-0.4px] text-ink-black">
            Ready to see GridPulse on your network?
          </h3>
          <p className="max-w-xl text-[16px] leading-[1.5] tracking-[-0.16px] text-muted-gray">
            We’ll model one station, run a forecast on real history, and show peak-flattening in action in a
            30-minute call.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/sign-in" className="gp-btn-primary">
              Start for free
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <Link href="/operator" className="gp-btn-secondary">
              See the platform
            </Link>
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}

/**
 * The hand-illustrated cloud landscape — soft volumetric cumulus in warm
 * yellow and cream over the teal sky. This is the only expressive visual on
 * the site; every section below the hero is pure UI.
 */
function CloudLandscape() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 720"
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        {/* Warm cumulus body: lit cream crown falling to a golden underside. */}
        <linearGradient id="cloudWarm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffaea" />
          <stop offset="45%" stopColor="#fdeec2" />
          <stop offset="100%" stopColor="#eec987" />
        </linearGradient>
        <linearGradient id="cloudCream" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffdf5" />
          <stop offset="100%" stopColor="#f7e8bf" />
        </linearGradient>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffeeb8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffeeb8" stopOpacity="0" />
        </radialGradient>

        {/* Depth is carried by blur: the further the bank, the softer the edge. */}
        <filter id="blurFar" x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="26" />
        </filter>
        <filter id="blurMid" x="-25%" y="-50%" width="150%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id="blurNear" x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id="blurHighlight" x="-40%" y="-80%" width="180%" height="260%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>

      <circle cx="1160" cy="150" r="300" fill="url(#sunGlow)" />

      {/* Far cumulus bank */}
      <g fill="url(#cloudCream)" opacity="0.2" filter="url(#blurFar)">
        <ellipse cx="215" cy="180" rx="135" ry="52" />
        <ellipse cx="312" cy="152" rx="98" ry="62" />
        <ellipse cx="1232" cy="228" rx="155" ry="56" />
        <ellipse cx="1128" cy="198" rx="100" ry="54" />
      </g>

      {/* Mid cumulus */}
      <g fill="url(#cloudWarm)" opacity="0.82" filter="url(#blurMid)">
        <ellipse cx="148" cy="432" rx="185" ry="74" />
        <ellipse cx="272" cy="398" rx="122" ry="84" />
        <ellipse cx="382" cy="442" rx="142" ry="62" />
        <ellipse cx="1302" cy="450" rx="192" ry="78" />
        <ellipse cx="1172" cy="416" rx="120" ry="84" />
        <ellipse cx="1058" cy="454" rx="134" ry="58" />
      </g>

      {/* Near cumulus — the volumetric foreground bank */}
      <g fill="url(#cloudWarm)" filter="url(#blurNear)">
        <ellipse cx="80" cy="648" rx="240" ry="112" />
        <ellipse cx="248" cy="602" rx="164" ry="124" />
        <ellipse cx="414" cy="660" rx="182" ry="94" />
        <ellipse cx="1386" cy="648" rx="248" ry="114" />
        <ellipse cx="1212" cy="606" rx="168" ry="126" />
        <ellipse cx="1042" cy="666" rx="182" ry="90" />
        <ellipse cx="720" cy="726" rx="360" ry="88" />
      </g>

      {/* Sunlit crowns — the painterly touch that gives the banks volume. */}
      <g fill="#fffdf3" opacity="0.45" filter="url(#blurHighlight)">
        <ellipse cx="236" cy="548" rx="104" ry="42" />
        <ellipse cx="1200" cy="552" rx="106" ry="42" />
        <ellipse cx="270" cy="362" rx="70" ry="26" />
        <ellipse cx="1168" cy="382" rx="72" ry="26" />
      </g>
    </svg>
  );
}

/**
 * Hero showcase — the GridPulse product UI rendered as a floating white card
 * that overlaps the hero into the white section. Left sidebar carries the only
 * Mint Green active nav state in the system.
 */
function ProductMockup() {
  // Icons are 16px stroke 1.5 — Mint Green on the active row, True Black otherwise.
  const sidebar = [
    { label: 'Overview', Icon: LayoutGrid, active: false },
    { label: 'Load curve', Icon: LineChart, active: true },
    { label: 'Stations', Icon: RadioTower, active: false },
    { label: 'Pricing rules', Icon: Gauge, active: false },
    { label: 'Forecasts', Icon: TrendingUp, active: false },
    { label: 'Alerts', Icon: Bell, active: false },
  ];

  return (
    <div className="overflow-hidden rounded-2xl bg-paper-white p-6 shadow-[0_24px_60px_rgba(4,55,44,0.28)]">
      <div className="grid gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[180px_1fr_180px]">
        {/* Sidebar */}
        <nav className="flex flex-col gap-1 border-r border-mist-gray pr-4">
          {sidebar.map(({ label, Icon, active }) => (
            <span
              key={label}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[16px] ${
                active ? 'bg-mint-green/6 font-medium text-mint-green' : 'text-true-black'
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${active ? 'text-mint-green' : 'text-true-black'}`}
                strokeWidth={1.5}
              />
              {label}
            </span>
          ))}
        </nav>

        {/* Main */}
        <div className="min-w-0">
          <div className="flex gap-6 border-b border-mist-gray pb-2">
            {['Live', 'Forecast', 'History'].map((tab, i) => (
              <span
                key={tab}
                className={`pb-1 text-[14px] ${
                  i === 0
                    ? 'border-b-2 border-ink-black font-medium text-ink-black'
                    : 'text-muted-gray'
                }`}
              >
                {tab}
              </span>
            ))}
          </div>

          <h4 className="mt-5 text-[24px] font-semibold leading-[1.33] tracking-[-0.24px] text-ink-black">
            Downtown Hub — load curve
          </h4>
          <p className="mt-1 text-[14px] text-muted-gray">
            Booked kW against station capacity, in 30-minute slices.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              ['Peak booked', '412 kW'],
              ['Utilization', '68%'],
              ['Headroom', '188 kW'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-cloud-gray px-3 py-2.5">
                <div className="text-[13px] text-muted-gray">{label}</div>
                <div className="mt-0.5 text-[16px] font-medium text-ink-black">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-mist-gray p-4">
            <svg viewBox="0 0 520 180" className="h-auto w-full" role="img" aria-label="Example load curve">
              <g stroke="#f2f2f2" strokeWidth="1">
                {[36, 72, 108, 144].map((y) => (
                  <line key={y} x1="0" y1={y} x2="520" y2={y} />
                ))}
              </g>
              <line x1="0" y1="34" x2="520" y2="34" stroke="#08090a" strokeWidth="1.5" strokeDasharray="5 5" />
              <path
                d="M0 148 C60 142, 110 128, 165 100 S 258 62, 320 56 S 420 92, 520 122 L520 180 L0 180 Z"
                fill="rgba(12,140,94,0.08)"
              />
              <path
                d="M0 148 C60 142, 110 128, 165 100 S 258 62, 320 56 S 420 92, 520 122"
                fill="none"
                stroke="#0c8c5e"
                strokeWidth="2"
              />
              <circle cx="320" cy="56" r="4" fill="#0c8c5e" />
            </svg>
          </div>
        </div>

        {/* On this page */}
        <aside className="hidden flex-col gap-2 lg:flex">
          <div className="text-[13px] font-medium uppercase tracking-[0.65px] text-muted-gray">On this page</div>
          {['Live load', 'Capacity guard', 'Pricing rule', 'Alert history'].map((item, i) => (
            <span key={item} className={`text-[14px] ${i === 0 ? 'text-mint-green' : 'text-muted-gray'}`}>
              {item}
            </span>
          ))}
        </aside>
      </div>
    </div>
  );
}

function BookingMockup() {
  return (
    <div className="gp-panel p-6">
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-medium uppercase tracking-[0.65px] text-muted-gray">
          Book your charging slot
        </div>
        <span className="gp-tag">30-min buckets</span>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2">
        {[
          ['14:00', '22%', false],
          ['14:30', '41%', true],
          ['15:00', '68%', false],
          ['15:30', 'Full', false],
        ].map(([time, load, selected]) => (
          <div
            key={time as string}
            className={`rounded-md border p-3 ${
              selected ? 'border-mint-green bg-mint-green/6' : 'border-cloud-gray'
            }`}
          >
            <div className={`text-[16px] font-medium ${selected ? 'text-mint-green' : 'text-ink-black'}`}>
              {time}
            </div>
            <div className="mt-1 text-[13px] text-muted-gray">{load}</div>
          </div>
        ))}
      </div>

      <dl className="mt-6 flex flex-col gap-3 text-[14px]">
        {[
          ['Station', 'GreenWay Station'],
          ['Slot', '14:30 · 30 min'],
          ['Est. energy', '24 kWh'],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between border-b border-mist-gray pb-3">
            <dt className="text-muted-gray">{k}</dt>
            <dd className="font-medium text-ink-black">{v}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between">
          <dt className="text-muted-gray">Estimated total</dt>
          <dd className="text-[20px] font-semibold tracking-[-0.2px] text-ink-black">₹288.00</dd>
        </div>
      </dl>

      <div className="gp-btn-primary mt-6 w-full">Confirm booking</div>
    </div>
  );
}

function LoadCurveMockup() {
  return (
    <div className="gp-panel p-6">
      <div className="flex items-center justify-between">
        <div className="text-[16px] font-medium tracking-[-0.16px] text-ink-black">Forecast vs. booked</div>
        <span className="gp-tag">Next 24 h</span>
      </div>
      <svg viewBox="0 0 540 240" className="mt-5 h-auto w-full" role="img" aria-label="Example forecast curve">
        <g stroke="#f2f2f2" strokeWidth="1">
          {[48, 96, 144, 192].map((y) => (
            <line key={y} x1="0" y1={y} x2="540" y2={y} />
          ))}
        </g>
        <path
          d="M0 190 C70 182, 120 168, 165 138 S 255 96, 320 88 S 418 124, 540 162 L540 240 L0 240 Z"
          fill="rgba(12,140,94,0.08)"
        />
        <path
          d="M0 190 C70 182, 120 168, 165 138 S 255 96, 320 88 S 418 124, 540 162"
          fill="none"
          stroke="#0c8c5e"
          strokeWidth="2.5"
        />
        <path
          d="M235 104 C290 90, 345 84, 410 106 S 485 138, 540 156"
          fill="none"
          stroke="#08090a"
          strokeWidth="2"
          strokeDasharray="6 6"
        />
        <circle cx="235" cy="104" r="4.5" fill="#0c8c5e" />
      </svg>
      <div className="mt-4 flex flex-wrap gap-5 text-[13px] text-muted-gray">
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-6 bg-mint-green" /> Booked load
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-6 border-t-2 border-dashed border-ink-black" /> Forecast
        </span>
      </div>
    </div>
  );
}

function ControlRoomMockup() {
  return (
    <div className="gp-panel p-6">
      <div className="flex items-center justify-between border-b border-mist-gray pb-4">
        <div>
          <div className="text-[13px] font-medium uppercase tracking-[0.65px] text-muted-gray">
            Operator control room
          </div>
          <div className="mt-1 text-[20px] font-semibold tracking-[-0.2px] text-ink-black">
            All systems nominal
          </div>
        </div>
        <span className="gp-tag">
          <span className="gp-eyebrow-dot" /> 5 stations
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {[
          ['Peak booked load', '412 kW'],
          ['Capacity headroom', '188 kW'],
        ].map(([label, value]) => (
          <div key={label} className="gp-stat-card">
            <span className="gp-eyebrow">{label}</span>
            <div className="mt-2 text-[40px] font-semibold leading-[1.15] tracking-[-0.4px] text-ink-black">
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className="gp-notice gp-notice-success mt-4">
        Grid stress is under control — peak load sits at 68% of station capacity.
      </div>
    </div>
  );
}
