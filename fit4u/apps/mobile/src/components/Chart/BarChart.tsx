import { Bar, CartesianChart } from "victory-native";
import { View } from "react-native";

export interface BarChartDataPoint {
  label: string;
  value: number;
}

export interface BarChartProps {
  data: BarChartDataPoint[];
  color?: string;
  height?: number;
}

/** Graphique en barres — séances/semaine, calories/jour. */
export function BarChart({ data, color = "#FF6B00", height = 200 }: BarChartProps): JSX.Element {
  const chartData = data.map((point, index) => ({ x: index, y: point.value, label: point.label }));

  return (
    <View style={{ height }}>
      <CartesianChart data={chartData} xKey="x" yKeys={["y"]}>
        {({ points, chartBounds }) => (
          <Bar points={points.y} chartBounds={chartBounds} color={color} roundedCorners={{ topLeft: 6, topRight: 6 }} />
        )}
      </CartesianChart>
    </View>
  );
}
