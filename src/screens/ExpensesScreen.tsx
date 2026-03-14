/**
 * ExpensesScreen — MD3 refactored.
 * Replaces the system Modal with CustomBottomSheet.
 * Uses MD3 theme tokens (useTheme), Reanimated animations, and haptic feedback.
 */

import React, {useCallback, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Pressable,
  Alert,
  StatusBar,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {FadeIn, FadeInDown} from 'react-native-reanimated';
import dayjs from 'dayjs';

import {
  TransactionItem,
  EmptyState,
  CustomBottomSheet,
  BottomSheetInput,
  BottomSheetChipSelector,
  triggerHaptic,
} from '../components';
import type {CustomBottomSheetHandle} from '../components';
import {useExpenseStore, useSettingsStore, useNetWorthStore} from '../store';
import {PAYMENT_METHODS} from '../constants';
import {formatCurrency} from '../utils';
import {useTheme} from '../theme';
import type {MD3Theme} from '../theme';
import {
  TransactionType,
  PaymentMethod,
  Category,
  Transaction,
  NetWorthTargetType,
  AssetType,
  LiabilityType,
} from '../types';

const ASSET_TYPES: AssetType[] = [
  'Bank', 'Stocks', 'Gold', 'EPF', 'Mutual Funds', 'Fixed Deposit', 'PPF', 'Real Estate', 'Other',
];
const LIABILITY_TYPES: LiabilityType[] = [
  'Home Loan', 'Car Loan', 'Personal Loan', 'Education Loan', 'Credit Card', 'Other',
];

const ExpensesScreen: React.FC = () => {
  const {t} = useTranslation();
  const baseCurrency = useSettingsStore(s => s.baseCurrency);
  const theme = useTheme();
  const s = makeStyles(theme);
  const {colors, spacing} = theme;
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<CustomBottomSheetHandle>(null);

  const {
    transactions,
    categories,
    monthlyExpense,
    monthlyIncome,
    loadTransactions,
    loadMonthlyStats,
    addTransaction,
    removeTransaction,
  } = useExpenseStore();
  const {assets, liabilities, loadNetWorth} = useNetWorthStore();

  const [txnType, setTxnType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [note, setNote] = useState('');
  const [targetType, setTargetType] = useState<NetWorthTargetType>('asset');
  const [targetMode, setTargetMode] = useState<'existing' | 'new'>('existing');
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [newTargetName, setNewTargetName] = useState('');
  const [newAssetType, setNewAssetType] = useState<AssetType>('Bank');
  const [newLiabilityType, setNewLiabilityType] = useState<LiabilityType>('Home Loan');

  useFocusEffect(
    useCallback(() => {
      loadTransactions({limit: 100});
      loadMonthlyStats();
      loadNetWorth();
    }, [loadTransactions, loadMonthlyStats, loadNetWorth]),
  );

  const filteredCategories = categories.filter(c => c.type === txnType);
  const selectedTargets = targetType === 'asset' ? assets : liabilities;

  const resetForm = () => {
    setAmount('');
    setSelectedCategory(null);
    setPaymentMethod('UPI');
    setNote('');
    setTargetType('asset');
    setTargetMode('existing');
    setSelectedTargetId('');
    setNewTargetName('');
    setNewAssetType('Bank');
    setNewLiabilityType('Home Loan');
  };

  const handleSave = async () => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Select Category', 'Please select a category.');
      return;
    }
    if (targetMode === 'existing' && !selectedTargetId) {
      Alert.alert('Select Entry', 'Please select an existing asset or liability entry.');
      return;
    }
    if (targetMode === 'new' && !newTargetName.trim()) {
      Alert.alert('Entry Name Required', 'Please enter a name for the new net worth entry.');
      return;
    }

    const operation =
      txnType === 'income'
        ? targetType === 'asset' ? 'add' : 'subtract'
        : targetType === 'asset' ? 'subtract' : 'add';

    await addTransaction({
      amount: parsed,
      currency: baseCurrency,
      type: txnType,
      categoryId: selectedCategory.id,
      paymentMethod,
      note,
      date: dayjs().format('YYYY-MM-DD'),
      impact: {
        targetType,
        targetId: targetMode === 'existing' ? selectedTargetId : undefined,
        operation,
        createNew:
          targetMode === 'new'
            ? {
                name: newTargetName.trim(),
                type: targetType === 'asset' ? newAssetType : newLiabilityType,
                note: '',
              }
            : undefined,
      },
    });

    triggerHaptic('notificationSuccess');
    resetForm();
    sheetRef.current?.dismiss();
    loadNetWorth();
  };

  const handleDelete = (txn: Transaction) => {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          triggerHaptic('impactMedium');
          removeTransaction(txn.id);
        },
      },
    ]);
  };

  // ── List Header ─────────────────────────────────────────────────────

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.duration(400)} style={s.headerSection}>
      <View style={s.summaryRow}>
        <View style={[s.summaryItem, {backgroundColor: colors.success + '12'}]}>
          <Icon name="arrow-down-circle" size={20} color={colors.success} />
          <Text style={s.summaryLabel}>Income</Text>
          <Text style={[s.summaryValue, {color: colors.success}]}>
            {formatCurrency(monthlyIncome, baseCurrency)}
          </Text>
        </View>
        <View style={[s.summaryItem, {backgroundColor: colors.error + '12'}]}>
          <Icon name="arrow-up-circle" size={20} color={colors.error} />
          <Text style={s.summaryLabel}>Expense</Text>
          <Text style={[s.summaryValue, {color: colors.error}]}>
            {formatCurrency(monthlyExpense, baseCurrency)}
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  // ── Category chip options ───────────────────────────────────────────

  const categoryOptions = filteredCategories.map(c => ({
    value: c.id,
    label: c.name,
    icon: c.icon,
  }));

  const paymentOptions = PAYMENT_METHODS.map(m => ({value: m, label: m}));

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={s.screen} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <Animated.View entering={FadeIn.duration(300)} style={s.header}>
        <Text style={s.headerTitle}>{t('expenses.title')}</Text>
      </Animated.View>

      {renderHeader()}

      <View style={s.listContainer}>
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TransactionItem transaction={item} onPress={handleDelete} />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="receipt"
              title={t('expenses.noTransactions')}
              subtitle={t('expenses.startTracking')}
            />
          }
          ItemSeparatorComponent={() => (
            <View style={[s.separator, {backgroundColor: colors.outlineVariant + '30'}]} />
          )}
          contentContainerStyle={{paddingBottom: 80 + insets.bottom}}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* FAB */}
      <Pressable
        style={[s.fab, {bottom: 70 + insets.bottom}]}
        onPress={() => {
          resetForm();
          triggerHaptic('impactMedium');
          sheetRef.current?.present();
        }}>
        <Icon name="plus" size={28} color={colors.onPrimary} />
      </Pressable>

      {/* ── Add Transaction Bottom Sheet ──────────────────────── */}
      <CustomBottomSheet
        ref={sheetRef}
        title={txnType === 'expense' ? t('expenses.addExpense') : t('expenses.addIncome')}
        snapPoints={['92%']}
        headerLeft={{label: t('common.cancel'), onPress: () => sheetRef.current?.dismiss()}}
        headerRight={{label: t('common.save'), onPress: handleSave}}>

        {/* Expense / Income Toggle */}
        <View style={s.typeToggle}>
          <Pressable
            style={[s.typeBtn, txnType === 'expense' && {backgroundColor: colors.errorContainer}]}
            onPress={() => {
              triggerHaptic('selection');
              setTxnType('expense');
              setSelectedCategory(null);
            }}>
            <Text style={[s.typeBtnText, txnType === 'expense' && {color: colors.onErrorContainer}]}>
              Expense
            </Text>
          </Pressable>
          <Pressable
            style={[s.typeBtn, txnType === 'income' && {backgroundColor: colors.primaryContainer}]}
            onPress={() => {
              triggerHaptic('selection');
              setTxnType('income');
              setSelectedCategory(null);
            }}>
            <Text style={[s.typeBtnText, txnType === 'income' && {color: colors.onPrimaryContainer}]}>
              Income
            </Text>
          </Pressable>
        </View>

        {/* Amount */}
        <BottomSheetInput
          label={t('expenses.amount')}
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          keyboardType="decimal-pad"
          prefix={baseCurrency === 'INR' ? '\u20B9' : baseCurrency === 'USD' ? '$' : '\u20AC'}
          autoFocus
        />

        {/* Category */}
        <BottomSheetChipSelector
          label={t('expenses.category')}
          options={categoryOptions}
          selected={selectedCategory?.id ?? ''}
          onSelect={id => {
            const cat = filteredCategories.find(c => c.id === id) ?? null;
            setSelectedCategory(cat);
          }}
        />

        {/* Payment Method */}
        <BottomSheetChipSelector
          label={t('expenses.paymentMethod')}
          options={paymentOptions}
          selected={paymentMethod}
          onSelect={m => setPaymentMethod(m as PaymentMethod)}
        />

        {/* Net Worth Impact */}
        <Text style={s.sectionLabel}>Net Worth Entry</Text>

        <View style={s.typeToggle}>
          <Pressable
            style={[s.typeBtn, targetType === 'asset' && {backgroundColor: colors.primaryContainer}]}
            onPress={() => {
              triggerHaptic('selection');
              setTargetType('asset');
              setSelectedTargetId('');
            }}>
            <Text style={[s.typeBtnText, targetType === 'asset' && {color: colors.onPrimaryContainer}]}>
              Asset
            </Text>
          </Pressable>
          <Pressable
            style={[s.typeBtn, targetType === 'liability' && {backgroundColor: colors.errorContainer}]}
            onPress={() => {
              triggerHaptic('selection');
              setTargetType('liability');
              setSelectedTargetId('');
            }}>
            <Text style={[s.typeBtnText, targetType === 'liability' && {color: colors.onErrorContainer}]}>
              Liability
            </Text>
          </Pressable>
        </View>

        <View style={[s.typeToggle, {marginBottom: spacing.lg}]}>
          <Pressable
            style={[s.typeBtn, targetMode === 'existing' && {backgroundColor: colors.primaryContainer}]}
            onPress={() => {
              triggerHaptic('selection');
              setTargetMode('existing');
            }}>
            <Text style={[s.typeBtnText, targetMode === 'existing' && {color: colors.onPrimaryContainer}]}>
              Existing
            </Text>
          </Pressable>
          <Pressable
            style={[s.typeBtn, targetMode === 'new' && {backgroundColor: colors.primaryContainer}]}
            onPress={() => {
              triggerHaptic('selection');
              setTargetMode('new');
              setSelectedTargetId('');
            }}>
            <Text style={[s.typeBtnText, targetMode === 'new' && {color: colors.onPrimaryContainer}]}>
              New
            </Text>
          </Pressable>
        </View>

        {targetMode === 'existing' ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{marginBottom: spacing.lg}}>
            {selectedTargets.map(entry => {
              const active = selectedTargetId === entry.id;
              return (
                <Pressable
                  key={entry.id}
                  style={[
                    s.chip,
                    active && {backgroundColor: colors.primaryContainer, borderColor: colors.primary},
                  ]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setSelectedTargetId(entry.id);
                  }}>
                  <Text style={[s.chipText, active && {color: colors.onPrimaryContainer}]}>
                    {entry.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
          <View style={{marginBottom: spacing.lg}}>
            <BottomSheetInput
              label={targetType === 'asset' ? 'Asset Name' : 'Liability Name'}
              value={newTargetName}
              onChangeText={setNewTargetName}
              placeholder={targetType === 'asset' ? 'New asset name' : 'New liability name'}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(targetType === 'asset' ? ASSET_TYPES : LIABILITY_TYPES).map(entryType => {
                const active = (targetType === 'asset' ? newAssetType : newLiabilityType) === entryType;
                return (
                  <Pressable
                    key={entryType}
                    style={[
                      s.chip,
                      active && {backgroundColor: colors.primaryContainer, borderColor: colors.primary},
                    ]}
                    onPress={() => {
                      triggerHaptic('selection');
                      if (targetType === 'asset') setNewAssetType(entryType as AssetType);
                      else setNewLiabilityType(entryType as LiabilityType);
                    }}>
                    <Text style={[s.chipText, active && {color: colors.onPrimaryContainer}]}>
                      {entryType}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        <Text style={s.operationHint}>
          {txnType === 'income'
            ? targetType === 'asset'
              ? 'Income will add to this asset.'
              : 'Income will reduce this liability.'
            : targetType === 'asset'
              ? 'Expense will reduce this asset.'
              : 'Expense will increase this liability.'}
        </Text>

        {/* Note */}
        <BottomSheetInput
          label={t('expenses.note')}
          value={note}
          onChangeText={setNote}
          placeholder="Add a note..."
          multiline
        />
      </CustomBottomSheet>
    </SafeAreaView>
  );
};

export default ExpensesScreen;

// ─── Styles ────────────────────────────────────────────────────────────

function makeStyles(theme: MD3Theme) {
  const {colors, typography, elevation, shape, spacing} = theme;
  return StyleSheet.create({
    screen: {flex: 1, backgroundColor: colors.background},
    header: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
    },
    headerTitle: {
      ...typography.headlineMedium,
      color: colors.onSurface,
      fontWeight: '700',
    },
    headerSection: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.md,
    },
    summaryRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    summaryItem: {
      flex: 1,
      borderRadius: shape.large,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      padding: spacing.lg,
      alignItems: 'center',
    },
    summaryLabel: {
      ...typography.bodySmall,
      color: colors.onSurfaceVariant,
      marginTop: spacing.xs,
    },
    summaryValue: {
      ...typography.titleMedium,
      fontWeight: '700',
      marginTop: 2,
    },
    listContainer: {
      flex: 1,
      backgroundColor: colors.surface,
      marginHorizontal: spacing.xl,
      marginTop: spacing.xs,
      marginBottom: spacing.md,
      borderRadius: shape.large,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      overflow: 'hidden',
      ...elevation.level1,
    },
    separator: {height: 1, marginLeft: 72},
    fab: {
      position: 'absolute',
      right: spacing.xl,
      width: 56,
      height: 56,
      borderRadius: shape.large,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...elevation.level3,
    },
    typeToggle: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: shape.medium,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      padding: 4,
      marginBottom: spacing.xl,
    },
    typeBtn: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: shape.small,
      alignItems: 'center',
    },
    typeBtnText: {
      ...typography.labelLarge,
      color: colors.onSurfaceVariant,
    },
    chip: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: shape.full,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      backgroundColor: colors.surfaceContainerLowest,
      marginRight: spacing.sm,
    },
    chipText: {
      ...typography.labelMedium,
      color: colors.onSurfaceVariant,
    },
    sectionLabel: {
      ...typography.bodySmall,
      color: colors.onSurfaceVariant,
      marginBottom: spacing.sm,
    },
    operationHint: {
      ...typography.bodySmall,
      color: colors.onSurfaceVariant,
      marginBottom: spacing.lg,
      fontStyle: 'italic',
    },
  });
}
