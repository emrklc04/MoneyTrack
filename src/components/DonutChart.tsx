import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';

interface DonutChartProps {
  slices: { id: string; value: number; color: string }[];
  centerLabel: string;
  centerValue: string;
}

const SIZE = 220;
const STROKE = 28;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

export function DonutChart({ slices, centerLabel, centerValue }: DonutChartProps) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const arcs = slices.map((slice) => ({ ...slice, length: (slice.value / total) * C }));
  const ring = { cx: SIZE / 2, cy: SIZE / 2, r: R, strokeWidth: STROKE, fill: 'none' };

  return (
    <View style={{ width: SIZE, height: SIZE, alignSelf: 'center' }}>
      <Svg width={SIZE} height={SIZE}>
        <G rotation={-90} originX={SIZE / 2} originY={SIZE / 2}>
          <Circle {...ring} stroke="#E4E4E9" />
          {arcs.map((arc, i) => (
            <Circle
              key={arc.id}
              {...ring}
              stroke={arc.color}
              strokeDasharray={`${arc.length} ${C - arc.length}`}
              strokeDashoffset={-arcs.slice(0, i).reduce((sum, a) => sum + a.length, 0)}
            />
          ))}
        </G>
      </Svg>
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]} pointerEvents="none">
        <ThemedText type="small">{centerLabel}</ThemedText>
        <ThemedText type="subtitle" style={{ fontSize: 26, lineHeight: 34 }}>{centerValue}</ThemedText>
      </View>
    </View>
  );
}
