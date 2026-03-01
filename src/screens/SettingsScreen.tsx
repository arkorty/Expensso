/**
 * SettingsScreen — Refactored with MD3 theme and CustomBottomSheet
 * for selection dialogs (replaces system Alert-based selectors).
 */

import React, {useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  StatusBar,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {FadeIn, FadeInDown} from 'react-native-reanimated';

import {
  CustomBottomSheet,
  triggerHaptic,
} from '../components';
import type {CustomBottomSheetHandle} from '../components';
import {useSettingsStore} from '../store';
import {useTheme} from '../theme';
import type {MD3Theme} from '../theme';
import {Currency} from '../types';

const CURRENCIES: {label: string; value: Currency; icon: string}[] = [
  {label: 'Indian Rupee (\u20B9)', value: 'INR', icon: 'currency-inr'},
  {label: 'US Dollar ($)', value: 'USD', icon: 'currency-usd'},
  {label: 'Euro (\u20AC)', value: 'EUR', icon: 'currency-eur'},
  {label: 'British Pound (\u00A3)', value: 'GBP', icon: 'currency-gbp'},
];

const THEMES: {label: string; value: 'light' | 'dark' | 'system'; icon: string}[] = [
  {label: 'Light', value: 'light', icon: 'white-balance-sunny'},
  {label: 'Dark', value: 'dark', icon: 'moon-waning-crescent'},
  {label: 'System', value: 'system', icon: 'theme-light-dark'},
];

// ── Extracted SettingsRow for lint compliance ──────────────────────

interface SettingsRowProps {
  icon: string;
  iconColor?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  theme: MD3Theme;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  iconColor,
  label,
  value,
  onPress,
  destructive,
  theme: thm,
}) => {
  const {colors, typography, shape, spacing} = thm;
  return (
    <Pressable
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
      }}
      onPress={onPress}
      disabled={!onPress}
      android_ripple={{color: colors.primary + '12'}}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: shape.small,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: (iconColor || colors.primary) + '14',
          marginRight: spacing.md,
        }}>
        <Icon name={icon} size={20} color={iconColor || colors.primary} />
      </View>
      <Text
        style={{
          flex: 1,
          ...typography.bodyLarge,
          color: destructive ? colors.error : colors.onSurface,
        }}>
        {label}
      </Text>
      {value ? (
        <Text
          style={{
            ...typography.bodyMedium,
            color: colors.onSurfaceVariant,
            marginRight: spacing.xs,
          }}>
          {value}
        </Text>
      ) : null}
      {onPress ? (
        <Icon name="chevron-right" size={20} color={colors.onSurfaceVariant} />
      ) : null}
    </Pressable>
  );
};

// ── Main Component ────────────────────────────────────────────────

const SettingsScreen: React.FC = () => {
  const {t} = useTranslation();
  const {baseCurrency, setBaseCurrency, theme: themeSetting, setTheme} = useSettingsStore();
  const theme = useTheme();
  const s = makeStyles(theme);
  const {colors} = theme;
  const insets = useSafeAreaInsets();

  const currencySheetRef = useRef<CustomBottomSheetHandle>(null);
  const themeSheetRef = useRef<CustomBottomSheetHandle>(null);

  const handleClearData = () => {
    Alert.alert(
      t('settings.clearData'),
      t('settings.clearDataConfirm'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            triggerHaptic('impactMedium');
            Alert.alert('Done', 'All data has been cleared.');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={s.screen} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <Animated.View entering={FadeIn.duration(300)} style={s.header}>
        <Text style={s.headerTitle}>{t('settings.title')}</Text>
      </Animated.View>

      <ScrollView
        style={s.scrollView}
        contentContainerStyle={{paddingBottom: 60 + insets.bottom}}
        showsVerticalScrollIndicator={false}>

        {/* General */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <Text style={s.sectionTitle}>{t('settings.general')}</Text>
          <View style={s.sectionCard}>
            <SettingsRow
              theme={theme}
              icon="currency-inr"
              label={t('settings.baseCurrency')}
              value={baseCurrency}
              onPress={() => currencySheetRef.current?.present()}
            />
            <View style={s.divider} />
            <SettingsRow
              theme={theme}
              icon="translate"
              iconColor="#7E57C2"
              label={t('settings.language')}
              value="English"
            />
            <View style={s.divider} />
            <SettingsRow
              theme={theme}
              icon="theme-light-dark"
              iconColor="#E65100"
              label={t('settings.theme')}
              value={themeSetting.charAt(0).toUpperCase() + themeSetting.slice(1)}
              onPress={() => themeSheetRef.current?.present()}
            />
          </View>
        </Animated.View>

        {/* Data */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Text style={s.sectionTitle}>{t('settings.data')}</Text>
          <View style={s.sectionCard}>
            <SettingsRow
              theme={theme}
              icon="export"
              iconColor={colors.success}
              label={t('settings.exportData')}
              onPress={() => Alert.alert('Coming Soon', 'Export functionality will be available in a future release.')}
            />
            <View style={s.divider} />
            <SettingsRow
              theme={theme}
              icon="import"
              iconColor="#1E88E5"
              label={t('settings.importData')}
              onPress={() => Alert.alert('Coming Soon', 'Import functionality will be available in a future release.')}
            />
            <View style={s.divider} />
            <SettingsRow
              theme={theme}
              icon="delete-forever"
              iconColor={colors.error}
              label={t('settings.clearData')}
              onPress={handleClearData}
              destructive
            />
          </View>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <Text style={s.sectionTitle}>{t('settings.about')}</Text>
          <View style={s.sectionCard}>
            <SettingsRow
              theme={theme}
              icon="information"
              iconColor="#7E57C2"
              label={t('settings.version')}
              value="0.1.1-alpha"
            />
          </View>
        </Animated.View>

        <Text style={s.footer}>
          {t('settings.appName')} - Made by WebArk
        </Text>
      </ScrollView>

      {/* Currency Selection Bottom Sheet */}
      <CustomBottomSheet
        ref={currencySheetRef}
        title={t('settings.baseCurrency')}
        enableDynamicSizing
        snapPoints={['40%']}>
        {CURRENCIES.map(c => (
          <Pressable
            key={c.value}
            style={[
              s.selectionRow,
              c.value === baseCurrency && {backgroundColor: colors.primaryContainer},
            ]}
            onPress={() => {
              triggerHaptic('selection');
              setBaseCurrency(c.value);
              currencySheetRef.current?.dismiss();
            }}>
            <Icon
              name={c.icon}
              size={20}
              color={c.value === baseCurrency ? colors.primary : colors.onSurfaceVariant}
            />
            <Text
              style={[
                s.selectionLabel,
                c.value === baseCurrency && {color: colors.onPrimaryContainer, fontWeight: '600'},
              ]}>
              {c.label}
            </Text>
            {c.value === baseCurrency && (
              <Icon name="check" size={20} color={colors.primary} />
            )}
          </Pressable>
        ))}
      </CustomBottomSheet>

      {/* Theme Selection Bottom Sheet */}
      <CustomBottomSheet
        ref={themeSheetRef}
        title={t('settings.theme')}
        enableDynamicSizing
        snapPoints={['35%']}>
        {THEMES.map(th => (
          <Pressable
            key={th.value}
            style={[
              s.selectionRow,
              th.value === themeSetting && {backgroundColor: colors.primaryContainer},
            ]}
            onPress={() => {
              triggerHaptic('selection');
              setTheme(th.value);
              themeSheetRef.current?.dismiss();
            }}>
            <Icon
              name={th.icon}
              size={20}
              color={th.value === themeSetting ? colors.primary : colors.onSurfaceVariant}
            />
            <Text
              style={[
                s.selectionLabel,
                th.value === themeSetting && {color: colors.onPrimaryContainer, fontWeight: '600'},
              ]}>
              {th.label}
            </Text>
            {th.value === themeSetting && (
              <Icon name="check" size={20} color={colors.primary} />
            )}
          </Pressable>
        ))}
      </CustomBottomSheet>
    </SafeAreaView>
  );
};

export default SettingsScreen;

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
    scrollView: {flex: 1, paddingHorizontal: spacing.xl},
    sectionTitle: {
      ...typography.labelSmall,
      color: colors.onSurfaceVariant,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginTop: spacing.xxl,
      marginBottom: spacing.sm,
      marginLeft: spacing.xs,
    },
    sectionCard: {
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: shape.large,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      overflow: 'hidden',
      ...elevation.level1,
    },
    divider: {
      height: 1,
      backgroundColor: colors.outlineVariant + '30',
      marginLeft: 64,
    },
    footer: {
      textAlign: 'center',
      ...typography.bodySmall,
      color: colors.onSurfaceVariant,
      marginTop: spacing.xxxl,
      marginBottom: spacing.xxxl + 8,
    },
    selectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.lg,
      borderRadius: shape.medium,
      marginBottom: spacing.xs,
    },
    selectionLabel: {
      flex: 1,
      ...typography.bodyLarge,
      color: colors.onSurface,
    },
  });
}
