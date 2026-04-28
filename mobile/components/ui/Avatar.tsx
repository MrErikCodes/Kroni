// [REVIEW] Avatar icons are lucide placeholders — replace with proper SVG assets per avatar key
import { View, Text, StyleSheet } from 'react-native';
import {
  Squirrel, Bot, Rabbit, Cat, Dog, Bird,
  Fish, Turtle, Bug, Star, Moon, Sun,
} from 'lucide-react-native';
import { colors } from '../../lib/theme';

// 12 avatar keys mapped to lucide icon placeholders
const AVATAR_MAP = {
  fox:      Squirrel,
  bear:     Bot,
  rabbit:   Rabbit,
  cat:      Cat,
  dog:      Dog,
  bird:     Bird,
  fish:     Fish,
  turtle:   Turtle,
  bug:      Bug,
  star:     Star,
  moon:     Moon,
  sun:      Sun,
} as const;

export type AvatarKey = keyof typeof AVATAR_MAP;

interface AvatarProps {
  avatarKey: AvatarKey | string;
  size?: number;
  className?: string;
}

export function Avatar({ avatarKey, size = 48, className }: AvatarProps) {
  const IconComponent = AVATAR_MAP[avatarKey as AvatarKey] ?? Bot;
  const iconSize = Math.round(size * 0.55);
  const bg = colors.gold[100];

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
      ]}
      className={className}
    >
      <IconComponent size={iconSize} color={colors.gold[700]} strokeWidth={2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
