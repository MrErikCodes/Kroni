import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useReducedMotion,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../../lib/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  /** 0 to 1 */
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  /** VoiceOver label describing what's being measured. */
  accessibilityLabel?: string;
}

export function ProgressRing({
  value,
  size = 64,
  strokeWidth = 6,
  color = colors.gold[500],
  accessibilityLabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const reduceMotion = useReducedMotion();
  const clamped = Math.min(Math.max(value, 0), 1);
  const progress = useSharedValue(reduceMotion ? clamped : 0);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = clamped;
      return;
    }
    progress.value = withTiming(clamped, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, progress, reduceMotion]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ now: Math.round(clamped * 100), min: 0, max: 100 }}
    >
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color + '33'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeLinecap="round"
          animatedProps={animatedProps}
        />
      </Svg>
    </View>
  );
}
