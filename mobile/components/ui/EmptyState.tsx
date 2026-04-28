import { View, StyleSheet, useColorScheme } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { Button } from './Button';
import { KroniText } from './Text';
import { colors, fonts } from '../../lib/theme';

interface EmptyStateProps {
  /** Optional — for screens that already lean on a specific lucide glyph.
   *  When omitted, an editorial Newsreader em-dash stands in for the icon
   *  and the empty state reads as a quiet beat in the page rather than a
   *  cheerful illustration. */
  icon?: LucideIcon;
  title: string;
  body?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  ctaLabel,
  onCta,
}: EmptyStateProps) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';

  return (
    <View style={styles.container}>
      {Icon ? (
        <View style={[styles.iconWrap, { borderColor: isDark ? '#2A3040' : colors.sand[200] }]}>
          <Icon
            size={28}
            color={isDark ? '#9AA0AA' : colors.sand[500]}
            strokeWidth={1.75}
          />
        </View>
      ) : (
        // Editorial em-dash glyph in Newsreader — quiet, magazine-feeling
        // signal that the surface is empty by design, not by error.
        <KroniText
          variant="displayLarge"
          tone="secondary"
          style={styles.glyph}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          —
        </KroniText>
      )}
      <KroniText variant="display" tone="primary" style={styles.title}>
        {title}
      </KroniText>
      {body ? (
        <KroniText variant="body" tone="secondary" style={styles.body}>
          {body}
        </KroniText>
      ) : null}
      {ctaLabel && onCta ? (
        <View style={styles.cta}>
          <Button label={ctaLabel} onPress={onCta} variant="primary" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 56,
    paddingHorizontal: 32,
    gap: 8,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  glyph: {
    fontFamily: fonts.display,
    fontSize: 56,
    lineHeight: 56,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    lineHeight: 30,
    textAlign: 'center',
    marginBottom: 4,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 320,
  },
  cta: {
    marginTop: 20,
  },
});
