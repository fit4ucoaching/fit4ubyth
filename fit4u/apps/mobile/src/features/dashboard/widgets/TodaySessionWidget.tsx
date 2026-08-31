import { Play } from "lucide-react-native";
import { Text, View } from "react-native";

import { Button } from "../../../components/Button/Button";
import { Card } from "../../../components/Card/Card";
import type { ProgramSummaryDTO } from "@fit4u/types";

export interface TodaySessionWidgetProps {
  suggestedTitle: string;
  program?: ProgramSummaryDTO;
  onStart: () => void;
}

/** Widget "Séance du jour" — premier point d'action du Dashboard (Volume 4). */
export function TodaySessionWidget({ suggestedTitle, program, onStart }: TodaySessionWidgetProps): JSX.Element {
  return (
    <Card variant="elevated" padding="lg" className="gap-md">
      <Text className="text-textSecondary text-xs uppercase font-semibold">Séance du jour</Text>
      <Text className="text-textPrimary text-xl font-bold">{suggestedTitle}</Text>
      {program ? <Text className="text-textSecondary text-sm">{program.name}</Text> : null}
      <Button label="Démarrer" leftIcon={<Play size={16} color="#FFFFFF" />} onPress={onStart} />
    </Card>
  );
}
