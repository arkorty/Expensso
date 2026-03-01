/**
 * WealthDistributionChart — Donut chart showing asset allocation:
 *   Liquid (Bank, FD)  vs  Equity (Stocks, MF)  vs  Fixed (Gold, RE, EPF, PPF)
 */

import React, {useCallback, useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {PieChart} from 'react-native-gifted-charts';
import Animated, {FadeInUp} from 'react-native-reanimated';

import {useTheme} from '../../theme';
import type {MD3Theme} from '../../theme';
import {formatCompact} from '../../utils';
import type {Asset, Currency} from '../../types';

interface WealthDistributionChartProps {
  assets: Asset[];
  currency: Currency;
}

const ALLOCATION_MAP: Record<string, string> = {
  Bank: 'Liquid',
  'Fixed Deposit': 'Liquid',
  Stocks: 'Equity',
  'Mutual Funds': 'Equity',
  Gold: 'Fixed',
  'Real Estate': 'Fixed',
  EPF: 'Fixed',
  PPF: 'Fixed',
  Other: 'Other',
};

const ALLOCATION_COLORS: Record<string, {light: string; dark: string}> = {
  Liquid: {light: '#1E88E5', dark: '#64B5F6'},
  Equity: {light: '#7E57C2', dark: '#CE93D8'},
  Fixed: {light: '#D4AF37', dark: '#FFD54F'},
  Other: {light: '#78909C', dark: '#B0BEC5'},
};

export const WealthDistributionChart: React.FC<WealthDistributionChartProps> = ({
  assets,
  currency,
}) => {
  const theme = useTheme();
  const s = makeStyles(theme);

  const {pieData, totalValue, segments} = useMemo(() => {
    const groups: Record<string, number> = {};
    let total = 0;

    assets.forEach(a => {
      const bucket = ALLOCATION_MAP[a.type] || 'Other';
      groups[bucket] = (groups[bucket] || 0) + a.currentValue;
      total += a.currentValue;
    });

    const segs = Object.entries(groups)
      .filter(([_, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : '0',
        color:
          ALLOCATION_COLORS[name]?.[theme.isDark ? 'dark' : 'light'] || '#78909C',
      }));

    const pie = segs.map((seg, idx) => ({
      value: seg.value,
      color: seg.color,
      text: `${seg.percentage}%`,
      focused: idx === 0,
    }));

    return {pieData: pie, totalValue: total, segments: segs};
  }, [assets, theme.isDark]);

  const CenterLabel = useCallback(() => (
    <View style={s.centerLabel}>
      <Text style={s.centerValue}>
        {formatCompact(totalValue, currency)}
      </Text>
      <Text style={s.centerSubtitle}>Total</Text>
    </View>
  ), [totalValue, currency, s]);

  if (pieData.length === 0) return null;

  return (
    <Animated.View entering={FadeInUp.duration(500).delay(200)} style={s.card}>
      <Text style={s.title}>Wealth Distribution</Text>

      <View style={s.chartRow}>
        <PieChart
          data={pieData}
          donut
          innerRadius={48}
          radius={72}
          innerCircleColor={theme.colors.surfaceContainerLow}
          centerLabelComponent={CenterLabel}
        />

        <View style={s.legend}>
          {segments.map(seg => (
            <View key={seg.name} style={s.legendItem}>
              <View style={[s.legendDot, {backgroundColor: seg.color}]} />
              <View style={s.legendText}>
                <Text style={s.legendName}>{seg.name}</Text>
                <Text style={s.legendValue}>
                  {formatCompact(seg.value, currency)} · {seg.percentage}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

function makeStyles(theme: MD3Theme) {
  const {colors, typography, elevation, shape, spacing} = theme;
  return StyleSheet.create({
    card: {
      marginHorizontal: spacing.xl,
      marginTop: spacing.xl,
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: shape.large,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      padding: spacing.xl,
      ...elevation.level1,
    },
    title: {
      ...typography.titleSmall,
      color: colors.onSurface,
      fontWeight: '600',
      marginBottom: spacing.lg,
    },
    chartRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xl,
    },
    centerLabel: {
      alignItems: 'center',
    },
    centerValue: {
      ...typography.titleSmall,
      color: colors.onSurface,
      fontWeight: '700',
    },
    centerSubtitle: {
      ...typography.labelSmall,
      color: colors.onSurfaceVariant,
    },
    legend: {
      flex: 1,
      gap: spacing.md,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 2,
    },
    legendText: {
      flex: 1,
    },
    legendName: {
      ...typography.labelMedium,
      color: colors.onSurface,
    },
    legendValue: {
      ...typography.bodySmall,
      color: colors.onSurfaceVariant,
    },
  });
}
