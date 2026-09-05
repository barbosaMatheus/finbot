import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import type { AnchorTarget } from '@/api/client';
import { ActionButton } from '@/components/action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { targetTitle } from '../format';
import { Chip } from './chip';

type SwapSectionProps = {
  targets: AnchorTarget[];
  alternates: AnchorTarget[];
  busy: boolean;
  onSwap: (outId: string, inId: string) => Promise<unknown>;
};

/**
 * "Not these? Swap one." (cadence note §5): the alternates stay collapsed;
 * the user picks one alternate and one target to give up. Bill readiness
 * cannot be swapped out — it is always in the plan when a bill is due.
 */
export function SwapSection({ targets, alternates, busy, onSwap }: SwapSectionProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [inId, setInId] = useState<string | null>(null);
  const [outId, setOutId] = useState<string | null>(null);

  const swappable = targets.filter((target) => target.definition.type !== 'bill_readiness');

  if (alternates.length === 0 || swappable.length === 0) return null;

  return (
    <ThemedView style={styles.section}>
      <Pressable
        accessibilityRole="button"
        aria-expanded={open}
        onPress={() => setOpen((value) => !value)}
        style={({ pressed }) => [styles.toggle, { opacity: pressed ? 0.7 : 1 }]}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          {open ? 'Keep these' : 'Not these? Swap one.'}
        </ThemedText>
      </Pressable>

      {open ? (
        <ThemedView style={[styles.panel, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="small" themeColor="textSecondary">
            Swap in
          </ThemedText>
          <ThemedView style={styles.chips}>
            {alternates.map((alternate) => (
              <Chip
                key={alternate.id}
                label={targetTitle(alternate.definition)}
                selected={inId === alternate.id}
                onPress={() => setInId(alternate.id)}
              />
            ))}
          </ThemedView>

          <ThemedText type="small" themeColor="textSecondary">
            instead of
          </ThemedText>
          <ThemedView style={styles.chips}>
            {swappable.map((target) => (
              <Chip
                key={target.id}
                label={targetTitle(target.definition)}
                selected={outId === target.id}
                onPress={() => setOutId(target.id)}
              />
            ))}
          </ThemedView>

          <ThemedView style={styles.actions}>
            <ActionButton
              label="Swap"
              variant="primary"
              busy={busy}
              disabled={!inId || !outId}
              onPress={() => {
                if (inId && outId) void onSwap(outId, inId);
              }}
            />
          </ThemedView>
          <ThemedText type="small" themeColor="textSecondary">
            One swap per period. Every option came from the same numbers, so any combination works.
          </ThemedText>
        </ThemedView>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  toggle: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.one,
  },
  panel: {
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
  actions: {
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
  },
});
