// mobile/components/parent/KidPickerSheet.tsx
import { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Square, CheckSquare2 } from 'lucide-react-native';
import { useTheme, fonts } from '../../lib/theme';
import { t } from '../../lib/i18n';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { KroniText } from '../ui/Text';
import type { LoggableTask, LoggableKid } from '@kroni/shared';

interface KidPickerSheetProps {
  task: LoggableTask | null;
  onClose: () => void;
  onSubmit: (kidIds: string[]) => void;
  isSubmitting: boolean;
}

export function KidPickerSheet({ task, onClose, onSubmit, isSubmitting }: KidPickerSheetProps) {
  const theme = useTheme();
  const tx = theme.text;
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Reset selection when the sheet's task changes (or closes).
  useEffect(() => {
    setSelected(new Set());
  }, [task?.taskId]);

  const eligible = useMemo<LoggableKid[]>(() => task?.eligibleKids ?? [], [task]);

  function toggle(kidId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(kidId)) next.delete(kidId);
      else next.add(kidId);
      return next;
    });
  }

  const count = selected.size;

  return (
    <Sheet visible={task !== null} onClose={onClose}>
      {task ? (
        <View style={styles.content}>
          <KroniText variant="eyebrow" tone="gold">
            {t('parent.tasksList.kidPickerEyebrow')}
          </KroniText>
          <View style={styles.titleRow}>
            <KroniText variant="display" tone="primary" style={styles.title}>
              {t('parent.tasksList.kidPickerTitleA')}{' '}
            </KroniText>
            <KroniText
              variant="displayItalic"
              tone="gold"
              style={[styles.title, { fontFamily: fonts.displayItalic }]}
            >
              {task.title}
            </KroniText>
            <KroniText variant="display" tone="primary" style={styles.title}>
              ?
            </KroniText>
          </View>

          <View style={styles.kidList}>
            {eligible.map((kid) => {
              const isDisabled = kid.alreadyCompletedToday;
              const isChecked = selected.has(kid.kidId);
              return (
                <TouchableOpacity
                  key={kid.kidId}
                  onPress={() => !isDisabled && toggle(kid.kidId)}
                  disabled={isDisabled}
                  accessibilityRole="checkbox"
                  accessibilityState={{ disabled: isDisabled, checked: isChecked }}
                  activeOpacity={isDisabled ? 1 : 0.7}
                  style={[
                    styles.kidRow,
                    {
                      borderColor: isChecked
                        ? theme.colors.gold[500]
                        : theme.surface.border,
                      opacity: isDisabled ? 0.55 : 1,
                    },
                  ]}
                >
                  <Avatar avatarKey={kid.avatarKey ?? 'bear'} size={40} />
                  <KroniText variant="h2" tone="primary" style={{ flex: 1 }}>
                    {kid.name}
                  </KroniText>
                  {isDisabled ? (
                    <Badge label={t('parent.tasksList.alreadyDone')} variant="default" />
                  ) : isChecked ? (
                    <CheckSquare2 size={28} color={theme.colors.gold[500]} strokeWidth={2} />
                  ) : (
                    <Square size={28} color={tx.tertiary} strokeWidth={1.75} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <KroniText variant="caption" tone="secondary" style={styles.note}>
            {t('parent.tasksList.kidPickerNote')}
          </KroniText>

          <Button
            label={t('parent.tasksList.kidPickerCta', { count })}
            onPress={() => onSubmit(Array.from(selected))}
            variant="primary"
            size="sm"
            disabled={count === 0 || isSubmitting}
            loading={isSubmitting}
          />
        </View>
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingBottom: 16 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline' },
  title: { fontSize: 24, lineHeight: 28, letterSpacing: -0.4 },
  kidList: { gap: 10 },
  kidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  note: { marginTop: 4 },
});
