// [REVIEW] Norwegian copy — verify with native speaker
import { useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme, fonts } from '../../lib/theme';
import { t } from '../../lib/i18n';
import { KroniText } from '../../components/ui/Text';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const formatNok = (ore: number) =>
  new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0,
  }).format(ore / 100);

interface ParticleProps {
  x: number;
  delay: number;
  color: string;
  size: number;
  shape: 'circle' | 'square';
}

function ConfettiParticle({ x, delay, color, size, shape }: ParticleProps) {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_HEIGHT + 40, {
        duration: 2200 + Math.random() * 1000,
        easing: Easing.in(Easing.quad),
      }),
    );
    // Toned-down lateral drift (~15% off the original) — keeps the rhythm.
    translateX.value = withDelay(
      delay,
      withSequence(
        withTiming((Math.random() - 0.5) * 100, { duration: 600 }),
        withTiming((Math.random() - 0.5) * 70, { duration: 600 }),
        withTiming((Math.random() - 0.5) * 85, { duration: 600 }),
      ),
    );
    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, { duration: 600 + Math.random() * 400, easing: Easing.linear }),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(delay + 1800, withTiming(0, { duration: 500 }));
  }, [delay, opacity, rotate, translateX, translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          top: 0,
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: shape === 'circle' ? size / 2 : 2,
        },
        style,
      ]}
    />
  );
}

// Restrained palette — gold + sand instead of the rainbow set, to match the
// website's palette discipline.
const CONFETTI_COLORS = ['#F5B015', '#FFD263', '#B8800A', '#FFEFC2', '#FBFAF6'];

function generateParticles(count: number): ParticleProps[] {
  return Array.from({ length: count }, (_, i) => ({
    x: Math.random() * SCREEN_WIDTH,
    delay: Math.random() * 600,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length] ?? '#F5B015',
    size: 7 + Math.random() * 9,
    shape: Math.random() > 0.5 ? 'circle' : 'square',
  }));
}

const PARTICLES = generateParticles(26);

export default function CelebrateScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { amountCents } = useLocalSearchParams<{ amountCents: string }>();
  const amount = parseInt(amountCents ?? '0', 10);

  // Coin bounce animation — toned down ~15% on displacement.
  const coinScale = useSharedValue(0);
  const coinBounce = useSharedValue(1);

  // Title slide up
  const titleY = useSharedValue(40);
  const titleOpacity = useSharedValue(0);

  useEffect(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    coinScale.value = withSpring(1, { damping: 7, stiffness: 120 });
    coinBounce.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withSpring(1.1, { damping: 6, stiffness: 200 }),
          withSpring(1.0, { damping: 8, stiffness: 200 }),
        ),
        3,
        false,
      ),
    );

    titleY.value = withDelay(300, withSpring(0, { damping: 12 }));
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));

    void queryClient.invalidateQueries({ queryKey: ['kid', 'balance'] });
  }, [coinBounce, coinScale, queryClient, titleOpacity, titleY]);

  const coinStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coinScale.value * coinBounce.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
    opacity: titleOpacity.value,
  }));

  const handleDismiss = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(kid)/(tabs)/today');
    }
  }, [router]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.ink[900] }]}
    >
      {/* Confetti */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {PARTICLES.map((p, i) => (
          <ConfettiParticle key={i} {...p} />
        ))}
      </View>

      <View style={styles.content}>
        <Animated.Text style={[styles.coin, coinStyle]}>🪙</Animated.Text>

        <Animated.View style={[titleStyle, styles.titleBlock]}>
          {/* "Bra jobba!" — full italic, the visual signature of the moment. */}
          <KroniText
            variant="displayItalic"
            tone="inverse"
            style={styles.title}
          >
            {t('kid.celebrate.title')}
          </KroniText>
          <KroniText variant="bodyLarge" tone="inverse" style={styles.youGot}>
            {t('kid.celebrate.youGot')}
          </KroniText>
          <KroniText
            variant="display"
            style={[styles.amount, { color: theme.colors.gold[300] }]}
          >
            +{formatNok(amount)}
          </KroniText>
        </Animated.View>

        <TouchableOpacity
          onPress={handleDismiss}
          style={[styles.dismissBtn, { backgroundColor: theme.colors.gold[500] }]}
          accessibilityRole="button"
          accessibilityLabel={t('kid.celebrate.dismiss')}
          activeOpacity={0.85}
        >
          <KroniText
            variant="h2"
            style={[styles.dismissLabel, { color: theme.colors.sand[900] }]}
          >
            {t('kid.celebrate.dismiss')}
          </KroniText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 18,
  },
  coin: { fontSize: 96 },
  titleBlock: { alignItems: 'center', gap: 6 },
  title: {
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -1.4,
    textAlign: 'center',
    fontFamily: fonts.displayItalic,
  },
  youGot: {
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 8,
  },
  amount: {
    fontSize: 48,
    lineHeight: 54,
    letterSpacing: -1.0,
    textAlign: 'center',
    marginTop: 4,
  },
  dismissBtn: {
    marginTop: 32,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 999,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissLabel: {
    letterSpacing: -0.2,
  },
});
