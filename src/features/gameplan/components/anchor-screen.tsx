/**
 * The anchor (cadence note §1): one screen, top to bottom — the last
 * period's grade with positives first, "what got in the way?" only after a
 * miss, this period's three targets with a why line each, the alternates
 * collapsed with one swap, the heads-up line with its conditional amount
 * box, and "Got it". Not a chat. Nothing here lets the user write a target.
 */

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { formatPeriod, freeCashLine } from '../format';
import { useAnchor } from '../hooks/use-anchor';
import { GradeSection } from './grade-section';
import { HeadsUpSection } from './heads-up-section';
import { LineInput } from './line-input';
import { SwapSection } from './swap-section';
import { TargetCard } from './target-card';

export function AnchorScreen() {
  const theme = useTheme();
  const router = useRouter();
  const controller = useAnchor();
  const { anchor, isLoading, loadError, actionError, busy } = controller;
  const [hardText, setHardText] = useState('');
  const [hardSent, setHardSent] = useState(false);

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={theme.text} />
      </ThemedView>
    );
  }

  if (loadError || !anchor) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText themeColor="textSecondary" style={styles.centeredText}>
          {loadError ?? 'Your plan is not available yet.'}
        </ThemedText>
        <ActionButton label="Try again" variant="secondary" onPress={() => void controller.reload()} />
      </ThemedView>
    );
  }

  if (anchor.status === 'no_period') {
    return (
      <ThemedView style={styles.center}>
        <ThemedText type="smallBold">No plan yet</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.centeredText}>
          Your first plan opens once your financial review is confirmed. It is usually ready within a
          few minutes.
        </ThemedText>
        <ActionButton label="Check again" variant="secondary" onPress={() => void controller.reload()} />
      </ThemedView>
    );
  }

  if (anchor.status === 'building' || !anchor.plan || !anchor.period) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={theme.text} />
        <ThemedText themeColor="textSecondary" style={styles.centeredText}>
          Building your plan for {anchor.period ? formatPeriod(anchor.period.start, anchor.period.end) : 'this period'}…
        </ThemedText>
      </ThemedView>
    );
  }

  const { period, plan, previousGrade } = anchor;
  const isOpen = period.status === 'open';
  const awareness = plan.targets.find((target) => target.definition.type === 'awareness');

  async function sendHard() {
    const line = hardText.trim();
    if (!line) return;
    const result = await controller.reflect({ kind: 'whats_been_hard', text: line });
    if (result) {
      setHardSent(true);
      setHardText('');
    }
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.content}>
        <Pressable
          accessibilityLabel="Back"
          accessibilityRole="button"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(app)' as never))}
          style={({ pressed }) => [styles.back, { opacity: pressed ? 0.7 : 1 }]}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Back
          </ThemedText>
        </Pressable>

        <ThemedView style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            {anchor.reengage ? 'Want to slow down?' : 'Your plan'}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {formatPeriod(period.start, period.end)}
            {period.trigger === 'payday' ? ' · started with your paycheck' : period.trigger === 'first' ? ' · your first period' : ''}
          </ThemedText>
        </ThemedView>

        {anchor.reengage ? (
          <ThemedView style={[styles.banner, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="small">
              The last two plans went unread. That is fine. If the pace is too much, say so in chat and
              it changes; and if you want, tell us what has been hard.
            </ThemedText>
            {hardSent ? (
              <ThemedText type="small" themeColor="textSecondary">
                Noted. FinBot will keep it in mind when you talk.
              </ThemedText>
            ) : (
              <>
                <LineInput
                  value={hardText}
                  onChangeText={setHardText}
                  placeholder="What has been hard?"
                  editable={busy === null}
                  onSubmitEditing={() => void sendHard()}
                  returnKeyType="send"
                />
                <ThemedView style={styles.inlineActions}>
                  <ActionButton label="Send" variant="secondary" busy={busy === 'reflection'} disabled={!hardText.trim()} onPress={() => void sendHard()} />
                  <ActionButton label="Open chat" variant="secondary" onPress={() => router.push('/(app)/chat' as never)} />
                </ThemedView>
              </>
            )}
          </ThemedView>
        ) : null}

        {previousGrade ? (
          <GradeSection
            grade={previousGrade}
            busy={busy === 'reflection'}
            onReflect={(text) => controller.reflect({ kind: 'got_in_the_way', text })}
          />
        ) : null}

        <ThemedView style={styles.section}>
          <ThemedText type="smallBold">This period</ThemedText>
          {plan.targets.map((target, index) => (
            <TargetCard
              key={target.id}
              target={target}
              index={index}
              awarenessDone={period.awarenessCompletedAt !== null}
              busy={busy === 'awareness'}
              onAwarenessDone={awareness && target.id === awareness.id ? () => void controller.markAwarenessDone() : undefined}
            />
          ))}
          <ThemedText type="small" themeColor="textSecondary">
            {freeCashLine(plan.live?.freeCash ?? plan.freeCash.freeCash, plan.freeCash.tight)}
            {plan.live && plan.live.postedBills > 0 ? ` · ${plan.live.postedBills} bill${plan.live.postedBills === 1 ? '' : 's'} posted so far` : ''}
          </ThemedText>
        </ThemedView>

        {!plan.swapUsed ? (
          <SwapSection
            targets={plan.targets}
            alternates={plan.alternates}
            busy={busy === 'swap'}
            onSwap={(outId, inId) => controller.swap(outId, inId)}
          />
        ) : null}

        <HeadsUpSection
          busy={busy === 'parse' || busy === 'heads-up' || busy === 'reflection'}
          onParse={(text) => controller.parse(text)}
          onApply={(body) => controller.apply(body)}
          onKeepAsContext={(text) => controller.reflect({ kind: 'heads_up', text })}
        />

        {actionError ? (
          <ThemedText type="small" style={styles.error}>
            {actionError}
          </ThemedText>
        ) : null}

        <ThemedView style={styles.confirmBlock}>
          {isOpen ? (
            <>
              <ThemedText type="small" themeColor="textSecondary">
                Period open. Come back at the next anchor for the grade.
              </ThemedText>
              <ActionButton label="Back to home" variant="secondary" onPress={() => router.replace('/(app)' as never)} />
            </>
          ) : (
            <ActionButton label="Got it" variant="primary" busy={busy === 'got-it'} onPress={() => void controller.acknowledge()} />
          )}
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  centeredText: {
    textAlign: 'center',
    maxWidth: 420,
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.two,
    minHeight: 32,
  },
  header: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
  },
  banner: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  inlineActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  section: {
    gap: Spacing.two,
  },
  error: {
    color: '#e5484d',
  },
  confirmBlock: {
    gap: Spacing.two,
  },
});
