import { View, Text, StyleSheet } from 'react-native';
import { Modal } from './Modal';
import { Button } from './Button';
import { useTheme, fonts } from '../../lib/theme';
import { t } from '../../lib/i18n';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive,
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const theme = useTheme();
  const tx = theme.text;

  return (
    <Modal visible={visible} onClose={onCancel}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: tx.primary }]}>{title}</Text>
        {message ? (
          <Text style={[styles.message, { color: tx.secondary }]}>{message}</Text>
        ) : null}
        <View style={styles.actions}>
          <Button
            label={cancelLabel ?? t('common.cancel')}
            onPress={onCancel}
            variant="secondary"
            size="sm"
          />
          <Button
            label={confirmLabel}
            onPress={onConfirm}
            variant={destructive ? 'danger' : 'primary'}
            size="sm"
            loading={loading}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  message: { fontSize: 15, lineHeight: 22 },
  actions: { gap: 10, marginTop: 8 },
});
