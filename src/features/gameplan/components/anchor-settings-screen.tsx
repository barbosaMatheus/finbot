/**
 * Anchor settings (cadence note §2): payday when a stable paycheck is
 * detected, otherwise a day the user sets, Sunday by default. Changes take
 * effect from the next period, never the one under way.
 */

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { getAnchorSettings, updateAnchorSettings, type AnchorSettings } from '@/api/client';
import { ActionButton } from '@/components/action-button';
import { RouteShell } from '@/components/route-shell';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/lib/api-client';

import { WEEKDAY_LABELS } from '../format';
import { Chip } from './chip';

const MODES: { value: AnchorSettings['anchorMode']; label: string; hint: string }[] = [
  { value: 'auto', label: 'Let FinBot decide', hint: 'Payday when a regular paycheck is detected, otherwise a day you set.' },
  { value: 'payday', label: 'On payday', hint: 'Needs a regular paycheck FinBot can see.' },
  { value: 'fixed_day', label: 'A day I pick', hint: 'The same day every week.' },
];

const TIMES: { value: AnchorSettings['anchorTimeOfDay']; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'midday', label: 'Midday' },
  { value: 'evening', label: 'Evening' },
];

export function AnchorSettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [settings, setSettings] = useState<AnchorSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getAnchorSettings()
      .then((result) => setSettings(result.settings))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load settings'));
  }, []);

  async function save(patch: Partial<AnchorSettings>) {
    if (!settings) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const result = await updateAnchorSettings(patch);
      setSettings(result.settings);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That change did not save');
    } finally {
      setBusy(false);
    }
  }

  return (
    <RouteShell>
      <ThemedView style={styles.content}>
        <Pressable
          accessibilityLabel="Back"
          accessibilityRole="button"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/account' as never))}
          style={({ pressed }) => [styles.back, { opacity: pressed ? 0.7 : 1 }]}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Back
          </ThemedText>
        </Pressable>

        <ThemedText type="subtitle" style={styles.title}>
          When your plan arrives
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Changes take effect from the next period.
        </ThemedText>

        {!settings ? (
          error ? (
            <ThemedText type="small" style={styles.error}>
              {error}
            </ThemedText>
          ) : (
            <ActivityIndicator color={theme.text} />
          )
        ) : (
          <>
            <ThemedView style={styles.group}>
              <ThemedText type="smallBold">Anchor</ThemedText>
              {MODES.map((mode) => (
                <Pressable
                  key={mode.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: settings.anchorMode === mode.value }}
                  disabled={busy}
                  onPress={() => void save({ anchorMode: mode.value })}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: theme.backgroundElement,
                      borderColor: settings.anchorMode === mode.value ? '#1B7F4E' : theme.backgroundSelected,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}>
                  <ThemedText type="smallBold">{mode.label}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {mode.hint}
                  </ThemedText>
                </Pressable>
              ))}
            </ThemedView>

            <ThemedView style={styles.group}>
              <ThemedText type="smallBold">Day</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Used when the anchor is not payday.
              </ThemedText>
              <ThemedView style={styles.chips}>
                {WEEKDAY_LABELS.map((label, day) => (
                  <Chip
                    key={label}
                    label={label}
                    selected={settings.anchorDay === day}
                    disabled={busy}
                    onPress={() => void save({ anchorDay: day })}
                  />
                ))}
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.group}>
              <ThemedText type="smallBold">Time of day</ThemedText>
              <ThemedView style={styles.chips}>
                {TIMES.map((time) => (
                  <Chip
                    key={time.value}
                    label={time.label}
                    selected={settings.anchorTimeOfDay === time.value}
                    disabled={busy}
                    onPress={() => void save({ anchorTimeOfDay: time.value })}
                  />
                ))}
              </ThemedView>
            </ThemedView>

            {saved ? (
              <ThemedText type="small" themeColor="textSecondary">
                Saved. It applies from the next period.
              </ThemedText>
            ) : null}
            {error ? (
              <ThemedText type="small" style={styles.error}>
                {error}
              </ThemedText>
            ) : null}

            <ActionButton label="Done" variant="secondary" onPress={() => (router.canGoBack() ? router.back() : router.replace('/account' as never))} />
          </>
        )}
      </ThemedView>
    </RouteShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.two,
    minHeight: 32,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
  },
  group: {
    gap: Spacing.two,
  },
  option: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  error: {
    color: '#e5484d',
  },
});
