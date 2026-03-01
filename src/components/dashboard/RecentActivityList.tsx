/**
 * RecentActivityList — "Glassmorphism" elevated surface list of the
 * last 5 transactions with high-quality category icons.
 */

import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {FadeInUp} from 'react-native-reanimated';

import {useTheme} from '../../theme';
import type {MD3Theme} from '../../theme';
import {formatCurrency} from '../../utils';
import type {Transaction, Currency} from '../../types';

// Map common categories to premium Material icons
const CATEGORY_ICONS: Record<string, string> = {
  Groceries: 'cart',
  Rent: 'home',
  Fuel: 'gas-station',
  'Domestic Help': 'account-group',
  Tiffin: 'food',
  Utilities: 'lightning-bolt',
  'Mobile Recharge': 'cellphone',
  Transport: 'bus',
  Shopping: 'shopping',
  Medical: 'hospital-box',
  Education: 'school',
  Entertainment: 'movie',
  'Dining Out': 'silverware-fork-knife',
  Subscriptions: 'television-play',
  Insurance: 'shield-check',
  Salary: 'briefcase',
  Freelance: 'laptop',
  Investments: 'chart-line',
  'Rental Income': 'home-city',
  Dividends: 'cash-multiple',
  UPI: 'contactless-payment',
};

interface RecentActivityListProps {
  transactions: Transaction[];
  currency: Currency;
  onViewAll?: () => void;
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({
  transactions,
  currency,
  onViewAll,
}) => {
  const theme = useTheme();
  const s = makeStyles(theme);

  if (transactions.length === 0) {
    return (
      <View style={s.emptyContainer}>
        <Icon name="receipt" size={48} color={theme.colors.onSurfaceVariant + '40'} />
        <Text style={s.emptyText}>No recent transactions</Text>
        <Text style={s.emptySubtext}>Start tracking to see activity here</Text>
      </View>
    );
  }

  return (
    <Animated.View entering={FadeInUp.duration(500).delay(300)} style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.title}>Recent Activity</Text>
        {onViewAll && (
          <Pressable onPress={onViewAll} hitSlop={8}>
            <Text style={s.viewAll}>View All</Text>
          </Pressable>
        )}
      </View>

      <View style={s.glassCard}>
        {transactions.slice(0, 5).map((txn, idx) => {
          const isExpense = txn.type === 'expense';
          const iconName =
            CATEGORY_ICONS[txn.categoryName || ''] ||
            txn.categoryIcon ||
            'dots-horizontal';
          const iconColor = txn.categoryColor || theme.colors.onSurfaceVariant;

          return (
            <View
              key={txn.id}
              style={[
                s.txnRow,
                idx < Math.min(transactions.length, 5) - 1 && s.txnRowBorder,
              ]}>
              <View style={[s.iconCircle, {backgroundColor: iconColor + '14'}]}>
                <Icon name={iconName} size={20} color={iconColor} />
              </View>

              <View style={s.txnDetails}>
                <Text style={s.txnCategory} numberOfLines={1}>
                  {txn.categoryName || 'Uncategorized'}
                </Text>
                <Text style={s.txnMeta} numberOfLines={1}>
                  {txn.paymentMethod}
                  {txn.note ? ` · ${txn.note}` : ''}
                </Text>
              </View>

              <View style={s.txnAmountCol}>
                <Text
                  style={[
                    s.txnAmount,
                    {
                      color: isExpense
                        ? theme.colors.error
                        : theme.colors.success,
                    },
                  ]}>
                  {isExpense ? '-' : '+'}
                  {formatCurrency(txn.amount, currency)}
                </Text>
                <Text style={s.txnDate}>
                  {new Date(txn.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
};

function makeStyles(theme: MD3Theme) {
  const {colors, typography, elevation, shape, spacing} = theme;
  return StyleSheet.create({
    container: {
      marginHorizontal: spacing.xl,
      marginTop: spacing.xl,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    title: {
      ...typography.titleSmall,
      color: colors.onSurface,
      fontWeight: '600',
    },
    viewAll: {
      ...typography.labelMedium,
      color: colors.primary,
    },
    glassCard: {
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: shape.large,
      borderWidth: 1,
      borderColor: colors.outlineVariant + '40',
      overflow: 'hidden',
      ...elevation.level2,
    },
    txnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    txnRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant + '30',
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    txnDetails: {
      flex: 1,
      marginLeft: spacing.md,
    },
    txnCategory: {
      ...typography.bodyMedium,
      color: colors.onSurface,
      fontWeight: '500',
    },
    txnMeta: {
      ...typography.bodySmall,
      color: colors.onSurfaceVariant,
      marginTop: 1,
    },
    txnAmountCol: {
      alignItems: 'flex-end',
    },
    txnAmount: {
      ...typography.titleSmall,
      fontWeight: '700',
    },
    txnDate: {
      ...typography.labelSmall,
      color: colors.onSurfaceVariant,
      marginTop: 1,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: spacing.xxxl + 16,
      marginHorizontal: spacing.xl,
    },
    emptyText: {
      ...typography.bodyLarge,
      color: colors.onSurfaceVariant,
      marginTop: spacing.md,
    },
    emptySubtext: {
      ...typography.bodySmall,
      color: colors.onSurfaceVariant + '80',
      marginTop: spacing.xs,
    },
  });
}
