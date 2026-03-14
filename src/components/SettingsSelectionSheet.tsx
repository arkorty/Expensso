import React, {forwardRef, useImperativeHandle, useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type {CustomBottomSheetHandle} from './CustomBottomSheet';
import {triggerHaptic} from './CustomBottomSheet';
import {FloatingModal} from './FloatingModal';
import {useTheme} from '../theme';

export interface SettingsSelectionOption<T extends string> {
  label: string;
  value: T;
  icon?: string;
}

export interface SettingsSelectionSheetProps<T extends string> {
  title: string;
  options: SettingsSelectionOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  enableDynamicSizing?: boolean;
  snapPoints?: (string | number)[];
}

const SettingsSelectionSheetInner = <T extends string>(
  {
    title,
    options,
    selectedValue,
    onSelect,
  }: SettingsSelectionSheetProps<T>,
  ref: React.ForwardedRef<CustomBottomSheetHandle>,
) => {
  const theme = useTheme();
  const {colors, typography, spacing, shape} = theme;
  const [visible, setVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    present: () => {
      triggerHaptic('impactLight');
      setVisible(true);
    },
    dismiss: () => {
      triggerHaptic('impactLight');
      setVisible(false);
    },
  }));

  const selectedOption = useMemo(
    () => options.find(option => option.value === selectedValue),
    [options, selectedValue],
  );

  return (
    <FloatingModal
      visible={visible}
      onClose={() => setVisible(false)}
      title={title}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {options.map(option => {
          const selected = option.value === selectedValue;
          return (
            <Pressable
              key={option.value}
              onPress={() => {
                triggerHaptic('selection');
                onSelect(option.value);
                setVisible(false);
              }}
              style={{
                ...styles.optionRow,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.md,
                borderRadius: shape.medium,
                borderColor: selected ? colors.primary : colors.outlineVariant,
                backgroundColor: selected
                  ? colors.primaryContainer
                  : colors.surfaceContainerLowest,
                marginBottom: spacing.sm,
              }}>
              {option.icon ? (
                <Icon
                  name={option.icon}
                  size={18}
                  color={selected ? colors.primary : colors.onSurfaceVariant}
                />
              ) : null}
              <Text
                style={[
                  {
                    ...typography.bodyLarge,
                    color: selected ? colors.onPrimaryContainer : colors.onSurface,
                  },
                  styles.optionLabel,
                  option.icon ? styles.optionLabelWithIcon : null,
                ]}>
                {option.label}
              </Text>
              {selected ? (
                <Icon name="check" size={18} color={colors.primary} />
              ) : null}
            </Pressable>
          );
        })}

        {!selectedOption && options.length > 0 ? (
          <View style={{...styles.hintContainer, marginTop: spacing.xs, paddingHorizontal: spacing.xs}}>
            <Text style={{...typography.bodySmall, color: colors.onSurfaceVariant}}>
              Current selection is unavailable. Pick a new value.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </FloatingModal>
  );
};

export const SettingsSelectionSheet = forwardRef(SettingsSelectionSheetInner) as <T extends string>(
  props: SettingsSelectionSheetProps<T> & React.RefAttributes<CustomBottomSheetHandle>,
) => React.ReactElement;

const styles = StyleSheet.create({
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  optionLabel: {
    flex: 1,
  },
  optionLabelWithIcon: {
    marginLeft: 8,
  },
  hintContainer: {
    marginTop: 0,
    paddingHorizontal: 0,
  },
});
