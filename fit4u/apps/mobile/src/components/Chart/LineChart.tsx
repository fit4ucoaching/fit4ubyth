import { CartesianChart, Line } from "victory-native";
import { View } from "react-native";

export interface LineChartDataPoint {
  x: number | string;
  y: number;
}

export interface LineChartProps {
  data: LineChartDataPoint[];
  color?: string;
  height?: number;
  yLabel?: string;
}

/**
 * Graphique linéaire — poids, XP, tendances nutrition (Volume 4 : Victory).
 * `x` accepte une date formatée en chaîne (axe temporel) ou un index numérique.
 */
export function LineChart({ data, color = "#FF6B00", height = 200 }: LineChartProps): JSX.Element {
  const chartData = data.map((point, index) => ({ x: index, y: point.y, label: String(point.x) }));

  return (
    <View style={{ height }}>
      <CartesianChart data={chartData} xKey="x" yKeys={["y"]}>
        {({ points }) => <Line points={points.y} color={color} strokeWidth={3} curveType="natural" />}
      </CartesianChart>
    </View>
  );
}
