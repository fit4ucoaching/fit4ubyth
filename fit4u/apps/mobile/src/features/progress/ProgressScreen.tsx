import { Camera, Ruler, Weight } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import { Input } from "../../components/Input/Input";
import { LineChart } from "../../components/Chart/LineChart";
import { Tabs } from "../../components/Tabs/Tabs";
import { useLogMeasurement, useLogWeight, useProgressAnalytics, useProgressHistory } from "../../services/useProgress";

/** Poids/mensurations/photos + graphiques de tendance (Volume 4). */
export function ProgressScreen(): JSX.Element {
  const { data: history } = useProgressHistory();
  const { data: analytics } = useProgressAnalytics();
  const logWeight = useLogWeight();
  const logMeasurement = useLogMeasurement();
  const [weightInput, setWeightInput] = useState("");

  const weightSeries = (history?.weights ?? []).map((w: { weightKg: number; recordedAt: string }) => ({
    x: w.recordedAt,
    y: w.weightKg,
  }));

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-lg py-lg gap-lg">
        <Text className="text-textPrimary text-2xl font-bold">Progression</Text>

        {analytics ? (
          <Card variant="elevated" padding="lg" className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-textPrimary text-xl font-bold">{analytics.weightTrendKg.toFixed(1)} kg</Text>
              <Text className="text-textSecondary text-xs">Tendance</Text>
            </View>
            <View className="items-center">
              <Text className="text-textPrimary text-xl font-bold">{analytics.achievedGoals}/{analytics.totalGoals}</Text>
              <Text className="text-textSecondary text-xs">Objectifs atteints</Text>
            </View>
          </Card>
        ) : null}

        <Tabs tabs={[{ key: "weight", label: "Poids" }, { key: "measurements", label: "Mensurations" }, { key: "photos", label: "Photos" }]}>
          {(activeKey) => (
            <View className="gap-md pt-md">
              {activeKey === "weight" ? (
                <>
                  {weightSeries.length > 0 ? <LineChart data={weightSeries} /> : null}
                  <View className="flex-row items-end gap-sm">
                    <View className="flex-1">
                      <Input label="Nouveau poids (kg)" keyboardType="numeric" value={weightInput} onChangeText={setWeightInput} />
                    </View>
                    <Button
                      label="Ajouter"
                      leftIcon={<Weight size={16} color="#FFFFFF" />}
                      disabled={!weightInput}
                      onPress={() => {
                        logWeight.mutate({ weightKg: Number(weightInput) });
                        setWeightInput("");
                      }}
                    />
                  </View>
                </>
              ) : null}
              {activeKey === "measurements" ? (
                <Button label="Ajouter une mensuration" leftIcon={<Ruler size={16} color="#FFFFFF" />} onPress={() => logMeasurement.mutate({ bodyPart: "waist", valueCm: 0 })} />
              ) : null}
              {activeKey === "photos" ? (
                <Button label="Ajouter une photo" leftIcon={<Camera size={16} color="#FFFFFF" />} onPress={() => undefined} />
              ) : null}
            </View>
          )}
        </Tabs>
      </ScrollView>
    </SafeAreaView>
  );
}
