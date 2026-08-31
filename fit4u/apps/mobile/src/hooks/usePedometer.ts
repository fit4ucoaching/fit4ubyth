import { Pedometer } from "expo-sensors";
import { useEffect, useState } from "react";

/**
 * Comptage de pas du jour — capteur natif local (aucun backend requis).
 * Retourne `null` si l'API n'est pas disponible sur l'appareil (émulateur,
 * Android sans capteur) : le widget correspondant est alors masqué plutôt
 * que d'afficher une fausse donnée.
 */
export function useTodaySteps(): number | null {
  const [steps, setSteps] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    void Pedometer.isAvailableAsync().then((available) => {
      if (!available || !isMounted) return;

      const start = new Date();
      start.setHours(0, 0, 0, 0);

      void Pedometer.getStepCountAsync(start, new Date()).then((result) => {
        if (isMounted) setSteps(result.steps);
      });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return steps;
}
