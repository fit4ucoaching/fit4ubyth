import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export interface TabItem {
  key: string;
  label: string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeKey?: string;
  onChange?: (key: string) => void;
  children: (activeKey: string) => React.ReactNode;
}

/** Onglets horizontaux défilables — utilisés pour Profil (Statistiques/Badges/Historique), Nutrition, etc. */
export function Tabs({ tabs, activeKey, onChange, children }: TabsProps): JSX.Element {
  const [internalActive, setInternalActive] = useState(tabs[0]?.key ?? "");
  const active = activeKey ?? internalActive;

  const handleChange = (key: string): void => {
    setInternalActive(key);
    onChange?.(key);
  };

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="border-b border-border">
        <View className="flex-row gap-lg px-lg">
          {tabs.map((tab) => {
            const isActive = tab.key === active;
            return (
              <Pressable
                key={tab.key}
                onPress={() => handleChange(tab.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                className={`border-b-2 py-sm ${isActive ? "border-primary" : "border-transparent"}`}
              >
                <Text className={`text-sm font-semibold ${isActive ? "text-primary" : "text-textSecondary"}`}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View className="flex-1">{children(active)}</View>
    </View>
  );
}
