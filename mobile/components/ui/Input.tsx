import { useState } from 'react';
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { colors, fonts } from '../../lib/theme';

interface InputProps extends TextInputProps {
  className?: string;
}

export function Input({ style, className, onFocus, onBlur, ...rest }: InputProps) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
  const [focused, setFocused] = useState(false);

  // Focus state mirrors the website's accent ring: 2px gold-500 around an
  // otherwise editorial sand-50 surface with sand-200 hairline.
  const borderColor = focused
    ? colors.gold[500]
    : isDark
      ? '#2A3040'
      : colors.sand[200];
  const borderWidth = focused ? 2 : 1;

  return (
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor: isDark ? colors.ink[800] : colors.sand[50],
          borderColor,
          borderWidth,
          color: isDark ? '#F5F5F0' : colors.sand[900],
          // Compensate for the 1→2 px border swap so the input doesn't jump.
          paddingHorizontal: focused ? 15 : 16,
          paddingVertical: focused ? 13 : 14,
        },
        style,
      ]}
      placeholderTextColor={isDark ? '#6E7682' : colors.sand[500]}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      className={className}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 52,
    borderRadius: 12,
    fontSize: 18,
    fontFamily: fonts.ui,
  },
});
