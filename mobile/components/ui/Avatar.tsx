// [REVIEW] Avatar icons are lucide placeholders — replace with proper SVG assets per avatar key.
// Keys must stay in sync with @kroni/shared's AvatarKey enum
// (fox, bear, rabbit, owl, penguin, lion, panda, cat, dog, unicorn, dragon, astronaut).
import { View, StyleSheet } from 'react-native';
import {
  Squirrel,
  PawPrint,
  Rabbit,
  Bird,
  Snowflake,
  Crown,
  Smile,
  Cat,
  Dog,
  Sparkles,
  Flame,
  Rocket,
  Bot,
} from 'lucide-react-native';
import { colors } from '../../lib/theme';

const AVATAR_MAP = {
  fox: Squirrel,
  bear: PawPrint,
  rabbit: Rabbit,
  owl: Bird,
  penguin: Snowflake,
  lion: Crown,
  panda: Smile,
  cat: Cat,
  dog: Dog,
  unicorn: Sparkles,
  dragon: Flame,
  astronaut: Rocket,
} as const;

export type AvatarKey = keyof typeof AVATAR_MAP;

interface AvatarProps {
  avatarKey: AvatarKey | string;
  size?: number;
}

export function Avatar({ avatarKey, size = 48 }: AvatarProps) {
  const IconComponent = AVATAR_MAP[avatarKey as AvatarKey] ?? Bot;
  const iconSize = Math.round(size * 0.55);
  const bg = colors.gold[100];

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
      ]}
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
