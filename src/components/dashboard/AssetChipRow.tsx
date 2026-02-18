/**
 * AssetChipRow — Horizontal scrolling chip/card row
 * showing quick totals for Bank, Stocks, Gold, Debt, etc.
 */

import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {FadeInRight} from 'react-native-reanimated';

import {useTheme} from '../../theme';
import type {MD3Theme} from '../../theme';
import {formatCompact} from '../../utils';
import type {Asset, Liability, Currency} from '../../types';

interface AssetChipRowProps {
  assets: Asset[];
  liabilities: Liability[];
  currency: Currency;
}

const ASSET_ICONS: Record<string, {icon: string; color: string}> = {
  Bank: {icon: 'bank', color: '#1E88E5'},
  Stocks: {icon: 'chart-line', color: '#7E57C2'},
  Gold: {icon: 'gold', color: '#D4AF37'},
  EPF: {icon: 'shield-account', color: '#00ACC1'},
  'Real Estate': {icon: 'home-city', color: '#8D6E63'},
  'Mutual Funds': {icon: 'chart-areaspline', color: '#26A69A'},
  'Fixed Deposit': {icon: 'safe', color: '#3949AB'},
  PPF: {icon: 'piggy-bank', color: '#43A047'},
  Other: {icon: 'dots-horizontal', color: '#78909C'},
};

export const AssetChipRow: React.FC<AssetChipRowProps> = ({
  assets,
  liabilities,
  currency,
}) => {
  const theme = useTheme();
  const s = makeStyles(theme);

  // Group assets by type and sum values
  const groupedAssets = assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + a.currentValue;
    return acc;
  }, {});

  // Sum total liabilities
  const totalDebt = liabilities.reduce((sum, l) => sum + l.outstandingAmount, 0);

  const chips: {label: string; value: number; icon: string; iconColor: string; isDebt?: boolean}[] = [];

  Object.entries(groupedAssets).forEach(([type, value]) => {
    const visual = ASSET_ICONS[type] || ASSET_ICONS.Other;
    chips.push({
      label: type,
      value,
      icon: visual.icon,
      iconColor: visual.color,
    });
  });

  if (totalDebt > 0) {
    chips.push({
      label: 'Debt',
      value: totalDebt,
      icon: 'credit-card-clock',
      iconColor: theme.colors.error,
      isDebt: true,
    });
  }

  if (chips.length === 0) return null;

  return (
    <View style={s.container}>
      <Text style={s.sectionLabel}>Portfolio Breakdown</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}>
        {chips.map((chip, idx) => (
          <Animated.View
            key={chip.label}
            entering={FadeInRight.delay(idx * 80).duration(400).springify()}>
            <View
              style={[
                s.chip,
                chip.isDebt && {borderColor: theme.colors.errorContainer},
              ]}>
              <View
                style={[
                  s.chipIconBg,
                  {backgroundColor: chip.iconColor + '1A'},
                ]}>
                <Icon name={chip.icon} size={18} color={chip.iconColor} />
              </View>
              <Text style={s.chipLabel} numberOfLines={1}>
                {chip.label}
              </Text>
              <Text
                style={[
                  s.chipValue,
                  chip.isDebt && {color: theme.colors.error},
                ]}
                numberOfLines={1}>
                {chip.isDebt ? '-' : ''}
                {formatCompact(chip.value, currency)}
              </Text>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
};

function makeStyles(theme: MD3Theme) {
  const {colors, typography, shape, spacing} = theme;
  return StyleSheet.create({
    container: {
      marginTop: spacing.xl,
    },
    sectionLabel: {
      ...typography.labelMedium,
      color: colors.onSurfaceVariant,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginLeft: spacing.xl,
      marginBottom: spacing.sm,
    },
    scrollContent: {
      paddingHorizontal: spacing.xl,
      gap: spacing.sm,
    },
    chip: {
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: shape.medium,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      padding: spacing.md,
      minWidth: 110,
      alignItems: 'flex-start',
    },
    chipIconBg: {
      width: 32,
      height: 32,
      borderRadius: shape.small,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    chipLabel: {
      ...typography.labelSmall,
      color: colors.onSurfaceVariant,
      marginBottom: 2,
    },
    chipValue: {
      ...typography.titleSmall,
      color: colors.onSurface,
      fontWeight: '700',
    },
  });
}
