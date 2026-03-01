/**
 * NetWorthScreen — MD3 refactored.
 * Replaces system Modals with CustomBottomSheet.
 * Uses MD3 theme tokens (useTheme), Reanimated animations, and haptic feedback.
 */

import React, {useCallback, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {LineChart} from 'react-native-gifted-charts';
import Animated, {FadeIn, FadeInDown, FadeInUp} from 'react-native-reanimated';

import {
  SectionHeader,
  EmptyState,
  CustomBottomSheet,
  BottomSheetInput,
  BottomSheetChipSelector,
  triggerHaptic,
} from '../components';
import type {CustomBottomSheetHandle} from '../components';
import {useNetWorthStore, useSettingsStore} from '../store';
import {getNetWorthHistory} from '../db';
import {formatCurrency, formatCompact} from '../utils';
import {useTheme} from '../theme';
import type {MD3Theme} from '../theme';
import {Asset, AssetType, Liability, LiabilityType, NetWorthSnapshot} from '../types';

const ASSET_TYPES: AssetType[] = [
  'Bank', 'Stocks', 'Gold', 'EPF', 'Mutual Funds', 'Fixed Deposit', 'PPF', 'Real Estate', 'Other',
];
const LIABILITY_TYPES: LiabilityType[] = [
  'Home Loan', 'Car Loan', 'Personal Loan', 'Education Loan', 'Credit Card', 'Other',
];

const ASSET_ICONS: Record<AssetType, string> = {
  Bank: 'bank',
  Stocks: 'chart-line',
  Gold: 'gold',
  EPF: 'shield-account',
  'Real Estate': 'home-city',
  'Mutual Funds': 'chart-areaspline',
  'Fixed Deposit': 'safe',
  PPF: 'piggy-bank',
  Other: 'dots-horizontal',
};

const ASSET_ICON_COLORS: Record<AssetType, string> = {
  Bank: '#1E88E5',
  Stocks: '#7E57C2',
  Gold: '#D4AF37',
  EPF: '#00ACC1',
  'Real Estate': '#8D6E63',
  'Mutual Funds': '#26A69A',
  'Fixed Deposit': '#3949AB',
  PPF: '#43A047',
  Other: '#78909C',
};

const LIABILITY_ICON_COLORS: Record<LiabilityType, {icon: string; color: string}> = {
  'Home Loan': {icon: 'home-city', color: '#EF6C00'},
  'Car Loan': {icon: 'car', color: '#5E35B1'},
  'Personal Loan': {icon: 'account-cash', color: '#E53935'},
  'Education Loan': {icon: 'school', color: '#1E88E5'},
  'Credit Card': {icon: 'credit-card', color: '#D81B60'},
  Other: {icon: 'alert-circle-outline', color: '#757575'},
};

const NetWorthScreen: React.FC = () => {
  const {t} = useTranslation();
  const baseCurrency = useSettingsStore(s => s.baseCurrency);
  const theme = useTheme();
  const s = makeStyles(theme);
  const {colors, spacing, shape} = theme;
  const insets = useSafeAreaInsets();

  const assetSheetRef = useRef<CustomBottomSheetHandle>(null);
  const liabilitySheetRef = useRef<CustomBottomSheetHandle>(null);

  const {
    assets,
    liabilities,
    totalAssets,
    totalLiabilities,
    netWorth,
    isLoading,
    loadNetWorth,
    addAsset,
    removeAsset,
    editAsset,
    addLiability,
    removeLiability,
    editLiability,
    takeSnapshot,
  } = useNetWorthStore();

  const [history, setHistory] = useState<NetWorthSnapshot[]>([]);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);

  // Asset form
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('Bank');
  const [assetValue, setAssetValue] = useState('');
  const [assetNote, setAssetNote] = useState('');

  // Liability form
  const [liabName, setLiabName] = useState('');
  const [liabType, setLiabType] = useState<LiabilityType>('Home Loan');
  const [liabAmount, setLiabAmount] = useState('');
  const [liabRate, setLiabRate] = useState('');
  const [liabEmi, setLiabEmi] = useState('');
  const [liabNote, setLiabNote] = useState('');

  const loadAll = useCallback(async () => {
    await loadNetWorth();
    const hist = await getNetWorthHistory(12);
    setHistory(hist);
  }, [loadNetWorth]);

  useFocusEffect(useCallback(() => { loadAll(); }, [loadAll]));

  // Chart data
  const lineData = history.map(snap => ({
    value: snap.netWorth,
    label: snap.snapshotDate.slice(5, 10),
    dataPointText: formatCompact(snap.netWorth, baseCurrency),
  }));

  // Asset type chip options
  const assetTypeOptions = ASSET_TYPES.map(at => ({
    value: at,
    label: at,
    icon: ASSET_ICONS[at],
  }));

  const liabTypeOptions = LIABILITY_TYPES.map(lt => ({
    value: lt,
    label: lt,
  }));

  // ── Save Asset ──────────────────────────────────────────────────

  const handleSaveAsset = async () => {
    const val = parseFloat(assetValue);
    if (!assetName.trim() || isNaN(val) || val <= 0) {
      Alert.alert('Invalid', 'Please enter a valid name and value.');
      return;
    }
    if (editingAsset) {
      await editAsset(editingAsset.id, {
        name: assetName.trim(),
        type: assetType,
        currentValue: val,
        note: assetNote,
      });
    } else {
      await addAsset({
        name: assetName.trim(),
        type: assetType,
        currentValue: val,
        currency: baseCurrency,
        note: assetNote,
      });
    }
    triggerHaptic('notificationSuccess');
    await takeSnapshot(baseCurrency);
    setAssetName(''); setAssetValue(''); setAssetNote(''); setEditingAsset(null);
    assetSheetRef.current?.dismiss();
    loadAll();
  };

  // ── Save Liability ──────────────────────────────────────────────

  const handleSaveLiability = async () => {
    const amt = parseFloat(liabAmount);
    if (!liabName.trim() || isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid', 'Please enter a valid name and amount.');
      return;
    }
    if (editingLiability) {
      await editLiability(editingLiability.id, {
        name: liabName.trim(),
        type: liabType,
        outstandingAmount: amt,
        interestRate: parseFloat(liabRate) || 0,
        emiAmount: parseFloat(liabEmi) || 0,
        note: liabNote,
      });
    } else {
      await addLiability({
        name: liabName.trim(),
        type: liabType,
        outstandingAmount: amt,
        currency: baseCurrency,
        interestRate: parseFloat(liabRate) || 0,
        emiAmount: parseFloat(liabEmi) || 0,
        note: liabNote,
      });
    }
    triggerHaptic('notificationSuccess');
    await takeSnapshot(baseCurrency);
    setLiabName(''); setLiabAmount(''); setLiabRate('');
    setLiabEmi(''); setLiabNote(''); setEditingLiability(null);
    liabilitySheetRef.current?.dismiss();
    loadAll();
  };

  // ── Delete / Edit handlers ──────────────────────────────────────

  const handleDeleteAsset = (asset: Asset) => {
    Alert.alert('Delete Asset', `Remove "${asset.name}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: () => {
        triggerHaptic('impactMedium');
        removeAsset(asset.id);
      }},
    ]);
  };

  const handleDeleteLiability = (liab: Liability) => {
    Alert.alert('Delete Liability', `Remove "${liab.name}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: () => {
        triggerHaptic('impactMedium');
        removeLiability(liab.id);
      }},
    ]);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setAssetName(asset.name);
    setAssetType(asset.type as AssetType);
    setAssetValue(asset.currentValue.toString());
    setAssetNote(asset.note || '');
    assetSheetRef.current?.present();
  };

  const handleEditLiability = (liab: Liability) => {
    setEditingLiability(liab);
    setLiabName(liab.name);
    setLiabType(liab.type as LiabilityType);
    setLiabAmount(liab.outstandingAmount.toString());
    setLiabRate(liab.interestRate.toString());
    setLiabEmi(liab.emiAmount.toString());
    setLiabNote(liab.note || '');
    liabilitySheetRef.current?.present();
  };

  const handleOpenAddAsset = () => {
    setEditingAsset(null);
    setAssetName(''); setAssetType('Bank'); setAssetValue(''); setAssetNote('');
    assetSheetRef.current?.present();
  };

  const handleOpenAddLiability = () => {
    setEditingLiability(null);
    setLiabName(''); setLiabType('Home Loan'); setLiabAmount('');
    setLiabRate(''); setLiabEmi(''); setLiabNote('');
    liabilitySheetRef.current?.present();
  };

  // ── Render ──────────────────────────────────────────────────────

  return (
    <SafeAreaView style={s.screen} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <Animated.View entering={FadeIn.duration(300)} style={s.header}>
        <Text style={s.headerTitle}>{t('netWorth.title')}</Text>
      </Animated.View>

      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{paddingBottom: 60 + insets.bottom}}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadAll} />}>

        {/* Hero Card */}
        <Animated.View entering={FadeInDown.springify().damping(18)} style={s.heroCard}>
          <Text style={s.heroLabel}>{t('dashboard.netWorth')}</Text>
          <Text
            style={[s.heroValue, {color: netWorth >= 0 ? colors.success : colors.error}]}
            numberOfLines={1}
            adjustsFontSizeToFit>
            {formatCurrency(netWorth, baseCurrency)}
          </Text>
          <View style={s.heroSplit}>
            <View style={s.heroSplitItem}>
              <Icon name="trending-up" size={16} color={colors.success} />
              <Text style={[s.heroSplitLabel, {color: colors.onSurfaceVariant}]}>Assets</Text>
              <Text style={[s.heroSplitValue, {color: colors.success}]}>
                {formatCurrency(totalAssets, baseCurrency)}
              </Text>
            </View>
            <View style={[s.heroSplitDivider, {backgroundColor: colors.outlineVariant}]} />
            <View style={s.heroSplitItem}>
              <Icon name="trending-down" size={16} color={colors.error} />
              <Text style={[s.heroSplitLabel, {color: colors.onSurfaceVariant}]}>Liabilities</Text>
              <Text style={[s.heroSplitValue, {color: colors.error}]}>
                {formatCurrency(totalLiabilities, baseCurrency)}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Chart */}
        {lineData.length > 1 && (
          <Animated.View entering={FadeInUp.duration(400).delay(100)}>
            <SectionHeader title={t('netWorth.growth')} />
            <View style={s.chartCard}>
              <LineChart
                data={lineData}
                curved
                color={colors.primary}
                thickness={2}
                dataPointsColor={colors.primary}
                startFillColor={colors.primary}
                endFillColor={colors.primary + '05'}
                areaChart
                yAxisTextStyle={{fontSize: 11, color: colors.onSurfaceVariant}}
                xAxisLabelTextStyle={{fontSize: 11, color: colors.onSurfaceVariant}}
                hideRules
                yAxisThickness={0}
                xAxisThickness={0}
                noOfSections={4}
                isAnimated
              />
            </View>
          </Animated.View>
        )}

        {/* Assets List */}
        <Animated.View entering={FadeInUp.duration(400).delay(200)}>
          <SectionHeader
            title={t('netWorth.assets')}
            actionLabel={t('common.add')}
            onAction={handleOpenAddAsset}
          />
          <View style={s.listCard}>
            {assets.length > 0 ? (
              assets.map((asset, idx) => {
                const iconColor = ASSET_ICON_COLORS[asset.type as AssetType] || colors.primary;
                const iconName = ASSET_ICONS[asset.type as AssetType] || 'dots-horizontal';
                return (
                  <Pressable
                    key={asset.id}
                    style={[s.listItem, idx < assets.length - 1 && s.listItemBorder]}
                    onPress={() => handleEditAsset(asset)}
                    onLongPress={() => handleDeleteAsset(asset)}
                    android_ripple={{color: colors.primary + '12'}}>
                    <View style={[s.listIcon, {backgroundColor: iconColor + '1A'}]}>
                      <Icon name={iconName} size={20} color={iconColor} />
                    </View>
                    <View style={s.listDetails}>
                      <Text style={s.listName}>{asset.name}</Text>
                      <Text style={s.listType}>{asset.type}</Text>
                    </View>
                    <Text style={[s.listValue, {color: colors.success}]}>
                      {formatCurrency(asset.currentValue, baseCurrency)}
                    </Text>
                  </Pressable>
                );
              })
            ) : (
              <EmptyState icon="wallet-plus" title={t('netWorth.noAssets')} />
            )}
          </View>
        </Animated.View>

        {/* Liabilities List */}
        <Animated.View entering={FadeInUp.duration(400).delay(300)}>
          <SectionHeader
            title={t('netWorth.liabilities')}
            actionLabel={t('common.add')}
            onAction={handleOpenAddLiability}
          />
          <View style={s.listCard}>
            {liabilities.length > 0 ? (
              liabilities.map((liab, idx) => {
                const liabVisual = LIABILITY_ICON_COLORS[liab.type as LiabilityType] || LIABILITY_ICON_COLORS.Other;
                return (
                  <Pressable
                    key={liab.id}
                    style={[s.listItem, idx < liabilities.length - 1 && s.listItemBorder]}
                    onPress={() => handleEditLiability(liab)}
                    onLongPress={() => handleDeleteLiability(liab)}
                    android_ripple={{color: colors.primary + '12'}}>
                    <View style={[s.listIcon, {backgroundColor: liabVisual.color + '1A'}]}>
                      <Icon name={liabVisual.icon} size={20} color={liabVisual.color} />
                    </View>
                    <View style={s.listDetails}>
                      <Text style={s.listName}>{liab.name}</Text>
                      <Text style={s.listType}>
                        {liab.type} · {liab.interestRate}% · EMI {formatCompact(liab.emiAmount, baseCurrency)}
                      </Text>
                    </View>
                    <Text style={[s.listValue, {color: colors.error}]}>
                      {formatCurrency(liab.outstandingAmount, baseCurrency)}
                    </Text>
                  </Pressable>
                );
              })
            ) : (
              <EmptyState icon="credit-card-off" title={t('netWorth.noLiabilities')} />
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* ── Asset Bottom Sheet ─────────────────────────────────────── */}
      <CustomBottomSheet
        ref={assetSheetRef}
        title={editingAsset ? 'Edit Asset' : t('netWorth.addAsset')}
        snapPoints={['80%']}
        headerLeft={{label: t('common.cancel'), onPress: () => assetSheetRef.current?.dismiss()}}
        headerRight={{label: t('common.save'), onPress: handleSaveAsset}}>

        <BottomSheetInput
          label={t('netWorth.assetName')}
          value={assetName}
          onChangeText={setAssetName}
          placeholder="e.g. HDFC Savings"
        />

        <BottomSheetChipSelector
          label={t('netWorth.assetType')}
          options={assetTypeOptions}
          selected={assetType}
          onSelect={at => setAssetType(at as AssetType)}
        />

        <BottomSheetInput
          label={t('netWorth.currentValue')}
          value={assetValue}
          onChangeText={setAssetValue}
          placeholder="0"
          keyboardType="decimal-pad"
          prefix={baseCurrency === 'INR' ? '\u20B9' : baseCurrency === 'USD' ? '$' : '\u20AC'}
        />

        <BottomSheetInput
          label="Note"
          value={assetNote}
          onChangeText={setAssetNote}
          placeholder="Optional note"
        />
      </CustomBottomSheet>

      {/* ── Liability Bottom Sheet ─────────────────────────────────── */}
      <CustomBottomSheet
        ref={liabilitySheetRef}
        title={editingLiability ? 'Edit Liability' : t('netWorth.addLiability')}
        snapPoints={['90%']}
        headerLeft={{label: t('common.cancel'), onPress: () => liabilitySheetRef.current?.dismiss()}}
        headerRight={{label: t('common.save'), onPress: handleSaveLiability}}>

        <BottomSheetInput
          label={t('netWorth.liabilityName')}
          value={liabName}
          onChangeText={setLiabName}
          placeholder="e.g. SBI Home Loan"
        />

        <BottomSheetChipSelector
          label={t('netWorth.liabilityType')}
          options={liabTypeOptions}
          selected={liabType}
          onSelect={lt => setLiabType(lt as LiabilityType)}
        />

        <BottomSheetInput
          label={t('netWorth.outstandingAmount')}
          value={liabAmount}
          onChangeText={setLiabAmount}
          placeholder="0"
          keyboardType="decimal-pad"
          prefix={baseCurrency === 'INR' ? '\u20B9' : baseCurrency === 'USD' ? '$' : '\u20AC'}
        />

        <BottomSheetInput
          label={t('netWorth.interestRate')}
          value={liabRate}
          onChangeText={setLiabRate}
          placeholder="e.g. 8.5"
          keyboardType="decimal-pad"
          prefix="%"
        />

        <BottomSheetInput
          label={t('netWorth.emiAmount')}
          value={liabEmi}
          onChangeText={setLiabEmi}
          placeholder="0"
          keyboardType="decimal-pad"
          prefix={baseCurrency === 'INR' ? '\u20B9' : baseCurrency === 'USD' ? '$' : '\u20AC'}
        />

        <BottomSheetInput
          label="Note"
          value={liabNote}
          onChangeText={setLiabNote}
          placeholder="Optional note"
        />
      </CustomBottomSheet>
    </SafeAreaView>
  );
};

export default NetWorthScreen;

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
    heroCard: {
      backgroundColor: colors.surfaceContainerLow,
      marginHorizontal: spacing.xl,
      marginTop: spacing.md,
      borderRadius: shape.extraLarge,
      borderWidth: 1.5,
      borderColor: colors.outlineVariant,
      padding: spacing.xl,
      ...elevation.level2,
    },
    heroLabel: {
      ...typography.labelSmall,
      color: colors.onSurfaceVariant,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    heroValue: {
      ...typography.displaySmall,
      fontWeight: '800',
      marginTop: spacing.xs,
    },
    heroSplit: {
      flexDirection: 'row',
      marginTop: spacing.lg,
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.outlineVariant + '40',
    },
    heroSplitItem: {
      flex: 1,
      alignItems: 'center',
      gap: 2,
    },
    heroSplitDivider: {
      width: 1,
      marginHorizontal: spacing.md,
    },
    heroSplitLabel: {
      ...typography.bodySmall,
    },
    heroSplitValue: {
      ...typography.titleSmall,
      fontWeight: '700',
    },
    chartCard: {
      backgroundColor: colors.surfaceContainerLow,
      marginHorizontal: spacing.xl,
      borderRadius: shape.large,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      padding: spacing.xl,
      alignItems: 'center',
      ...elevation.level1,
    },
    listCard: {
      backgroundColor: colors.surfaceContainerLow,
      marginHorizontal: spacing.xl,
      borderRadius: shape.large,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      overflow: 'hidden',
      ...elevation.level1,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.lg,
    },
    listItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant + '30',
    },
    listIcon: {
      width: 42,
      height: 42,
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listDetails: {flex: 1, marginLeft: spacing.md},
    listName: {
      ...typography.bodyLarge,
      color: colors.onSurface,
      fontWeight: '600',
    },
    listType: {
      ...typography.bodySmall,
      color: colors.onSurfaceVariant,
      marginTop: 2,
    },
    listValue: {
      ...typography.titleSmall,
      fontWeight: '700',
    },
  });
}
