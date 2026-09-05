import { useState } from 'react';
import { StyleSheet } from 'react-native';

import type { HeadsUpParseResult, HeadsUpRequest, HeadsUpResult } from '@/api/client';
import { ActionButton } from '@/components/action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ADJUSTMENT_KIND_LABELS, BALLPARK_AMOUNTS, formatMoney } from '../format';
import { Chip } from './chip';
import { LineInput } from './line-input';

type HeadsUpSectionProps = {
  busy: boolean;
  onParse: (text: string) => Promise<HeadsUpParseResult | null>;
  onApply: (body: HeadsUpRequest) => Promise<HeadsUpResult | null>;
  /** Keeps a line that could not become an adjustment as chat context. */
  onKeepAsContext: (text: string) => Promise<unknown>;
};

type Stage =
  | { step: 'line' }
  | { step: 'box'; text: string; parsed: HeadsUpParseResult }
  | { step: 'context'; text: string }
  | { step: 'reply'; result: HeadsUpResult };

/**
 * "Anything I should know this period?" (cadence note §1 item 4; gameplan
 * note §5a). One line. The app turns it into a proposal; when the proposal
 * is a cost, an income change or a bill change, a small amount box follows
 * — pre-filled from the line when it carried a figure, empty with
 * ballparks when not, skippable. The confirm tap is the only way a number
 * enters the plan, and the reply says what moved.
 */
export function HeadsUpSection({ busy, onParse, onApply, onKeepAsContext }: HeadsUpSectionProps) {
  const theme = useTheme();
  const [text, setText] = useState('');
  const [stage, setStage] = useState<Stage>({ step: 'line' });
  const [amount, setAmount] = useState<string>('');

  async function submitLine() {
    const line = text.trim();
    if (!line) return;

    const parsed = await onParse(line);
    if (!parsed) return;

    if (!parsed.adjustment) {
      // No model host, or the line could not be read: kept as context only —
      // stored and embedded like any other reflection, so chat can see it.
      await onKeepAsContext(line);
      setStage({ step: 'context', text: line });
      setText('');
      return;
    }

    if (parsed.needsAmount) {
      setAmount(parsed.proposedAmount !== null ? String(parsed.proposedAmount) : '');
      setStage({ step: 'box', text: line, parsed });
      return;
    }

    await apply(line, parsed, null);
  }

  async function apply(line: string, parsed: HeadsUpParseResult, confirmed: number | null) {
    const adjustment = parsed.adjustment!;
    const result = await onApply({
      text: line,
      adjustment: {
        kind: adjustment.kind,
        affectedCategory: adjustment.affectedCategory,
        affectedStream: adjustment.affectedStream,
        timing: adjustment.timing,
      },
      amount: confirmed,
    });
    if (result) {
      setStage({ step: 'reply', result });
      setText('');
    }
  }

  if (stage.step === 'reply') {
    return (
      <ThemedView style={styles.section}>
        <ThemedText type="smallBold">Anything I should know this period?</ThemedText>
        <ThemedView style={[styles.reply, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="small">{stage.result.reply}</ThemedText>
        </ThemedView>
        <ActionButton label="Add another" variant="secondary" onPress={() => setStage({ step: 'line' })} />
      </ThemedView>
    );
  }

  if (stage.step === 'context') {
    return (
      <ThemedView style={styles.section}>
        <ThemedText type="smallBold">Anything I should know this period?</ThemedText>
        <ThemedView style={[styles.reply, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="small">
            Noted — kept as context. Nothing in the plan moved.
          </ThemedText>
        </ThemedView>
        <ActionButton label="Add another" variant="secondary" onPress={() => setStage({ step: 'line' })} />
      </ThemedView>
    );
  }

  if (stage.step === 'box') {
    const { parsed } = stage;
    const kindLabel = ADJUSTMENT_KIND_LABELS[parsed.adjustment!.kind] ?? 'a note';
    const parsedAmount = Number(amount.replace(/[^0-9.]/g, ''));
    const valid = Number.isFinite(parsedAmount) && parsedAmount > 0;

    return (
      <ThemedView style={styles.section}>
        <ThemedText type="smallBold">Anything I should know this period?</ThemedText>
        <ThemedView style={[styles.box, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="small" themeColor="textSecondary">
            Sounds like {kindLabel}. {parsed.proposedAmount !== null ? `About ${formatMoney(parsed.proposedAmount)}?` : 'Roughly how much?'}
          </ThemedText>
          <ThemedView style={styles.chips}>
            {BALLPARK_AMOUNTS.map((value) => (
              <Chip
                key={value}
                label={formatMoney(value)}
                selected={parsedAmount === value}
                onPress={() => setAmount(String(value))}
              />
            ))}
          </ThemedView>
          <LineInput
            value={amount}
            onChangeText={setAmount}
            placeholder="Amount"
            keyboardType="numeric"
            editable={!busy}
          />
          <ThemedView style={styles.boxActions}>
            <ActionButton
              label={parsed.proposedAmount !== null && parsedAmount === parsed.proposedAmount ? 'Confirm' : 'Use this amount'}
              variant="primary"
              busy={busy}
              disabled={!valid}
              onPress={() => void apply(stage.text, parsed, valid ? parsedAmount : null)}
            />
            <ActionButton
              label="Skip"
              variant="secondary"
              busy={busy}
              onPress={() => void apply(stage.text, parsed, null)}
            />
          </ThemedView>
          <ThemedText type="small" themeColor="textSecondary">
            Skipping keeps the note as context; nothing in the plan moves.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.section}>
      <ThemedText type="smallBold">Anything I should know this period?</ThemedText>
      <LineInput
        value={text}
        onChangeText={setText}
        placeholder="Car repair, about $400 · my sister's visiting · a lot of bills land this week"
        editable={!busy}
        onSubmitEditing={() => void submitLine()}
        returnKeyType="send"
      />
      <ThemedView style={styles.lineActions}>
        <ActionButton label="Tell FinBot" variant="secondary" busy={busy} disabled={!text.trim()} onPress={() => void submitLine()} />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  lineActions: {
    alignSelf: 'flex-start',
  },
  box: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  boxActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  reply: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
  },
});
