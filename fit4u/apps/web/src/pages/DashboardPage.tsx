import { Flame, Sparkles, Target, Trophy } from "lucide-react";

import { Card, CardHeader, CardTitle } from "../components/ui";
import { useGamificationProfile } from "../services/useGamification";
import { useMe } from "../services/useUsers";
import { useWorkoutStatistics } from "../services/useWorkouts";

const XP_PER_LEVEL = 500;

/** Dashboard web (Volume 4) — équivalent desktop du Dashboard mobile, layout large-écran. */
export function DashboardPage(): JSX.Element {
  const { data: me } = useMe();
  const { data: xp } = useGamificationProfile();
  const { data: workoutStats } = useWorkoutStatistics();

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary">Bonjour {me?.profile.firstName} 👋</h1>
        <p className="text-textSecondary">Voici où tu en es aujourd'hui.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <Target className="text-primary" size={20} />
            <div>
              <p className="text-xs text-textSecondary">Niveau</p>
              <p className="text-xl font-bold text-textPrimary">{xp?.currentLevel ?? 1}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Flame className="text-primary" size={20} />
            <div>
              <p className="text-xs text-textSecondary">Calories brûlées</p>
              <p className="text-xl font-bold text-textPrimary">{workoutStats?.totalCaloriesBurned ?? 0}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Trophy className="text-primary" size={20} />
            <div>
              <p className="text-xs text-textSecondary">Séances complétées</p>
              <p className="text-xl font-bold text-textPrimary">{workoutStats?.totalCompleted ?? 0}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Sparkles className="text-primary" size={20} />
            <div>
              <p className="text-xs text-textSecondary">XP total</p>
              <p className="text-xl font-bold text-textPrimary">{xp?.totalXp ?? 0} / {XP_PER_LEVEL}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teddy</CardTitle>
        </CardHeader>
        <p className="text-sm text-textSecondary">
          Ouvre l'onglet Teddy pour discuter avec ton coach IA, générer un programme ou analyser ta progression.
        </p>
      </Card>
    </div>
  );
}
