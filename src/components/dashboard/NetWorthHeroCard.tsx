/**
 * NetWorthHeroCard — Sophisticated header showing total net worth
 * with a sparkline trend overlaying the background.
 */

import React, {useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {FadeInDown} from 'react-native-reanimated';

import {useTheme} from '../../theme';
import type {MD3Theme} from '../../theme';
import {formatCurrency, formatCompact} from '../../utils';
import type {Currency, NetWorthSnapshot} from '../../types';

interface NetWorthHeroCardProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  currency: Currency;
  history: NetWorthSnapshot[];
}

export const NetWorthHeroCard: React.FC<NetWorthHeroCardProps> = ({
  netWorth,
  totalAssets,
  totalLiabilities,
  currency,
  history,
}) => {
  const theme = useTheme();
  const s = makeStyles(theme);

  const sparklineData = useMemo(() => {
    if (history.length < 2) return [];
    return history.map(snap => ({
      value: snap.netWorth,
    }));
  }, [history]);

  const isPositive = netWorth >= 0;

  return (
    <Animated.View entering={FadeInDown.duration(500).springify()} style={s.card}>
      {/* Sparkline Background */}
      {sparklineData.length >= 2 && (
        <View style={s.sparklineContainer}>
          <LineChart
            data={sparklineData}
            curved
            areaChart
            hideDataPoints
            hideYAxisText
            hideAxesAndRules
            color={
              theme.isDark
                ? theme.colors.primaryContainer + '40'
                : theme.colors.primary + '25'
            }
            startFillColor={
              theme.isDark
                ? theme.colors.primaryContainer + '20'
                : theme.colors.primary + '12'
            }
            endFillColor="transparent"
            thickness={2}
            width={280}
            height={100}
            adjustToWidth
            isAnimated
            animationDuration={800}
            initialSpacing={0}
            endSpacing={0}
            yAxisOffset={Math.min(...sparklineData.map(d => d.value)) * 0.95}
          />
        </View>
      )}

      {/* Content Overlay */}
      <View style={s.content}>
        <View style={s.labelRow}>
          <Icon
            name="chart-line-variant"
            size={16}
            color={theme.colors.onSurfaceVariant}
          />
          <Text style={s.label}>NET WORTH</Text>
        </View>

        <Text
          style={[
            s.value,
            {color: isPositive ? theme.colors.success : theme.colors.error},
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit>
          {formatCurrency(netWorth, currency)}
        </Text>

        {/* Asset / Liability Split */}
        <View style={s.splitRow}>
          <View style={s.splitItem}>
            <View style={[s.splitDot, {backgroundColor: theme.colors.success}]} />
            <View>
              <Text style={s.splitLabel}>Assets</Text>
              <Text style={[s.splitValue, {color: theme.colors.success}]}>
                {formatCompact(totalAssets, currency)}
              </Text>
            </View>
          </View>
          <View style={s.splitDivider} />
          <View style={s.splitItem}>
            <View style={[s.splitDot, {backgroundColor: theme.colors.error}]} />
            <View>
              <Text style={s.splitLabel}>Liabilities</Text>
              <Text style={[s.splitValue, {color: theme.colors.error}]}>
                {formatCompact(totalLiabilities, currency)}
              </Text>
            </View>
          </View>
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
      marginTop: spacing.md,
      borderRadius: shape.extraLarge,
      backgroundColor: colors.surfaceContainerLow,
      overflow: 'hidden',
      ...elevation.level3,
    },
    sparklineContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      opacity: 0.6,
      overflow: 'hidden',
      borderRadius: shape.extraLarge,
    },
    content: {
      padding: spacing.xxl,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    label: {
      ...typography.labelSmall,
      color: colors.onSurfaceVariant,
      letterSpacing: 1.5,
    },
    value: {
      ...typography.displaySmall,
      fontWeight: '700',
      marginBottom: spacing.lg,
    },
    splitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceContainer,
      borderRadius: shape.medium,
      padding: spacing.md,
    },
    splitItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      justifyContent: 'center',
    },
    splitDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    splitLabel: {
      ...typography.labelSmall,
      color: colors.onSurfaceVariant,
    },
    splitValue: {
      ...typography.titleSmall,
      fontWeight: '700',
    },
    splitDivider: {
      width: 1,
      height: 28,
      backgroundColor: colors.outlineVariant,
    },
  });
}
