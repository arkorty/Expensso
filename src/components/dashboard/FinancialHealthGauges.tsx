/**
 * FinancialHealthGauges — Monthly Budget vs. Spent progress bars
 * and savings rate indicator.
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {FadeInUp} from 'react-native-reanimated';

import {useTheme} from '../../theme';
import type {MD3Theme} from '../../theme';
import {formatCompact} from '../../utils';
import type {Currency} from '../../types';

interface FinancialHealthGaugesProps {
  monthlyIncome: number;
  monthlyExpense: number;
  currency: Currency;
  /** Optional monthly budget target. Defaults to income. */
  monthlyBudget?: number;
}

export const FinancialHealthGauges: React.FC<FinancialHealthGaugesProps> = ({
  monthlyIncome,
  monthlyExpense,
  currency,
  monthlyBudget,
}) => {
  const theme = useTheme();
  const s = makeStyles(theme);

  const budget = monthlyBudget || monthlyIncome;
  const savingsRate =
    monthlyIncome > 0
      ? (((monthlyIncome - monthlyExpense) / monthlyIncome) * 100).toFixed(0)
      : '0';
  const spentPercent = budget > 0 ? Math.min((monthlyExpense / budget) * 100, 100) : 0;
  const remaining = Math.max(budget - monthlyExpense, 0);

  const spentColor =
    spentPercent > 90
      ? theme.colors.error
      : spentPercent > 70
        ? theme.colors.warning
        : theme.colors.success;

  return (
    <Animated.View entering={FadeInUp.duration(500).delay(400)} style={s.container}>
      <Text style={s.sectionTitle}>Financial Health</Text>

      <View style={s.cardsRow}>
        {/* Budget Gauge */}
        <View style={s.gaugeCard}>
          <View style={s.gaugeHeader}>
            <Icon name="chart-donut" size={18} color={spentColor} />
            <Text style={s.gaugeLabel}>Budget</Text>
          </View>

          {/* Progress Bar */}
          <View style={s.progressTrack}>
            <View
              style={[
                s.progressFill,
                {
                  width: `${spentPercent}%`,
                  backgroundColor: spentColor,
                },
              ]}
            />
          </View>

          <View style={s.gaugeFooter}>
            <Text style={s.gaugeSpent}>
              {formatCompact(monthlyExpense, currency)} spent
            </Text>
            <Text style={s.gaugeRemaining}>
              {formatCompact(remaining, currency)} left
            </Text>
          </View>
        </View>

        {/* Savings Rate Gauge */}
        <View style={s.gaugeCard}>
          <View style={s.gaugeHeader}>
            <Icon
              name="piggy-bank-outline"
              size={18}
              color={
                Number(savingsRate) >= 20
                  ? theme.colors.success
                  : theme.colors.warning
              }
            />
            <Text style={s.gaugeLabel}>Savings</Text>
          </View>

          <Text
            style={[
              s.savingsRate,
              {
                color:
                  Number(savingsRate) >= 20
                    ? theme.colors.success
                    : Number(savingsRate) >= 0
                      ? theme.colors.warning
                      : theme.colors.error,
              },
            ]}>
            {savingsRate}%
          </Text>
          <Text style={s.savingsSub}>of income saved</Text>
        </View>
      </View>

      {/* Income vs Expense Bar */}
      <View style={s.comparisonCard}>
        <View style={s.comparisonRow}>
          <View style={s.comparisonItem}>
            <View style={[s.comparisonDot, {backgroundColor: theme.colors.success}]} />
            <Text style={s.comparisonLabel}>Income</Text>
            <Text style={[s.comparisonValue, {color: theme.colors.success}]}>
              {formatCompact(monthlyIncome, currency)}
            </Text>
          </View>
          <View style={s.comparisonItem}>
            <View style={[s.comparisonDot, {backgroundColor: theme.colors.error}]} />
            <Text style={s.comparisonLabel}>Expense</Text>
            <Text style={[s.comparisonValue, {color: theme.colors.error}]}>
              {formatCompact(monthlyExpense, currency)}
            </Text>
          </View>
        </View>

        {/* Dual progress bar */}
        <View style={s.dualTrack}>
          {monthlyIncome > 0 && (
            <View
              style={[
                s.dualFill,
                {
                  flex: monthlyIncome,
                  backgroundColor: theme.colors.success,
                  borderTopLeftRadius: 4,
                  borderBottomLeftRadius: 4,
                },
              ]}
            />
          )}
          {monthlyExpense > 0 && (
            <View
              style={[
                s.dualFill,
                {
                  flex: monthlyExpense,
                  backgroundColor: theme.colors.error,
                  borderTopRightRadius: 4,
                  borderBottomRightRadius: 4,
                },
              ]}
            />
          )}
        </View>
      </View>
    </Animated.View>
  );
};

function makeStyles(theme: MD3Theme) {
  const {colors, typography, elevation, shape, spacing} = theme;
  return StyleSheet.create({
    container: {
      marginTop: spacing.xl,
      marginHorizontal: spacing.xl,
    },
    sectionTitle: {
      ...typography.titleSmall,
      color: colors.onSurface,
      fontWeight: '600',
      marginBottom: spacing.md,
    },
    cardsRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    gaugeCard: {
      flex: 1,
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: shape.medium,
      padding: spacing.lg,
      ...elevation.level1,
    },
    gaugeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    gaugeLabel: {
      ...typography.labelMedium,
      color: colors.onSurfaceVariant,
    },
    progressTrack: {
      height: 8,
      backgroundColor: colors.surfaceContainerHighest,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: spacing.sm,
    },
    progressFill: {
      height: 8,
      borderRadius: 4,
    },
    gaugeFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    gaugeSpent: {
      ...typography.labelSmall,
      color: colors.onSurfaceVariant,
    },
    gaugeRemaining: {
      ...typography.labelSmall,
      color: colors.onSurfaceVariant,
    },
    savingsRate: {
      ...typography.headlineMedium,
      fontWeight: '700',
      marginBottom: 2,
    },
    savingsSub: {
      ...typography.labelSmall,
      color: colors.onSurfaceVariant,
    },
    comparisonCard: {
      marginTop: spacing.md,
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: shape.medium,
      padding: spacing.lg,
      ...elevation.level1,
    },
    comparisonRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: spacing.md,
    },
    comparisonItem: {
      alignItems: 'center',
      gap: 2,
    },
    comparisonDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginBottom: 2,
    },
    comparisonLabel: {
      ...typography.labelSmall,
      color: colors.onSurfaceVariant,
    },
    comparisonValue: {
      ...typography.titleSmall,
      fontWeight: '700',
    },
    dualTrack: {
      height: 8,
      flexDirection: 'row',
      borderRadius: 4,
      overflow: 'hidden',
      backgroundColor: colors.surfaceContainerHighest,
      gap: 2,
    },
    dualFill: {
      height: 8,
    },
  });
}
