/**
 * ModernDashboard — Full MD3 redesign of the dashboard screen.
 *
 * Sections:
 *  1. Net Worth "Hero" Card with sparkline trend
 *  2. Asset vs. Liability chip row
 *  3. Wealth Distribution donut chart
 *  4. Financial Health gauges (budget vs. spent)
 *  5. Recent Activity glassmorphism list
 */

import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Pressable,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {FadeIn} from 'react-native-reanimated';

import {useTheme} from '../theme';
import type {MD3Theme} from '../theme';
import {useSettingsStore, useNetWorthStore, useExpenseStore} from '../store';
import {getNetWorthHistory} from '../db';
import type {NetWorthSnapshot} from '../types';

import {
  NetWorthHeroCard,
  AssetChipRow,
  WealthDistributionChart,
  RecentActivityList,
  FinancialHealthGauges,
} from '../components/dashboard';

const ModernDashboard: React.FC = () => {
  const {t} = useTranslation();
  const theme = useTheme();
  const s = makeStyles(theme);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const baseCurrency = useSettingsStore(ss => ss.baseCurrency);

  const {
    totalAssets,
    totalLiabilities,
    netWorth,
    assets,
    liabilities,
    loadNetWorth,
    isLoading: nwLoading,
  } = useNetWorthStore();

  const {
    transactions,
    monthlyExpense,
    monthlyIncome,
    loadTransactions,
    loadMonthlyStats,
    loadSpendingAnalytics,
    isLoading: txLoading,
  } = useExpenseStore();

  const [history, setHistory] = useState<NetWorthSnapshot[]>([]);

  const loadAll = useCallback(async () => {
    await Promise.all([
      loadNetWorth(),
      loadTransactions({limit: 5}),
      loadMonthlyStats(),
      loadSpendingAnalytics(),
    ]);
    const hist = await getNetWorthHistory(12);
    setHistory(hist);
  }, [loadNetWorth, loadTransactions, loadMonthlyStats, loadSpendingAnalytics]);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll]),
  );

  const isLoading = nwLoading || txLoading;

  return (
    <SafeAreaView style={s.screen} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      {/* ── Header ──────────────────────────────────────────────── */}
      <Animated.View entering={FadeIn.duration(400)} style={s.header}>
        <View>
          <Text style={s.greeting}>Hello,</Text>
          <Text style={s.headerTitle}>{t('dashboard.title')}</Text>
        </View>
        <Pressable style={s.currencyBadge}>
          <Icon name="swap-horizontal" size={14} color={theme.colors.primary} />
          <Text style={s.currencyText}>{baseCurrency}</Text>
        </Pressable>
      </Animated.View>

      {/* ── Scrollable Content ──────────────────────────────────── */}
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={{paddingBottom: 80 + insets.bottom}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadAll}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }>

        {/* 1. Net Worth Hero Card */}
        <NetWorthHeroCard
          netWorth={netWorth}
          totalAssets={totalAssets}
          totalLiabilities={totalLiabilities}
          currency={baseCurrency}
          history={history}
        />

        {/* 2. Asset vs. Liability Chip Row */}
        <AssetChipRow
          assets={assets}
          liabilities={liabilities}
          currency={baseCurrency}
        />

        {/* 3. Wealth Distribution Donut */}
        <WealthDistributionChart assets={assets} currency={baseCurrency} />

        {/* 4. Financial Health Gauges */}
        <FinancialHealthGauges
          monthlyIncome={monthlyIncome}
          monthlyExpense={monthlyExpense}
          currency={baseCurrency}
        />

        {/* 5. Recent Activity */}
        <RecentActivityList
          transactions={transactions}
          currency={baseCurrency}
          onViewAll={() => navigation.navigate('Expenses')}
        />

        <View style={s.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ModernDashboard;

// ─── Styles ────────────────────────────────────────────────────────────

function makeStyles(theme: MD3Theme) {
  const {colors, typography, spacing} = theme;
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
    },
    greeting: {
      ...typography.bodyMedium,
      color: colors.onSurfaceVariant,
    },
    headerTitle: {
      ...typography.headlineMedium,
      color: colors.onSurface,
      fontWeight: '700',
    },
    currencyBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.primaryContainer,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 20,
    },
    currencyText: {
      ...typography.labelMedium,
      color: colors.onPrimaryContainer,
      fontWeight: '600',
    },
    scrollView: {
      flex: 1,
    },
    bottomSpacer: {
      height: 20,
    },
  });
}
