// Avatar = emoji on a gold-100 disc. Keys must stay in sync with
// @kroni/shared's AvatarKey enum.
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../lib/theme';

const AVATAR_MAP = {
  fox: '🦊',
  bear: '🐻',
  rabbit: '🐰',
  owl: '🦉',
  penguin: '🐧',
  lion: '🦁',
  panda: '🐼',
  cat: '🐱',
  dog: '🐶',
  unicorn: '🦄',
  dragon: '🐲',
  astronaut: '🧑‍🚀',
} as const;

export type AvatarKey = keyof typeof AVATAR_MAP;

interface AvatarProps {
  avatarKey: AvatarKey | string;
  size?: number;
}

export function Avatar({ avatarKey, size = 48 }: AvatarProps) {
  const emoji = AVATAR_MAP[avatarKey as AvatarKey] ?? '🙂';
  const fontSize = Math.round(size * 0.6);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.gold[100],
        },
      ]}
    >
      <Text style={{ fontSize, lineHeight: fontSize * 1.1 }}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
