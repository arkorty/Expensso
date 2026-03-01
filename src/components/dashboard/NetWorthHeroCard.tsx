/**
 * NetWorthHeroCard — Sophisticated header showing total net worth
 * with a sparkline trend overlaying the background.
 */

import React, {useMemo} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {FadeInDown, FadeIn} from 'react-native-reanimated';

import {useTheme} from '../../theme';
import type {MD3Theme} from '../../theme';
import {formatCurrency, formatCompact} from '../../utils';
import type {Currency, NetWorthSnapshot} from '../../types';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

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

  // Calculate trend percentage from history
  const trendPercentage = useMemo(() => {
    if (history.length < 2) return null;
    const latest = history[history.length - 1].netWorth;
    const previous = history[history.length - 2].netWorth;
    if (previous === 0) return null;
    return ((latest - previous) / Math.abs(previous)) * 100;
  }, [history]);

  const isPositive = netWorth >= 0;
  const isTrendUp = trendPercentage && trendPercentage > 0;

  return (
    <Animated.View entering={FadeInDown.duration(500).springify()} style={s.card}>
      {/* Decorative Background Pattern */}
      <View style={s.decorativeBackground}>
        <View style={[s.decorCircle, {backgroundColor: theme.colors.primary + '08'}]} />
        <View style={[s.decorCircle2, {backgroundColor: theme.colors.tertiary + '06'}]} />
      </View>

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
                ? theme.colors.primaryContainer + '60'
                : theme.colors.primary + '35'
            }
            startFillColor={
              theme.isDark
                ? theme.colors.primaryContainer + '25'
                : theme.colors.primary + '15'
            }
            endFillColor="transparent"
            thickness={2.5}
            width={SCREEN_WIDTH - 80}
            height={120}
            adjustToWidth
            isAnimated
            animationDuration={800}
            initialSpacing={0}
            endSpacing={0}
            yAxisOffset={Math.min(...sparklineData.map(d => d.value)) * 0.92}
          />
        </View>
      )}

      {/* Content Overlay */}
      <View style={s.content}>
        {/* Header with trend badge */}
        <View style={s.headerRow}>
          <View style={s.labelRow}>
            <Icon
              name="chart-line-variant"
              size={18}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={s.label}>NET WORTH</Text>
          </View>
          {trendPercentage !== null && (
            <Animated.View entering={FadeIn.delay(300)} style={[s.trendBadge, {
              backgroundColor: isTrendUp 
                ? theme.colors.successContainer 
                : theme.colors.errorContainer,
            }]}>
              <Icon 
                name={isTrendUp ? 'trending-up' : 'trending-down'} 
                size={14} 
                color={isTrendUp ? theme.colors.success : theme.colors.error}
              />
              <Text style={[s.trendText, {
                color: isTrendUp ? theme.colors.success : theme.colors.error,
              }]}>
                {Math.abs(trendPercentage).toFixed(1)}%
              </Text>
            </Animated.View>
          )}
        </View>

        {/* Main Value */}
        <Text
          style={[
            s.value,
            {color: isPositive ? theme.colors.onSurface : theme.colors.error},
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit>
          {formatCurrency(netWorth, currency)}
        </Text>

        {/* Asset / Liability Split - Enhanced */}
        <View style={s.splitContainer}>
          <Animated.View entering={FadeIn.delay(200)} style={s.splitRow}>
            <View style={s.splitItem}>
              <View style={[s.iconWrapper, {
                backgroundColor: theme.colors.successContainer,
              }]}>
                <Icon 
                  name="trending-up" 
                  size={16} 
                  color={theme.colors.success}
                />
              </View>
              <View style={s.splitTextContainer}>
                <Text style={s.splitLabel}>Assets</Text>
                <Text style={[s.splitValue, {color: theme.colors.success}]}>
                  {formatCompact(totalAssets, currency)}
                </Text>
              </View>
            </View>

            <View style={s.splitDivider} />

            <View style={s.splitItem}>
              <View style={[s.iconWrapper, {
                backgroundColor: theme.colors.errorContainer,
              }]}>
                <Icon 
                  name="trending-down" 
                  size={16} 
                  color={theme.colors.error}
                />
              </View>
              <View style={s.splitTextContainer}>
                <Text style={s.splitLabel}>Liabilities</Text>
                <Text style={[s.splitValue, {color: theme.colors.error}]}>
                  {formatCompact(totalLiabilities, currency)}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Visual Progress Bar */}
          <View style={s.progressBar}>
            <View 
              style={[s.progressAsset, {
                flex: totalAssets || 1,
                backgroundColor: theme.colors.success,
              }]} 
            />
            <View 
              style={[s.progressLiability, {
                flex: totalLiabilities || 0.1,
                backgroundColor: theme.colors.error,
              }]} 
            />
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
      borderRadius: shape.medium,
      borderWidth: 1.5,
      borderColor: colors.outlineVariant,
      backgroundColor: colors.surfaceContainerLow,
      overflow: 'hidden',
      ...elevation.level3,
    },
    decorativeBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
    },
    decorCircle: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
      top: -60,
      right: -40,
    },
    decorCircle2: {
      position: 'absolute',
      width: 150,
      height: 150,
      borderRadius: 75,
      bottom: -30,
      left: -20,
    },
    sparklineContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      opacity: 0.7,
      overflow: 'hidden',
    },
    content: {
      padding: spacing.xxl,
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    label: {
      ...typography.labelMedium,
      color: colors.onSurfaceVariant,
      letterSpacing: 1.2,
      fontWeight: '600',
    },
    trendBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: shape.small,
    },
    trendText: {
      ...typography.labelSmall,
      fontWeight: '700',
    },
    value: {
      ...typography.displaySmall,
      fontWeight: '800',
      marginBottom: spacing.lg,
      marginTop: spacing.xs,
      letterSpacing: -0.5,
    },
    splitContainer: {
      gap: spacing.md,
    },
    splitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceContainer,
      borderRadius: shape.medium,
      borderWidth: 1,
      borderColor: colors.outlineVariant + '50',
      padding: spacing.lg,
    },
    splitItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    iconWrapper: {
      width: 32,
      height: 32,
      borderRadius: shape.small,
      justifyContent: 'center',
      alignItems: 'center',
    },
    splitTextContainer: {
      flex: 1,
    },
    splitLabel: {
      ...typography.labelSmall,
      color: colors.onSurfaceVariant,
      marginBottom: 2,
    },
    splitValue: {
      ...typography.titleMedium,
      fontWeight: '700',
    },
    splitDivider: {
      width: 1,
      height: 36,
      backgroundColor: colors.outlineVariant,
      marginHorizontal: spacing.xs,
    },
    progressBar: {
      flexDirection: 'row',
      height: 6,
      borderRadius: 3,
      overflow: 'hidden',
      backgroundColor: colors.surfaceContainerHighest,
    },
    progressAsset: {
      borderTopLeftRadius: 3,
      borderBottomLeftRadius: 3,
    },
    progressLiability: {
      borderTopRightRadius: 3,
      borderBottomRightRadius: 3,
    },
  });
}
