import { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type AccessibilityActionEvent,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { COACHING_PACE_OPTIONS } from '@/features/onboarding/constants/options';
import type { CoachingPace } from '@/features/onboarding/types/onboarding';
import { useTheme } from '@/hooks/use-theme';

const SELECTED_GREEN = '#1B7F4E';
const THUMB_SIZE = 28;
const TRACK_HEIGHT = 6;
const TICK_SIZE = 10;

const STOPS: CoachingPace[] = COACHING_PACE_OPTIONS.map((option) => option.value);

type PaceSliderProps = {
  value: CoachingPace;
  onChange: (pace: CoachingPace) => void;
};

/**
 * A drag-or-tap slider over the three coaching paces. Dependency-free: the
 * View's own responder props handle mouse and touch on web and native
 * alike. The thumb snaps to the nearest stop so the stored value stays one
 * of the three paces the gameplan design scales from.
 */
export function PaceSlider({ value, onChange }: PaceSliderProps) {
  const theme = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);

  // Screen x of the track's left edge, captured when a drag starts so moves
  // can be measured even after the pointer leaves the track's bounds.
  const originXRef = useRef(0);

  const index = Math.max(0, STOPS.indexOf(value));
  const usable = Math.max(trackWidth - THUMB_SIZE, 0);
  const thumbLeft = (index / (STOPS.length - 1)) * usable;
  const selected = COACHING_PACE_OPTIONS[index];

  function stopForX(x: number): CoachingPace {
    if (usable <= 0) {
      return value;
    }

    const ratio = Math.min(Math.max((x - THUMB_SIZE / 2) / usable, 0), 1);
    return STOPS[Math.round(ratio * (STOPS.length - 1))];
  }

  function select(x: number): void {
    const next = stopForX(x);

    if (next !== value) {
      onChange(next);
    }
  }

  function onResponderGrant(event: GestureResponderEvent): void {
    const { pageX, locationX } = event.nativeEvent;
    // Children are pointerEvents="none", so locationX is track-relative.
    originXRef.current = pageX - locationX;
    select(locationX);
  }

  function onResponderMove(event: GestureResponderEvent): void {
    select(event.nativeEvent.pageX - originXRef.current);
  }

  function onLayout(event: LayoutChangeEvent): void {
    setTrackWidth(event.nativeEvent.layout.width);
  }

  function onAccessibilityAction(event: AccessibilityActionEvent): void {
    const delta = event.nativeEvent.actionName === 'increment' ? 1 : -1;
    const next = STOPS[Math.min(Math.max(index + delta, 0), STOPS.length - 1)];

    if (next !== value) {
      onChange(next);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <View
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        accessibilityLabel="How hard should I push?"
        accessibilityRole="adjustable"
        accessibilityValue={{ text: selected.label }}
        onAccessibilityAction={onAccessibilityAction}
        onLayout={onLayout}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={onResponderGrant}
        onResponderMove={onResponderMove}
        onResponderTerminationRequest={() => false}
        onStartShouldSetResponder={() => true}
        style={styles.trackArea}>
        <View
          pointerEvents="none"
          style={[styles.track, { backgroundColor: theme.backgroundSelected }]}
        />
        <View
          pointerEvents="none"
          style={[styles.fill, { width: thumbLeft + THUMB_SIZE / 2 }]}
        />
        {STOPS.map((stop, stopIndex) => (
          <View
            key={stop}
            pointerEvents="none"
            style={[
              styles.tick,
              {
                left: (stopIndex / (STOPS.length - 1)) * usable + THUMB_SIZE / 2 - TICK_SIZE / 2,
                backgroundColor: stopIndex <= index ? SELECTED_GREEN : theme.backgroundSelected,
              },
            ]}
          />
        ))}
        <View
          pointerEvents="none"
          style={[styles.thumb, { left: thumbLeft, borderColor: theme.background }]}
        />
      </View>

      <ThemedView style={styles.labels}>
        {COACHING_PACE_OPTIONS.map((option, optionIndex) => (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: option.value === value }}
            onPress={() => onChange(option.value)}
            style={[
              styles.labelButton,
              optionIndex === 0 && styles.labelStart,
              optionIndex === COACHING_PACE_OPTIONS.length - 1 && styles.labelEnd,
            ]}>
            <ThemedText
              type={option.value === value ? 'smallBold' : 'small'}
              style={option.value === value ? styles.selectedLabel : undefined}>
              {option.label}
            </ThemedText>
          </Pressable>
        ))}
      </ThemedView>

      <ThemedText type="small" themeColor="textSecondary">
        {selected.description ?? 'Steady, realistic targets — the middle of the road.'}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  trackArea: {
    height: THUMB_SIZE + Spacing.two,
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    left: THUMB_SIZE / 2,
    right: THUMB_SIZE / 2,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
  },
  fill: {
    position: 'absolute',
    left: THUMB_SIZE / 2,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: SELECTED_GREEN,
  },
  tick: {
    position: 'absolute',
    width: TICK_SIZE,
    height: TICK_SIZE,
    borderRadius: TICK_SIZE / 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 3,
    backgroundColor: SELECTED_GREEN,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelButton: {
    flex: 1,
    alignItems: 'center',
  },
  labelStart: {
    alignItems: 'flex-start',
  },
  labelEnd: {
    alignItems: 'flex-end',
  },
  selectedLabel: {
    color: SELECTED_GREEN,
  },
});
