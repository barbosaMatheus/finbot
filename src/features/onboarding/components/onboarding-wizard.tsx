import { StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { AboutYouStep } from '@/features/onboarding/components/about-you-step';
import { CantSeeStep } from '@/features/onboarding/components/cant-see-step';
import { CoachingStep } from '@/features/onboarding/components/coaching-step';
import { CreateAccountStep } from '@/features/onboarding/components/create-account-step';
import { GoalStep } from '@/features/onboarding/components/goal-step';
import { IncomeStep } from '@/features/onboarding/components/income-step';
import { OnboardingNavFooter } from '@/features/onboarding/components/onboarding-nav-footer';
import { OnboardingProgressBar } from '@/features/onboarding/components/onboarding-progress-bar';
import { OnboardingStepHeader } from '@/features/onboarding/components/onboarding-step-header';
import { useOnboarding } from '@/features/onboarding/hooks/use-onboarding';
import { useOnboardingStatus } from '@/features/onboarding-status/onboarding-status-context';
import type { OnboardingStepId } from '@/features/onboarding/types/onboarding';

function renderStepContent(stepId: OnboardingStepId, accountError: string | null) {
  switch (stepId) {
    case 'createAccount':
      return <CreateAccountStep formError={accountError} />;
    case 'aboutYou':
      return <AboutYouStep />;
    case 'income':
      return <IncomeStep />;
    case 'cantSee':
      return <CantSeeStep />;
    case 'goal':
      return <GoalStep />;
    case 'coaching':
      return <CoachingStep formError={accountError} />;
    default:
      return null;
  }
}

export function OnboardingWizard() {
  const { refresh } = useOnboardingStatus();
  const {
    steps,
    stepIndex,
    stepCount,
    isFirstStep,
    isLastStep,
    canProceed,
    isSubmitting,
    accountError,
    goBack,
    goNext,
    completeOnboarding,
  } = useOnboarding();

  const currentStep = steps[stepIndex];

  async function handleNext() {
    if (isLastStep) {
      const didComplete = await completeOnboarding();
      if (didComplete) {
        // Saving completes the manual gate only (APP-006). The refreshed
        // status drives routing — usually into the waiting state while the
        // financial analysis finishes.
        await refresh();
      }
      return;
    }

    await goNext();
  }

  return (
    <ThemedView style={styles.wizard}>
      <OnboardingProgressBar stepCount={stepCount} stepIndex={stepIndex} />
      <OnboardingStepHeader description={currentStep.description} title={currentStep.title} />
      <ThemedView style={styles.content}>
        {renderStepContent(currentStep.id, accountError)}
      </ThemedView>
      <OnboardingNavFooter
        canProceed={canProceed}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        isSubmitting={isSubmitting}
        onBack={goBack}
        onNext={handleNext}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wizard: {
    flex: 1,
    gap: Spacing.four,
  },
  content: {
    flex: 1,
  },
});
