import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const CONTINUE_BUTTON_BLUE = '#1877F2';

type OnboardingNavFooterProps = {
  isFirstStep: boolean;
  isLastStep: boolean;
  canProceed: boolean;
  isSubmitting?: boolean;
  onBack: () => void;
  onNext: () => void;
};

export function OnboardingNavFooter({
  isFirstStep,
  isLastStep,
  canProceed,
  isSubmitting = false,
  onBack,
  onNext,
}: OnboardingNavFooterProps) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.footer}>
      {!isFirstStep ? (
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [
            styles.secondaryButton,
            {
              borderColor: theme.backgroundSelected,
              opacity: pressed ? 0.7 : 1,
            },
          ]}>
          <ThemedText type="smallBold">Back</ThemedText>
        </Pressable>
      ) : (
        <ThemedView style={styles.spacer} />
      )}

      <Pressable
        disabled={isSubmitting}
        onPress={onNext}
        style={({ pressed }) => [
          styles.primaryButton,
          {
            backgroundColor: CONTINUE_BUTTON_BLUE,
            opacity: isSubmitting ? 0.7 : !canProceed ? 0.55 : pressed ? 0.7 : 1,
          },
        ]}>
        {isSubmitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <ThemedText type="smallBold" style={styles.primaryButtonLabel}>
            {isLastStep ? 'Finish' : 'Continue'}
          </ThemedText>
        )}
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    minHeight: 48,
  },
  primaryButtonLabel: {
    color: '#ffffff',
  },
});
