import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardHeader, CardTitle } from "../components/ui";
import {
  useRetentionCohorts, useRevenueTrend, useTeddyUsage,
  useTopExercises, useTopPrograms, useUserGrowth, useWorkoutEngagement,
} from "../services/useAdminAnalytics";

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

/**
 * Analytics BI (Volume 6, dernier gap comblé) — décision d'architecture :
 * un jeu de graphiques CURÉS et pertinents (comparaison avec Stripe
 * Dashboard/Shopify Admin/Linear/Vercel), jamais un constructeur de
 * requêtes générique auto-service qui serait de la sur-ingénierie à ce
 * stade (Volume 8 §22). Chaque graphique répond à une vraie question
 * métier, toutes les données proviennent d'agrégations Prisma/SQL réelles
 * — jamais de données d'exemple, contrairement à un ancien placeholder du
 * Dashboard (Volume 4), désormais également corrigé.
 */
export function AnalyticsPage(): JSX.Element {
  const [days] = useState(30);
  const { data: userGrowth } = useUserGrowth(days);
  const { data: revenueTrend } = useRevenueTrend(days);
  const { data: workoutEngagement } = useWorkoutEngagement(days);
  const { data: teddyUsage } = useTeddyUsage(days);
  const { data: retention } = useRetentionCohorts(8);
  const { data: topExercises } = useTopExercises(5);
  const { data: topPrograms } = useTopPrograms(5);

  const chartData = (series: { day: string; value: number }[] | undefined) => (series ?? []).map((p) => ({ ...p, label: formatDay(p.day) }));

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-3">
        <BarChart3 className="text-primary" size={24} />
        <h1 className="text-2xl font-bold text-textPrimary">Analytics</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Croissance utilisateurs (30 j)</CardTitle></CardHeader>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData(userGrowth)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="label" stroke="var(--color-text-tertiary)" />
                <YAxis stroke="var(--color-text-tertiary)" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--color-surface-elevated)", border: "none" }} />
                <Line type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Revenu Boutique quotidien (30 j)</CardTitle></CardHeader>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData(revenueTrend)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="label" stroke="var(--color-text-tertiary)" />
                <YAxis stroke="var(--color-text-tertiary)" tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ backgroundColor: "var(--color-surface-elevated)", border: "none" }} />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-textTertiary">Achats Boutique uniquement — distinct du MRR abonnements (voir module Paiements).</p>
        </Card>

        <Card>
          <CardHeader><CardTitle>Séances complétées (30 j)</CardTitle></CardHeader>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData(workoutEngagement)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="label" stroke="var(--color-text-tertiary)" />
                <YAxis stroke="var(--color-text-tertiary)" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--color-surface-elevated)", border: "none" }} />
                <Bar dataKey="value" fill="var(--color-success)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Messages Teddy par jour (30 j)</CardTitle></CardHeader>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData(teddyUsage)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="label" stroke="var(--color-text-tertiary)" />
                <YAxis stroke="var(--color-text-tertiary)" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--color-surface-elevated)", border: "none" }} />
                <Line type="monotone" dataKey="value" stroke="var(--color-warning)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Rétention J7 par cohorte hebdomadaire</CardTitle></CardHeader>
        <p className="mb-3 text-xs text-textTertiary">
          Part des utilisateurs de chaque semaine d'inscription ayant complété au moins une séance dans les 7 jours suivants.
        </p>
        <div className="space-y-2">
          {(retention ?? []).map((c) => (
            <div key={c.week} className="flex items-center gap-3">
              <span className="w-20 text-xs text-textSecondary">{formatDay(c.week)}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(c.retentionRate * 100)}%` }} />
              </div>
              <span className="w-32 text-right text-xs text-textSecondary">{Math.round(c.retentionRate * 100)}% ({c.retainedCount}/{c.cohortSize})</span>
            </div>
          ))}
          {(retention ?? []).length === 0 ? <p className="text-sm text-textTertiary">Pas assez de données sur la période.</p> : null}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Top exercices</CardTitle></CardHeader>
          <ol className="space-y-2">
            {(topExercises ?? []).map((e, i) => (
              <li key={e.exerciseId} className="flex items-center justify-between text-sm">
                <span className="text-textPrimary">{i + 1}. {e.exerciseName}</span>
                <span className="text-textSecondary">{e.completedCount} séances</span>
              </li>
            ))}
            {(topExercises ?? []).length === 0 ? <p className="text-sm text-textTertiary">Aucune donnée.</p> : null}
          </ol>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top programmes</CardTitle></CardHeader>
          <ol className="space-y-2">
            {(topPrograms ?? []).map((p, i) => (
              <li key={p.programId} className="flex items-center justify-between text-sm">
                <span className="text-textPrimary">{i + 1}. {p.programName}</span>
                <span className="text-textSecondary">{p.completedSessionsCount} séances</span>
              </li>
            ))}
            {(topPrograms ?? []).length === 0 ? <p className="text-sm text-textTertiary">Aucune donnée.</p> : null}
          </ol>
        </Card>
      </div>
    </div>
  );
}
