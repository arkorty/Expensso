import React from 'react';
import {View, Text, StyleSheet, Pressable, ViewStyle} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionLabel,
  onAction,
  style,
}) => {
  const {colors} = useTheme();
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, {color: colors.onSurface}]}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={styles.action} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={[styles.actionLabel, {color: colors.primary}]}>{actionLabel}</Text>
          <Icon name="chevron-right" size={16} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});
