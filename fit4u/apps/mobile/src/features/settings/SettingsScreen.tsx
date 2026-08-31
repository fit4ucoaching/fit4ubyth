import { ChevronRight, Shield, Sparkles, Trash2 } from "lucide-react-native";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SegmentedControl } from "../../components/SegmentedControl/SegmentedControl";
import { useTheme } from "../../theme";
import { useUpdateNotificationSetting, useUpdatePreferences, useUpdatePrivacy } from "../../services/useProfiles";
import { useUserStore } from "../../store/userStore";
import { AccountSection } from "./AccountSection";

const LANGUAGES = [
  { value: "fr", label: "Français" }, { value: "en", label: "English" }, { value: "es", label: "Español" },
];

/**
 * Paramètres (Volume 4) — Compte/Sécurité regroupés dans `AccountSection`
 * (formulaires dédiés), le reste en toggles/selects inline pour un accès
 * rapide sans multiplier les écrans.
 */
export function SettingsScreen(): JSX.Element {
  const { mode, setMode } = useTheme();
  const { privacy, notifications, preferences } = useUserStore();
  const updatePrivacy = useUpdatePrivacy();
  const updateNotification = useUpdateNotificationSetting();
  const updatePreferences = useUpdatePreferences();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-lg py-lg gap-xl">
        <Text className="text-textPrimary text-2xl font-bold">Paramètres</Text>

        <AccountSection />

        <View className="gap-sm">
          <Text className="text-textSecondary text-xs uppercase font-semibold">Apparence</Text>
          <SegmentedControl
            options={[{ value: "light", label: "Clair" }, { value: "dark", label: "Sombre" }, { value: "system", label: "Système" }]}
            value={mode}
            onChange={setMode}
          />
        </View>

        <View className="gap-sm">
          <Text className="text-textSecondary text-xs uppercase font-semibold">Notifications</Text>
          {notifications.map((setting) => (
            <View key={setting.type} className="flex-row items-center justify-between py-xs">
              <Text className="text-textPrimary">{setting.type === "PUSH" ? "Push" : setting.type === "EMAIL" ? "Email" : "Dans l'app"}</Text>
              <Switch
                value={setting.isEnabled}
                onValueChange={(value) => updateNotification.mutate({ type: setting.type, isEnabled: value })}
                trackColor={{ true: "#FF6B00" }}
              />
            </View>
          ))}
        </View>

        <View className="gap-sm">
          <Text className="text-textSecondary text-xs uppercase font-semibold">Confidentialité</Text>
          <View className="flex-row items-center justify-between py-xs">
            <View className="flex-row items-center gap-xs">
              <Shield size={16} color="#B3B3B3" />
              <Text className="text-textPrimary">Afficher dans les classements</Text>
            </View>
            <Switch
              value={privacy?.showInLeaderboards ?? true}
              onValueChange={(value) => updatePrivacy.mutate({ showInLeaderboards: value })}
              trackColor={{ true: "#FF6B00" }}
            />
          </View>
        </View>

        <View className="gap-sm">
          <Text className="text-textSecondary text-xs uppercase font-semibold">Unités</Text>
          <SegmentedControl
            options={[{ value: "METRIC", label: "Métrique (kg/cm)" }, { value: "IMPERIAL", label: "Impérial (lb/ft)" }]}
            value={preferences?.measurementSystem ?? "METRIC"}
            onChange={(value) => updatePreferences.mutate({ measurementSystem: value as "METRIC" | "IMPERIAL" })}
          />
        </View>

        <Pressable className="flex-row items-center justify-between py-sm">
          <View className="flex-row items-center gap-xs">
            <Sparkles size={16} color="#B3B3B3" />
            <Text className="text-textPrimary">Voix de Teddy</Text>
          </View>
          <ChevronRight size={18} color="#767676" />
        </Pressable>

        <Pressable className="flex-row items-center gap-xs py-sm">
          <Trash2 size={16} color="#E74C3C" />
          <Text className="text-danger">Supprimer mon compte</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
