import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useReducedMotion,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../../lib/theme';

interface SpinnerProps {
  size?: number;
  color?: string;
}

export function Spinner({ size = 24, color = colors.gold[500] }: SpinnerProps) {
  const rotation = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    rotation.value = withRepeat(
      withTiming(360, { duration: 800, easing: Easing.linear }),
      -1,
      false,
    );
  }, [rotation, reduceMotion]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: Math.max(2, size / 10),
            borderColor: color + '33',
            borderTopColor: color,
          }}
        />
      </Animated.View>
    </View>
  );
}
