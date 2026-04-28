import {
  Modal as RNModal,
  View,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ModalProps as RNModalProps,
} from 'react-native';
import { colors } from '../../lib/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ visible, onClose, children, className }: ModalProps) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.container,
            { backgroundColor: isDark ? colors.ink[800] : '#FFFFFF' },
          ]}
          className={className}
        >
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
});
