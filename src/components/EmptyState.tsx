import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../theme';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({icon, title, subtitle}) => {
  const {colors} = useTheme();
  return (
    <View style={styles.container}>
      <Icon name={icon} size={56} color={colors.onSurfaceVariant} />
      <Text style={[styles.title, {color: colors.onSurfaceVariant}]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, {color: colors.onSurfaceVariant}]}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
});
