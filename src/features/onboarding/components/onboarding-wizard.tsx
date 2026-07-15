import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { AboutYouStep } from '@/features/onboarding/components/about-you-step';
import { GoalsAndPoolsStep } from '@/features/onboarding/components/goals-and-pools-step';
import { MonthlyCostsStep } from '@/features/onboarding/components/monthly-costs-step';
import { OnboardingNavFooter } from '@/features/onboarding/components/onboarding-nav-footer';
import { OnboardingProgressBar } from '@/features/onboarding/components/onboarding-progress-bar';
import { OnboardingStepHeader } from '@/features/onboarding/components/onboarding-step-header';
import { PreferencesStep } from '@/features/onboarding/components/preferences-step';
import { SavingsAndDebtStep } from '@/features/onboarding/components/savings-and-debt-step';
import { WorkAndIncomeStep } from '@/features/onboarding/components/work-and-income-step';
import { ONBOARDING_STEPS } from '@/features/onboarding/constants/steps';
import { useOnboarding } from '@/features/onboarding/hooks/use-onboarding';
import type { OnboardingStepId } from '@/features/onboarding/types/onboarding';

function renderStepContent(stepId: OnboardingStepId) {
  switch (stepId) {
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
      return <PreferencesStep />;
    default:
      return null;
  }
}

export function OnboardingWizard() {
  const router = useRouter();
  const {
    stepIndex,
    stepCount,
    isFirstStep,
    isLastStep,
    canProceed,
    goBack,
    goNext,
    completeOnboarding,
  } = useOnboarding();

  const currentStep = ONBOARDING_STEPS[stepIndex];

  async function handleNext() {
    if (isLastStep) {
      const didComplete = await completeOnboarding();
      if (didComplete) {
        router.replace('/(app)');
      }
      return;
    }

    await goNext();
  }

  return (
    <ThemedView style={styles.wizard}>
      <OnboardingProgressBar stepCount={stepCount} stepIndex={stepIndex} />
      <OnboardingStepHeader description={currentStep.description} title={currentStep.title} />
      <ThemedView style={styles.content}>{renderStepContent(currentStep.id)}</ThemedView>
      <OnboardingNavFooter
        canProceed={canProceed}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
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
