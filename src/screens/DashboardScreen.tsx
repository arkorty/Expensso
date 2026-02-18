import React, {useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {BarChart, PieChart} from 'react-native-gifted-charts';

import {SummaryCard, SectionHeader, TransactionItem, EmptyState} from '../components';
import {useSettingsStore, useNetWorthStore, useExpenseStore} from '../store';
import {formatCurrency, formatCompact, percentageChange} from '../utils';
import {COLORS} from '../constants';
import {useThemeColors, useIsDarkTheme} from '../hooks';

const DashboardScreen: React.FC = () => {
  const {t} = useTranslation();
  const baseCurrency = useSettingsStore(s => s.baseCurrency);
  const colors = useThemeColors();
  const isDark = useIsDarkTheme();
  const insets = useSafeAreaInsets();

  const {
    totalAssets,
    totalLiabilities,
    netWorth,
    loadNetWorth,
    isLoading: nwLoading,
  } = useNetWorthStore();

  const {
    transactions,
    monthlyExpense,
    monthlyIncome,
    spendingByCategory,
    monthlyTrend,
    loadTransactions,
    loadMonthlyStats,
    loadSpendingAnalytics,
    isLoading: txLoading,
  } = useExpenseStore();

  const loadAll = useCallback(async () => {
    await Promise.all([
      loadNetWorth(),
      loadTransactions({limit: 5}),
      loadMonthlyStats(),
      loadSpendingAnalytics(),
    ]);
  }, [loadNetWorth, loadTransactions, loadMonthlyStats, loadSpendingAnalytics]);

  // Reload on screen focus
  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll]),
  );

  const isLoading = nwLoading || txLoading;

  // ─── Chart: Spending by Category (Pie) ─────────────────────────────
  const pieData = spendingByCategory.slice(0, 6).map((item, idx) => ({
    value: item.total,
    text: formatCompact(item.total, baseCurrency),
    color: item.categoryColor || colors.chartColors[idx % colors.chartColors.length],
    focused: idx === 0,
  }));

  // ─── Chart: Monthly Trend (Bar) ────────────────────────────────────
  const barData = monthlyTrend.map((item, idx) => ({
    value: item.total,
    label: item.month.slice(5), // "01", "02", etc.
    frontColor: colors.chartColors[idx % colors.chartColors.length],
  }));

  // ─── Net Worth Calculation Breakdown ───────────────────────────────
  // Net Worth = Total Assets - Total Liabilities
  // This is already computed in the netWorthStore from live SQLite data.

  return (
    <SafeAreaView style={[styles.screen, {backgroundColor: colors.background}]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, {backgroundColor: colors.background}]}>
        <View>
          <Text style={[styles.greeting, {color: colors.textSecondary}]}>Hello,</Text>
          <Text style={[styles.headerTitle, {color: colors.text}]}>{t('dashboard.title')}</Text>
        </View>
        <View style={[styles.currencyBadge, {backgroundColor: colors.primary + '15'}]}>
          <Text style={[styles.currencyText, {color: colors.primary}]}>{baseCurrency}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, {paddingBottom: 60 + insets.bottom}]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadAll} />
        }>

        {/* ── Net Worth Hero Card ─────────────────────────────────── */}
        <View style={[styles.heroCard, {backgroundColor: colors.surface}]}>
          <Text style={[styles.heroLabel, {color: colors.textSecondary}]}>{t('dashboard.netWorth')}</Text>
          <Text
            style={[
              styles.heroValue,
              {color: netWorth >= 0 ? colors.success : colors.danger},
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit>
            {formatCurrency(netWorth, baseCurrency)}
          </Text>

          <View style={[styles.heroBreakdown, {borderTopColor: colors.borderLight}]}>
            <View style={styles.heroBreakdownItem}>
              <Icon name="trending-up" size={16} color={colors.asset} />
              <Text style={[styles.heroBreakdownLabel, {color: colors.textTertiary}]}>
                {t('dashboard.totalAssets')}
              </Text>
              <Text style={[styles.heroBreakdownValue, {color: colors.asset}]}>
                {formatCompact(totalAssets, baseCurrency)}
              </Text>
            </View>
            <View style={[styles.heroBreakdownDivider, {backgroundColor: colors.borderLight}]} />
            <View style={styles.heroBreakdownItem}>
              <Icon name="trending-down" size={16} color={colors.liability} />
              <Text style={[styles.heroBreakdownLabel, {color: colors.textTertiary}]}>
                {t('dashboard.totalLiabilities')}
              </Text>
              <Text
                style={[styles.heroBreakdownValue, {color: colors.liability}]}>
                {formatCompact(totalLiabilities, baseCurrency)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Monthly Summary Cards ──────────────────────────────── */}
        <View style={styles.cardRow}>
          <SummaryCard
            title={t('dashboard.monthlyIncome')}
            value={formatCurrency(monthlyIncome, baseCurrency)}
            valueColor={colors.income}
            icon={<Icon name="arrow-down-circle" size={18} color={colors.income} />}
            style={styles.halfCard}
          />
          <SummaryCard
            title={t('dashboard.monthlySpending')}
            value={formatCurrency(monthlyExpense, baseCurrency)}
            valueColor={colors.expense}
            icon={<Icon name="arrow-up-circle" size={18} color={colors.expense} />}
            style={styles.halfCard}
          />
        </View>

        {/* ── Spending by Category (Pie Chart) ───────────────────── */}
        {pieData.length > 0 && (
          <>
            <SectionHeader title={t('dashboard.thisMonth')} />
            <View style={[styles.chartCard, {backgroundColor: colors.surface}]}>
              <PieChart
                data={pieData}
                donut
                innerRadius={50}
                radius={80}
                innerCircleColor={colors.surface}
                centerLabelComponent={() => (
                  <View style={styles.pieCenter}>
                    <Text style={[styles.pieCenterValue, {color: colors.text}]}>
                      {formatCompact(monthlyExpense, baseCurrency)}
                    </Text>
                    <Text style={[styles.pieCenterLabel, {color: colors.textTertiary}]}>Spent</Text>
                  </View>
                )}
              />
              <View style={styles.legendContainer}>
                {spendingByCategory.slice(0, 5).map((item, idx) => (
                  <View key={idx} style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        {backgroundColor: item.categoryColor},
                      ]}
                    />
                    <Text style={[styles.legendText, {color: colors.text}]} numberOfLines={1}>
                      {item.categoryName}
                    </Text>
                    <Text style={[styles.legendValue, {color: colors.textSecondary}]}>
                      {formatCompact(item.total, baseCurrency)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* ── Spending Trends (Bar Chart) ────────────────────────── */}
        {barData.length > 0 && (
          <>
            <SectionHeader title={t('dashboard.spendingTrends')} />
            <View style={[styles.chartCard, {backgroundColor: colors.surface}]}>
              <BarChart
                data={barData}
                barWidth={28}
                spacing={18}
                roundedTop
                roundedBottom
                noOfSections={4}
                yAxisThickness={0}
                xAxisThickness={0}
                yAxisTextStyle={[styles.chartAxisText, {color: colors.textTertiary}]}
                xAxisLabelTextStyle={[styles.chartAxisText, {color: colors.textTertiary}]}
                hideRules
                isAnimated
                barBorderRadius={6}
              />
            </View>
          </>
        )}

        {/* ── Recent Transactions ─────────────────────────────────── */}
        <SectionHeader title={t('dashboard.recentTransactions')} />
        <View style={[styles.transactionsList, {backgroundColor: colors.surface}]}>
          {transactions.length > 0 ? (
            transactions.map(txn => (
              <TransactionItem key={txn.id} transaction={txn} />
            ))
          ) : (
            <EmptyState
              icon="receipt"
              title={t('expenses.noTransactions')}
              subtitle={t('expenses.startTracking')}
            />
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;

// ─── Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: COLORS.background,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
  },
  currencyBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  currencyText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {},

  // Hero card
  heroCard: {
    backgroundColor: COLORS.surface,
    margin: 20,
    marginTop: 12,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroValue: {
    fontSize: 36,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 16,
  },
  heroBreakdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 16,
  },
  heroBreakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroBreakdownDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.borderLight,
  },
  heroBreakdownLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
  heroBreakdownValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },

  // Monthly cards
  cardRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  halfCard: {
    flex: 1,
  },

  // Charts
  chartCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  chartAxisText: {
    fontSize: 10,
    color: COLORS.textTertiary,
  },
  pieCenter: {
    alignItems: 'center',
  },
  pieCenterValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  pieCenterLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  legendContainer: {
    width: '100%',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // Transactions
  transactionsList: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  bottomSpacer: {
    height: 40,
  },
});
