import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

export interface CalendarProps {
  selectedDate?: Date;
  onSelectDate: (date: Date) => void;
  /** Dates à marquer d'un point (ex. jours avec séance loggée). */
  markedDates?: Date[];
}

const WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

function buildMonthGrid(month: Date): (Date | null)[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leadingBlanks = (firstDay.getDay() + 6) % 7; // semaine commençant lundi

  const days: (Date | null)[] = Array.from({ length: leadingBlanks }, () => null);
  for (let d = 1; d <= daysInMonth; d += 1) days.push(new Date(year, monthIndex, d));
  return days;
}

/** Calendrier mensuel simple — planification de séances, historique de progression. */
export function Calendar({ selectedDate, onSelectDate, markedDates = [] }: CalendarProps): JSX.Element {
  const [visibleMonth, setVisibleMonth] = useState(() => selectedDate ?? new Date());
  const days = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth]);

  const monthLabel = visibleMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <View className="gap-md">
      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityLabel="Mois précédent"
          onPress={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}
        >
          <ChevronLeft size={20} color="#B3B3B3" />
        </Pressable>
        <Text className="text-textPrimary font-semibold capitalize">{monthLabel}</Text>
        <Pressable
          accessibilityLabel="Mois suivant"
          onPress={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}
        >
          <ChevronRight size={20} color="#B3B3B3" />
        </Pressable>
      </View>

      <View className="flex-row">
        {WEEKDAY_LABELS.map((label, i) => (
          <Text key={`${label}-${i}`} className="flex-1 text-center text-textTertiary text-xs">
            {label}
          </Text>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {days.map((day, index) => {
          if (!day) return <View key={`blank-${index}`} className="w-[14.28%] aspect-square" />;

          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const isMarked = markedDates.some((m) => isSameDay(m, day));

          return (
            <Pressable
              key={day.toISOString()}
              onPress={() => onSelectDate(day)}
              accessibilityRole="button"
              className="w-[14.28%] aspect-square items-center justify-center"
            >
              <View className={`h-8 w-8 items-center justify-center rounded-full ${isSelected ? "bg-primary" : ""}`}>
                <Text className={isSelected ? "text-white font-semibold" : "text-textPrimary"}>{day.getDate()}</Text>
              </View>
              {isMarked && !isSelected ? <View className="mt-xxs h-1 w-1 rounded-full bg-primary" /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
