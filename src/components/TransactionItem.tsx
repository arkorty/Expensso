import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Transaction} from '../types';
import {formatCurrency} from '../utils';
import {useSettingsStore} from '../store';
import {useTheme} from '../theme';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
}) => {
  const baseCurrency = useSettingsStore(s => s.baseCurrency);
  const {colors} = useTheme();
  const isExpense = transaction.type === 'expense';

  return (
    <Pressable
      style={[styles.container, {backgroundColor: colors.surface}]}
      onPress={() => onPress?.(transaction)}
      android_ripple={{color: colors.primary + '12'}}>
      <View
        style={[
          styles.iconCircle,
          {backgroundColor: (transaction.categoryColor || '#95A5A6') + '18'},
        ]}>
        <Icon
          name={transaction.categoryIcon || 'dots-horizontal'}
          size={22}
          color={transaction.categoryColor || '#95A5A6'}
        />
      </View>

      <View style={styles.details}>
        <Text style={[styles.categoryName, {color: colors.onSurface}]} numberOfLines={1}>
          {transaction.categoryName || 'Uncategorized'}
        </Text>
        <Text style={[styles.meta, {color: colors.onSurfaceVariant}]} numberOfLines={1}>
          {transaction.paymentMethod}
          {transaction.note ? ` · ${transaction.note}` : ''}
        </Text>
      </View>

      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            {color: isExpense ? colors.error : colors.success},
          ]}>
          {isExpense ? '-' : '+'}
          {formatCurrency(transaction.amount, baseCurrency)}
        </Text>
        <Text style={[styles.date, {color: colors.onSurfaceVariant}]}>
          {new Date(transaction.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          })}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    fontSize: 13,
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
});
