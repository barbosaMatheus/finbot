import { StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { AboutYouStep } from '@/features/onboarding/components/about-you-step';
import { CreateAccountStep } from '@/features/onboarding/components/create-account-step';
import { GoalsAndPoolsStep } from '@/features/onboarding/components/goals-and-pools-step';
import { MonthlyCostsStep } from '@/features/onboarding/components/monthly-costs-step';
import { OnboardingNavFooter } from '@/features/onboarding/components/onboarding-nav-footer';
import { OnboardingProgressBar } from '@/features/onboarding/components/onboarding-progress-bar';
import { OnboardingStepHeader } from '@/features/onboarding/components/onboarding-step-header';
import { PreferencesStep } from '@/features/onboarding/components/preferences-step';
import { SavingsAndDebtStep } from '@/features/onboarding/components/savings-and-debt-step';
import { WorkAndIncomeStep } from '@/features/onboarding/components/work-and-income-step';
import { useOnboarding } from '@/features/onboarding/hooks/use-onboarding';
import { useOnboardingStatus } from '@/features/onboarding-status/onboarding-status-context';
import type { OnboardingStepId } from '@/features/onboarding/types/onboarding';

function renderStepContent(stepId: OnboardingStepId, accountError: string | null) {
  switch (stepId) {
    case 'createAccount':
      return <CreateAccountStep formError={accountError} />;
    case 'aboutYou':
      return <AboutYouStep />;
    case 'workAndIncome':
      return <WorkAndIncomeStep />;
    case 'monthlyCosts':
      return <MonthlyCostsStep />;
    case 'savingsAndDebt':
      return <SavingsAndDebtStep />;
    case 'goalsAndPools':
      return <GoalsAndPoolsStep />;
    case 'preferences':
      return <PreferencesStep formError={accountError} />;
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
