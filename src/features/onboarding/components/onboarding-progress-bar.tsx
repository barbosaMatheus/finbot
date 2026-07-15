import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type OnboardingProgressBarProps = {
  stepIndex: number;
  stepCount: number;
};

export function OnboardingProgressBar({ stepIndex, stepCount }: OnboardingProgressBarProps) {
  const theme = useTheme();
  const progress = ((stepIndex + 1) / stepCount) * 100;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary">
        Step {stepIndex + 1} of {stepCount}
      </ThemedText>
      <ThemedView style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
        <ThemedView
          style={[
            styles.fill,
            {
              width: `${progress}%`,
              backgroundColor: theme.text,
            },
          ]}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  track: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
