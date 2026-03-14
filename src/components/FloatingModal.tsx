import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../theme';

export interface FloatingModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const FloatingModal: React.FC<FloatingModalProps> = ({
  visible,
  onClose,
  title,
  children,
}) => {
  const theme = useTheme();
  const {colors, typography, spacing, shape, elevation} = theme;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={[styles.backdrop, {backgroundColor: colors.scrim + '66'}]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceContainer,
              borderColor: colors.outlineVariant,
              borderRadius: shape.large,
              marginHorizontal: spacing.xl,
              ...elevation.level3,
            },
          ]}>
          {(title || onClose) && (
            <View
              style={[
                styles.header,
                {
                  borderBottomColor: colors.outlineVariant,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.md,
                },
              ]}>
              <Text style={[typography.titleMedium, {color: colors.onSurface}]}> {title ?? ''}</Text>
              <Pressable onPress={onClose} hitSlop={8}>
                <Icon name="close" size={20} color={colors.onSurfaceVariant} />
              </Pressable>
            </View>
          )}

          <View style={{padding: spacing.lg}}>{children}</View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    maxHeight: '72%',
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
});
