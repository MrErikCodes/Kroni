import { TextInput, TextInputProps, StyleSheet, useColorScheme } from 'react-native';
import { colors } from '../../lib/theme';

interface InputProps extends TextInputProps {
  className?: string;
}

export function Input({ style, className, ...rest }: InputProps) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';

  return (
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor: isDark ? colors.ink[800] : colors.sand[50],
          borderColor: isDark ? '#2A3040' : colors.sand[200],
          color: isDark ? '#F5F5F0' : colors.sand[900],
        },
        style,
      ]}
      placeholderTextColor={isDark ? '#9AA0AA' : colors.sand[500]}
      className={className}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});
