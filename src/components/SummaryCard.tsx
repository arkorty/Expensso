import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import {useTheme} from '../theme';

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  valueColor?: string;
  style?: ViewStyle;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  valueColor,
  style,
}) => {
  const {colors, typography, elevation, shape, spacing} = useTheme();
  return (
    <View style={[styles.card, {
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: shape.small,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      ...elevation.level1
    }, style]}>
      <View style={styles.cardHeader}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[styles.cardTitle, {color: colors.onSurfaceVariant}]}>{title}</Text>
      </View>
      <Text style={[styles.cardValue, {color: colors.onSurface}, valueColor ? {color: valueColor} : undefined]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {subtitle ? <Text style={[styles.cardSubtitle, {color: colors.onSurfaceVariant}]}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  cardValue: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
