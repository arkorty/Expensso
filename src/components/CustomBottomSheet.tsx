/**
 * CustomBottomSheet — replaces ALL system Alert/Modal patterns.
 *
 * Built on @gorhom/bottom-sheet with MD3 styling, drag-handle,
 * scrim overlay, and smooth reanimated transitions.
 *
 * Usage:
 *   <CustomBottomSheet ref={sheetRef} snapPoints={['50%']}>
 *     <BottomSheetContent />
 *   </CustomBottomSheet>
 *
 * Imperative API:
 *   sheetRef.current?.present()   – open
 *   sheetRef.current?.dismiss()   – close
 */

import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {useTheme} from '../theme';
import type {MD3Theme} from '../theme';

const hapticOptions = {enableVibrateFallback: true, ignoreAndroidSystemSettings: false};
export const triggerHaptic = (type: 'impactLight' | 'impactMedium' | 'selection' | 'notificationSuccess' = 'impactLight') =>
  ReactNativeHapticFeedback.trigger(type, hapticOptions);

// ─── Public Handle ───────────────────────────────────────────────────

export interface CustomBottomSheetHandle {
  present: () => void;
  dismiss: () => void;
}

// ─── Props ───────────────────────────────────────────────────────────

export interface CustomBottomSheetProps {
  /** Title displayed in the sheet header */
  title?: string;
  /** Snap-point percentages or absolute values */
  snapPoints?: (string | number)[];
  /** Callback when the sheet is fully closed */
  onDismiss?: () => void;
  /** Whether to wrap children in a ScrollView (default: true) */
  scrollable?: boolean;
  /** Header left action (e.g. Cancel) */
  headerLeft?: {label: string; onPress: () => void};
  /** Header right action (e.g. Save) */
  headerRight?: {label: string; onPress: () => void; color?: string};
  /** Content */
  children: React.ReactNode;
  /** Enable dynamic sizing instead of snapPoints */
  enableDynamicSizing?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────

const CustomBottomSheetInner = forwardRef<CustomBottomSheetHandle, CustomBottomSheetProps>(
  (
    {
      title,
      snapPoints: snapPointsProp,
      onDismiss,
      scrollable = true,
      headerLeft,
      headerRight,
      children,
      enableDynamicSizing = false,
    },
    ref,
  ) => {
    const theme = useTheme();
    const s = makeStyles(theme);
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => snapPointsProp ?? ['60%'], [snapPointsProp]);

    // Imperative handle
    useImperativeHandle(ref, () => ({
      present: () => {
        triggerHaptic('impactMedium');
        sheetRef.current?.snapToIndex(0);
      },
      dismiss: () => {
        triggerHaptic('impactLight');
        sheetRef.current?.close();
      },
    }));

    // Backdrop with scrim
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.4}
          pressBehavior="close"
        />
      ),
      [],
    );

    // Handle indicator
    const renderHandle = useCallback(
      () => (
        <View style={s.handleContainer}>
          <View style={s.handle} />
        </View>
      ),
      [s],
    );

    const Wrapper = scrollable ? BottomSheetScrollView : BottomSheetView;

    return (
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={enableDynamicSizing ? undefined : snapPoints}
        enableDynamicSizing={enableDynamicSizing}
        enablePanDownToClose
        onClose={onDismiss}
        backdropComponent={renderBackdrop}
        handleComponent={renderHandle}
        backgroundStyle={s.background}
        style={s.container}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize">
        {/* Sheet Header */}
        {(title || headerLeft || headerRight) && (
          <View style={s.header}>
            {headerLeft ? (
              <TouchableOpacity onPress={headerLeft.onPress} hitSlop={8}>
                <Text style={s.headerLeftText}>{headerLeft.label}</Text>
              </TouchableOpacity>
            ) : (
              <View style={s.headerPlaceholder} />
            )}
            {title ? <Text style={s.headerTitle}>{title}</Text> : <View />}
            {headerRight ? (
              <TouchableOpacity onPress={headerRight.onPress} hitSlop={8}>
                <Text
                  style={[
                    s.headerRightText,
                    headerRight.color ? {color: headerRight.color} : undefined,
                  ]}>
                  {headerRight.label}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={s.headerPlaceholder} />
            )}
          </View>
        )}

        {/* Sheet Body */}
        <Wrapper
          style={s.body}
          contentContainerStyle={s.bodyContent}
          showsVerticalScrollIndicator={false}>
          {children}
        </Wrapper>
      </BottomSheet>
    );
  },
);

CustomBottomSheetInner.displayName = 'CustomBottomSheet';

export const CustomBottomSheet = CustomBottomSheetInner;

// ─── Styles ──────────────────────────────────────────────────────────

function makeStyles(theme: MD3Theme) {
  const {colors, typography, shape, spacing} = theme;
  return StyleSheet.create({
    container: {
      zIndex: 999,
    },
    background: {
      backgroundColor: colors.surfaceContainerLow,
      borderTopLeftRadius: shape.extraLarge,
      borderTopRightRadius: shape.extraLarge,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: colors.outlineVariant,
    },
    handleContainer: {
      alignItems: 'center',
      paddingTop: spacing.sm,
      paddingBottom: spacing.xs,
    },
    handle: {
      width: 32,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.onSurfaceVariant,
      opacity: 0.4,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    headerTitle: {
      ...typography.titleMedium,
      color: colors.onSurface,
      fontWeight: '600',
    },
    headerLeftText: {
      ...typography.labelLarge,
      color: colors.onSurfaceVariant,
    },
    headerRightText: {
      ...typography.labelLarge,
      color: colors.primary,
      fontWeight: '600',
    },
    headerPlaceholder: {
      width: 48,
    },
    body: {
      flex: 1,
    },
    bodyContent: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xxxl + 20,
    },
  });
}

// ─── Convenience Sub-Components ──────────────────────────────────────

/**
 * MD3-styled text input for use inside bottom sheets.
 */
export interface BottomSheetInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad' | 'email-address';
  error?: string;
  multiline?: boolean;
  prefix?: string;
  autoFocus?: boolean;
}

export const BottomSheetInput: React.FC<BottomSheetInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  error,
  multiline = false,
  prefix,
  autoFocus = false,
}) => {
  const theme = useTheme();
  const {colors, typography, shape, spacing} = theme;
  const [focused, setFocused] = React.useState(false);
  const inputRef = React.useRef<React.ComponentRef<typeof BottomSheetTextInput>>(null);

  const handlePressIn = React.useCallback(() => {
    if (Platform.OS === 'android' && focused) {
      inputRef.current?.focus();
    }
  }, [focused]);

  const borderColor = error
    ? colors.error
    : focused
      ? colors.primary
      : colors.outline;

  return (
    <View style={{marginBottom: spacing.lg}}>
      <Text
        style={{
          ...typography.bodySmall,
          color: error ? colors.error : focused ? colors.primary : colors.onSurfaceVariant,
          marginBottom: spacing.xs,
        }}>
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: focused ? 2 : 1,
          borderColor,
          borderRadius: shape.small,
          backgroundColor: colors.surfaceContainerLowest,
          paddingHorizontal: spacing.md,
          minHeight: multiline ? 80 : 48,
        }}>
        {prefix && (
          <Text
            style={{
              ...typography.bodyLarge,
              color: colors.onSurfaceVariant,
              marginRight: spacing.xs,
            }}>
            {prefix}
          </Text>
        )}
        <BottomSheetTextInput
          ref={inputRef}
          style={{
            flex: 1,
            ...typography.bodyLarge,
            color: colors.onSurface,
            paddingVertical: spacing.sm,
            textAlignVertical: multiline ? 'top' : 'center',
          }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.onSurfaceVariant + '80'}
          keyboardType={keyboardType}
          multiline={multiline}
          autoFocus={autoFocus}
          showSoftInputOnFocus
          onPressIn={handlePressIn}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
      {error && (
        <Text
          style={{
            ...typography.bodySmall,
            color: colors.error,
            marginTop: spacing.xs,
          }}>
          {error}
        </Text>
      )}
    </View>
  );
};

/**
 * MD3 chip selector row for use inside bottom sheets.
 */
export interface BottomSheetChipSelectorProps<T extends string> {
  label?: string;
  options: {value: T; label: string; icon?: string}[];
  selected: T;
  onSelect: (value: T) => void;
}

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export function BottomSheetChipSelector<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: BottomSheetChipSelectorProps<T>) {
  const theme = useTheme();
  const {colors, typography, shape, spacing} = theme;

  return (
    <View style={{marginBottom: spacing.lg}}>
      {label && (
        <Text
          style={{
            ...typography.bodySmall,
            color: colors.onSurfaceVariant,
            marginBottom: spacing.sm,
          }}>
          {label}
        </Text>
      )}
      <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm}}>
        {options.map(opt => {
          const isSelected = opt.value === selected;
          return (
            <Pressable
              key={opt.value}
              onPress={() => {
                triggerHaptic('selection');
                onSelect(opt.value);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: shape.small,
                borderWidth: 1,
                borderColor: isSelected ? colors.primary : colors.outlineVariant,
                backgroundColor: isSelected
                  ? colors.primaryContainer
                  : colors.surfaceContainerLowest,
              }}>
              {opt.icon && (
                <Icon
                  name={opt.icon}
                  size={16}
                  color={isSelected ? colors.primary : colors.onSurfaceVariant}
                  style={{marginRight: spacing.xs}}
                />
              )}
              <Text
                style={{
                  ...typography.labelMedium,
                  color: isSelected ? colors.onPrimaryContainer : colors.onSurfaceVariant,
                }}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
