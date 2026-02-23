// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';

/**
 * Landing page EduTrack AI
 * - Style: pastel éducatif, cartes blanches, ombres douces, icônes arrondies
 * - Sections: Hero, Trust bar, Features badges, Solution, Benefits, Testimonials,
 *             Pricing, FAQ, CTA final
 * - Assets: /public/illustrations/hero-parents.svg
 */

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 sm:py-20 lg:grid-cols-2">
          {/* Illustration */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur">
              <Image
                src="/illustrations/hero-parents.png"
                alt="Parents aidant leurs enfants à faire leurs devoirs"
                width={1200}
                height={900}
                priority
                className="h-auto w-full object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Texte */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-blue-700 shadow-sm">
              <IconSparkles className="h-4 w-4 text-blue-600" />
              Booster la réussite scolaire avec l’IA
            </div>

            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl">
              Découvrez <span className="text-blue-600">AVANT</span> qu’il soit
              <span className="text-rose-600"> trop tard</span> si votre enfant va échouer à l’école
            </h1>

            <p className="mt-5 text-lg text-gray-600">
              L’IA d’EduTrack analyse la progression scolaire de vos enfants,
              détecte les baisses, envoie des alertes intelligentes et propose
              des plans d’action concrets pour les aider à réussir.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link
                href="/auth/register"
                className="rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white shadow hover:from-blue-700 hover:to-indigo-700"
              >
                Commencer gratuitement
              </Link>
              <a
                href="#demo"
                className="rounded-md border-blue-200 bg-white px-6 py-3 text-blue-700 hover:bg-blue-50"
              >
                Voir la démo
              </a>
            </div>

            <ul className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-700">
              <li className="inline-flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-emerald-500" />
                Analyse intelligente
              </li>
              <li className="inline-flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-emerald-500" />
                Alertes automatiques
              </li>
              <li className="inline-flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-emerald-500" />
                Plans d’action
              </li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              Gratuit : 1 enfant. Sans carte bancaire.
            </p>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="mx-auto mt-10 max-w-6xl rounded-2xl bg-white/60 p-4 text-center shadow-sm backdrop-blur">
        <p className="text-xs uppercase tracking-wider text-gray-500">
          Conçu pour les parents pressés • Simple • Efficace • Fiable
        </p>
      </section>

      {/* FEATURES BADGES */}
      <section id="features" className="mx-auto mt-12 max-w-7xl">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureBadge
            title="Analyse des Notes"
            desc="Repère tendances & matières à risque."
            icon={<IconBrain className="h-5 w-5" />}
            color="indigo"
          />
          <FeatureBadge
            title="Alertes Intelligentes"
            desc="Prévenez avant les mauvaises surprises."
            icon={<IconBell className="h-5 w-5" />}
            color="amber"
          />
          <FeatureBadge
            title="Plans Personnalisés"
            desc="Actions concrètes adaptées à chaque enfant."
            icon={<IconPlan className="h-5 w-5" />}
            color="emerald"
          />
          <FeatureBadge
            title="Suivi Complet"
            desc="Notes, devoirs, moyennes et progrès."
            icon={<IconDashboard className="h-5 w-5" />}
            color="blue"
          />
        </div>
      </section>

      {/* SOLUTION SECTION */}
      <section id="demo" className="mx-auto mt-14 max-w-7xl">
        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          La Solution Complète pour Suivre et Améliorer la Scolarité
        </h2>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-3">
          {/* Mockup du tableau de bord */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl bg-white p-4 shadow-xl">
              <DashboardMockup />
            </div>
          </div>

          {/* Cartes descriptives */}
          <div className="grid gap-4">
            <InfoCard
              title="Analyse des Notes"
              desc="Visualisez les moyennes, matières fortes/faibles et l’évolution."
              icon={<IconBrain className="h-5 w-5 text-indigo-600" />}
            />
            <InfoCard
              title="Alertes Intelligentes"
              desc="Recevez des notifications si la moyenne chute ou si un devoir approche."
              icon={<IconBell className="h-5 w-5 text-amber-500" />}
            />
            <InfoCard
              title="Plans d’Action"
              desc="Conseils concrets et routines proposées par l’IA."
              icon={<IconPlan className="h-5 w-5 text-emerald-500" />}
            />
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto mt-14 max-w-7xl">
        <div className="grid gap-4 sm:grid-cols-3">
          <Benefit
            title="Suivi Scolaire Complet"
            desc="Centralisez notes, devoirs, et objectifs."
            color="indigo"
          />
          <Benefit
            title="Alertes Précoces"
            desc="Soyez informé en amont des baisses de notes."
            color="amber"
          />
          <Benefit
            title="Conseils Personnalisés"
            desc="Recevez des plans adaptés à chaque profil."
            color="emerald"
          />
        </div>
      </section>

      {/* TESTIMONIAL & RATING */}
      <section className="mx-auto mt-14 max-w-6xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-3xl">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar key={i} className="h-5 w-5 text-amber-400" />
                ))}
              </div>
              <p className="mt-3 text-gray-700">
                « Grâce à EduTrack AI, nous avons repéré les difficultés à temps.
                Les conseils pratiques et les alertes m’ont aidé à mieux
                accompagner mon enfant au quotidien. »
              </p>
              <p className="mt-2 text-sm text-gray-500">Parent satisfait</p>
            </div>
            <Link
              href="/auth/register"
              className="rounded-md bg-gray-900 px-5 py-3 text-white hover:bg-gray-800"
            >
              Essayer gratuitement
            </Link>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto mt-14 max-w-7xl">
        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Tarifs Flexibles pour Tous les Parents
        </h2>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {/* Free */}
          <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm">
            <span className="absolute left-4 top-4 rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
              Idéal pour commencer
            </span>
            <h3 className="mt-8 text-lg font-semibold">Gratuit</h3>
            <p className="mt-2 text-sm text-gray-600">1 enfant • Fonctionnalités essentielles</p>
            <div className="mt-4 flex items-end gap-1">
              <span className="text-4xl font-bold">0</span>
              <span className="pb-1 text-sm text-gray-500">/ mois</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li className="inline-flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-emerald-500" />
                1 enfant
              </li>
              <li className="inline-flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-emerald-500" />
                Suivi des notes & devoirs
              </li>
              <li className="inline-flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-emerald-500" />
                Alertes de base
              </li>
            </ul>
            <Link
              href="/auth/register"
              className="mt-6 inline-flex w-full justify-center rounded-md border-gray-300 bg-white px-4 py-2 text-gray-800 hover:bg-gray-50"
            >
              Commencer
            </Link>
          </div>

          {/* Premium */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-amber-50 to-white p-6 shadow-lg">
            <span className="absolute left-4 top-4 rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-800">
              Le plus populaire
            </span>
            <h3 className="mt-8 text-lg font-semibold">Premium</h3>
            <p className="mt-2 text-sm text-gray-700">Plusieurs enfants • IA avancée & plans d’action</p>
            <div className="mt-4 flex items-end gap-1">
              <span className="text-4xl font-bold">5</span>
              <span className="text-2xl font-semibold">€</span>
              <span className="pb-1 text-sm text-gray-500">/ mois</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li className="inline-flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-emerald-600" />
                Jusqu’à 10 enfants
              </li>
              <li className="inline-flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-emerald-600" />
                Alertes intelligentes avancées
              </li>
              <li className="inline-flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-emerald-600" />
                Conseils et plans personnalisés
              </li>
              <li className="inline-flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-emerald-600" />
                Priorité support
              </li>
            </ul>
            <Link
              href="/auth/register"
              className="mt-6 inline-flex w-full justify-center rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
            >
              Essayer Premium
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto mt-14 max-w-5xl">
        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Questions fréquentes
        </h2>
        <div className="mt-6 space-y-3">
          <FAQ
            q="Est-ce gratuit pour commencer ?"
            a="Oui. Le plan Gratuit inclut 1 enfant, le suivi des notes & devoirs, et des alertes de base."
          />
          <FAQ
            q="Comment fonctionnent les alertes intelligentes ?"
            a="Nous analysons l’évolution des notes et les échéances des devoirs pour prévenir les baisses et retards à l’avance."
          />
          <FAQ
            q="Puis-je ajouter plusieurs enfants ?"
            a="Oui, avec le plan Premium, vous pouvez suivre plusieurs enfants en parallèle."
          />
          <FAQ
            q="Puis-je annuler à tout moment ?"
            a="Bien sûr. Aucuns frais cachés, vous pouvez changer ou annuler votre plan à tout moment."
          />
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto mt-16 max-w-6xl rounded-2xl bg-white p-8 text-center shadow-sm">
        <h3 className="text-2xl font-semibold">
          Aidez votre enfant à réussir avant qu’il soit trop tard
        </h3>
        <p className="mt-2 text-gray-600">
          Commencez gratuitement et activez l’analyse IA en quelques minutes.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/auth/register"
            className="rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white shadow hover:from-blue-700 hover:to-indigo-700"
          >
            Créer mon compte
          </Link>
          <a
            href="#features"
            className="rounded-md border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50"
          >
            Explorer les fonctionnalités
          </a>
        </div>
      </section>
    </>
  );
}

/* ---------- Petits composants réutilisables ---------- */

function FeatureBadge({
  title,
  desc,
  icon,
  color = 'indigo',
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
  color?: 'indigo' | 'amber' | 'emerald' | 'blue';
}) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-700',
    amber: 'bg-amber-50 text-amber-800',
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
  };
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white p-5 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-600">{desc}</p>
      </div>
    </div>
  );
}

function InfoCard({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-700">
        {icon}
      </div>
      <div>
        <h4 className="text-base font-semibold text-gray-900">{title}</h4>
        <p className="mt-1 text-sm text-gray-600">{desc}</p>
      </div>
    </div>
  );
}

function Benefit({ title, desc, color }: { title: string; desc: string; color: 'indigo' | 'amber' | 'emerald' }) {
  const ring = {
    indigo: 'ring-indigo-200',
    amber: 'ring-amber-200',
    emerald: 'ring-emerald-200',
  }[color];
  const dot = {
    indigo: 'bg-indigo-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
  }[color];

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className={`inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-gray-700 ring-1 ${ring}`}>
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        {title}
      </div>
      <p className="mt-3 text-sm text-gray-600">{desc}</p>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-xl bg-white p-4 shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">{q}</span>
        <span className="ml-3 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 group-open:hidden">+</span>
        <span className="ml-3 hidden rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 group-open:inline">−</span>
      </summary>
      <p className="mt-2 text-sm text-gray-600">{a}</p>
    </details>
  );
}

/* ---------- Mock dashboard (SVG + UI) ---------- */
function DashboardMockup() {
  return (
    <div className="rounded-xl bg-white p-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
          <span className="ml-3 text-sm font-semibold text-gray-700">Tableau de bord</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Parent</span>
          <span className="h-6 w-6 rounded-full bg-indigo-100" />
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat title="Moyenne Générale" value="12.8 / 20" badge="Stable" color="emerald" />
        <Stat title="Devoirs à venir" value="3" badge="Cette semaine" color="amber" />
        <Stat title="Alertes" value="1" badge="Maths" color="rose" />
      </div>

      {/* Graph & subjects */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-4 lg:col-span-2">
          <p className="text-sm font-semibold text-gray-700">Évolution des notes</p>
          <svg viewBox="0 0 340 120" className="mt-3 h-28 w-full">
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,90 C40,60 60,70 90,50 C120,30 150,65 180,55 C210,45 240,35 270,50 C300,65 320,55 340,40"
              fill="none"
              stroke="#4f46e5"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M0,90 C40,60 60,70 90,50 C120,30 150,65 180,55 C210,45 240,35 270,50 C300,65 320,55 340,40 L340,120 L0,120 Z"
              fill="url(#grad)"
            />
          </svg>
          <div className="mt-2 text-xs text-gray-500">Derniers 6 mois</div>
        </div>

        <div className="grid gap-3">
          {[
            { name: 'Maths', score: 11.5, color: 'indigo' },
            { name: 'Français', score: 13.2, color: 'emerald' },
            { name: 'Sciences', score: 12.0, color: 'amber' },
          ].map((s) => (
            <div key={s.name} className="flex items-center justify-between rounded-lg bg-white p-3">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${dotColor(s.color)}`} />
                <p className="text-sm font-medium text-gray-800">{s.name}</p>
              </div>
              <p className="text-sm text-gray-700">{s.score}/20</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function dotColor(c: 'indigo' | 'emerald' | 'amber') {
  return { indigo: 'bg-indigo-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500' }[c];
}
function Stat({
  title,
  value,
  badge,
  color,
}: {
  title: string;
  value: string;
  badge: string;
  color: 'emerald' | 'amber' | 'rose';
}) {
  const bg = { emerald: 'bg-emerald-100 text-emerald-700', amber: 'bg-amber-100 text-amber-800', rose: 'bg-rose-100 text-rose-700' }[color];
  return (
    <div className="rounded-lg bg-white p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <div className="mt-1 flex items-end gap-2">
        <p className="text-xl font-semibold text-gray-900">{value}</p>
        <span className={`rounded-full px-2 py-0.5 text-xs ${bg}`}>{badge}</span>
      </div>
    </div>
  );
}

/* ---------- Icônes minimalistes (inline SVG) ---------- */
function IconCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
function IconSparkles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M5 3l1.5 3L10 7.5 6.5 9 5 12 3.5 9 0 7.5 3.5 6 5 3zm13 3l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4zM9 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
    </svg>
  );
}
function IconBrain(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 3a3 3 0 00-3 3v1a3 3 0 000 6v1a3 3 0 106 0V6a3 3 0 00-3-3zM19 7a3 3 0 00-3-3 3 3 0 00-3 3v8a3 3 0 106 0v-1a3 3 0 000-6V7z" />
    </svg>
  );
}
function IconBell(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2a6 6 0 00-6 6v2.586l-1.707 1.707A1 1 0 005 14h14a1 1 0 00.707-1.707L18 10.586V8a6 6 0 00-6-6zm0 20a3 3 0 002.995-2.824L15 19H9a3 3 0 003 3z" />
    </svg>
  );
}
function IconPlan(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4 4h16v2H4V4zm2 4h12v2H6V8zm-2 4h16v2H4v-2zm2 4h10v2H6v-2z" />
    </svg>
  );
}
function IconDashboard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3 3h8v8H3V3zm10 0h8v5h-8V3zM3 13h5v8H3v-8zm7 0h11v8H10v-8z" />
    </svg>
  );
}
function IconStar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
    </svg>
  );
}