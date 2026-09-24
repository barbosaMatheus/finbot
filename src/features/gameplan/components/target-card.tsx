import { StyleSheet } from 'react-native';

import type { AnchorTarget } from '@/api/client';
import { ActionButton } from '@/components/action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { targetTitle } from '../format';

type TargetCardProps = {
  target: AnchorTarget;
  index?: number;
  /** For the awareness target: mark it done. */
  onAwarenessDone?: () => void;
  awarenessDone?: boolean;
  busy?: boolean;
};

/** One target: what it asks, and the one-line why beneath it. */
export function TargetCard({ target, index, onAwarenessDone, awarenessDone, busy }: TargetCardProps) {
  const theme = useTheme();
  const isAwareness = target.definition.type === 'awareness';

  return (
    <ThemedView
      accessibilityLabel={`Target: ${targetTitle(target.definition)}`}
      style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <ThemedView style={styles.titleRow}>
        {index !== undefined ? (
          <ThemedText type="smallBold" themeColor="textSecondary">
            {index + 1}
          </ThemedText>
        ) : null}
        <ThemedText type="smallBold" style={styles.title}>
          {targetTitle(target.definition)}
        </ThemedText>
      </ThemedView>

      {target.why ? (
        <ThemedText type="small" themeColor="textSecondary">
          {target.why}
        </ThemedText>
      ) : null}

      {isAwareness && onAwarenessDone ? (
        awarenessDone ? (
          <ThemedText type="small" themeColor="textSecondary">
            ✓ Done
          </ThemedText>
        ) : (
          <ThemedView style={styles.actions}>
            <ActionButton label="Done" variant="secondary" busy={busy} onPress={onAwarenessDone} />
          </ThemedView>
        )
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  titleRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
  },
  title: {
    flex: 1,
  },
  actions: {
    marginTop: Spacing.two,
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
  },
});
