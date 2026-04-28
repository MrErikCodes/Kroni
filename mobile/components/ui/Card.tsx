import { View, ViewProps, useColorScheme } from 'react-native';
import { colors } from '../../lib/theme';

interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ style, children, className, ...rest }: CardProps) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';

  return (
    <View
      style={[
        {
          backgroundColor: isDark ? colors.ink[800] : '#FFFFFF',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? '#2A3040' : colors.sand[200],
          overflow: 'hidden',
        },
        style,
      ]}
      className={className}
      {...rest}
    >
      {children}
    </View>
  );
}
