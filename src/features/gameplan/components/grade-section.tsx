import { useState } from 'react';
import { StyleSheet } from 'react-native';

import type { AnchorGrade, ReflectionResult } from '@/api/client';
import { ActionButton } from '@/components/action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { OUTCOME_COLORS, OUTCOME_LABELS, formatMoney, formatPeriod, formatShortDate, targetTitle } from '../format';
import { LineInput } from './line-input';

type GradeSectionProps = {
  grade: AnchorGrade;
  busy: boolean;
  onReflect: (text: string) => Promise<ReflectionResult | null>;
};

/**
 * How the last period went (cadence note §4): positives first — the API
 * already orders results met → close → missed — then the improvements
 * line, then "what got in the way?" only when something was missed.
 */
export function GradeSection({ grade, busy, onReflect }: GradeSectionProps) {
  const theme = useTheme();
  const [text, setText] = useState('');
  const [reflection, setReflection] = useState<ReflectionResult | null>(null);

  const missed = grade.results.some((result) => result.outcome === 'missed');

  async function submit() {
    const line = text.trim();
    if (!line) return;
    const result = await onReflect(line);
    if (result) {
      setReflection(result);
      setText('');
    }
  }

  return (
    <ThemedView style={styles.section}>
      <ThemedText type="smallBold">How {formatPeriod(grade.period.start, grade.period.end)} went</ThemedText>

      {grade.results.map((result, index) => {
        const colors = OUTCOME_COLORS[result.outcome];
        return (
          <ThemedView
            key={`${result.target.type}-${index}`}
            accessibilityLabel={`${targetTitle(result.target)}: ${OUTCOME_LABELS[result.outcome]}`}
            style={[styles.result, { backgroundColor: theme.backgroundElement }]}>
            <ThemedView style={styles.resultHeader}>
              <ThemedText type="smallBold" style={styles.resultTitle}>
                {targetTitle(result.target)}
              </ThemedText>
              <ThemedView style={[styles.pill, { backgroundColor: colors.background }]}>
                <ThemedText type="small" style={{ color: colors.text }}>
                  {OUTCOME_LABELS[result.outcome]}
                </ThemedText>
              </ThemedView>
            </ThemedView>
            {grade.lines[index] ? (
              <ThemedText type="small" themeColor="textSecondary">
                {grade.lines[index]}
              </ThemedText>
            ) : null}
          </ThemedView>
        );
      })}

      {grade.improvements ? (
        <ThemedText type="small" themeColor="textSecondary">
          {grade.improvements}
        </ThemedText>
      ) : null}

      {missed ? (
        <ThemedView style={styles.reflect}>
          <ThemedText type="smallBold">What got in the way?</ThemedText>
          {reflection ? (
            <ThemedText type="small" themeColor="textSecondary">
              {reflection.attributed
                ? `Noted. ${reflection.attributed.category} was ${formatMoney(reflection.attributed.amount)} of the ${formatMoney(reflection.attributed.periodAmount)} between ${formatShortDate(reflection.attributed.start)} and ${formatShortDate(reflection.attributed.end)}. A one-off like that brings the cap back at its usual level next period.`
                : 'Noted. Nothing specific was named, so the next cap starts from what was actually spent, so it is reachable.'}
            </ThemedText>
          ) : (
            <>
              <LineInput
                value={text}
                onChangeText={setText}
                placeholder="A busy week, a visit, a repair…"
                editable={!busy}
                onSubmitEditing={() => void submit()}
                returnKeyType="send"
              />
              <ThemedView style={styles.reflectActions}>
                <ActionButton label="Send" variant="secondary" busy={busy} disabled={!text.trim()} onPress={() => void submit()} />
              </ThemedView>
            </>
          )}
        </ThemedView>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  result: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  resultTitle: {
    flex: 1,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
  reflect: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  reflectActions: {
    alignSelf: 'flex-start',
  },
});
