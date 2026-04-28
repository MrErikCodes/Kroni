import { Text, TextProps, useColorScheme } from 'react-native';
import { colors } from '../../lib/theme';

interface LabelProps extends TextProps {
  className?: string;
}

export function Label({ style, children, className, ...rest }: LabelProps) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';

  return (
    <Text
      style={[
        {
          fontSize: 14,
          fontWeight: '500',
          color: isDark ? '#F5F5F0' : colors.sand[900],
          marginBottom: 6,
        },
        style,
      ]}
      className={className}
      {...rest}
    >
      {children}
    </Text>
  );
}
