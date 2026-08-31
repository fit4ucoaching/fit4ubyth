import { CreditCard, LifeBuoy, ShoppingBag, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardHeader, CardTitle } from "../components/ui";
import { useAdminDashboard } from "../services/useAdminDashboard";
import { useWorkoutEngagement } from "../services/useAdminAnalytics";

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function formatDayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { weekday: "short" }).slice(0, 1).toUpperCase();
}

/** Dashboard BackOffice (Volume 4) — vue d'ensemble, graphiques (Recharts). */
export function DashboardPage(): JSX.Element {
  const { data: stats } = useAdminDashboard();
  // Bug corrigé (revue continue) : ce graphique affichait un tableau
  // d'exemple codé en dur (toujours à zéro) plutôt qu'une vraie donnée —
  // `/admin/analytics/workout-engagement` existe désormais (voir AnalyticsPage).
  const { data: weeklyActivity } = useWorkoutEngagement(7);
  const activityChartData = (weeklyActivity ?? []).map((p) => ({ name: formatDayLabel(p.day), value: p.value }));

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-2xl font-bold text-textPrimary">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <Users className="text-primary" size={20} />
            <div>
              <p className="text-xs text-textSecondary">Utilisateurs</p>
              <p className="text-xl font-bold text-textPrimary">{stats?.totalUsers ?? "—"}</p>
              <p className="text-xs text-success">+{stats?.newUsers30d ?? 0} (30j)</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-primary" size={20} />
            <div>
              <p className="text-xs text-textSecondary">Commandes</p>
              <p className="text-xl font-bold text-textPrimary">{stats?.totalOrders ?? "—"}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <CreditCard className="text-primary" size={20} />
            <div>
              <p className="text-xs text-textSecondary">Revenu total</p>
              <p className="text-xl font-bold text-textPrimary">{formatCurrency(stats?.totalRevenueCents ?? 0)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <LifeBuoy className="text-primary" size={20} />
            <div>
              <p className="text-xs text-textSecondary">Tickets ouverts</p>
              <p className="text-xl font-bold text-textPrimary">{stats?.openTickets ?? "—"}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activité de la semaine</CardTitle>
        </CardHeader>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-text-tertiary)" />
              <YAxis stroke="var(--color-text-tertiary)" />
              <Tooltip contentStyle={{ backgroundColor: "var(--color-surface-elevated)", border: "none" }} />
              <Bar dataKey="value" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
