import { zodResolver } from '@hookform/resolvers/zod';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  FormProvider,
  useForm,
  useWatch,
  type UseFormReturn,
} from 'react-hook-form';

import { ONBOARDING_STEPS } from '@/features/onboarding/constants/steps';
import {
  ONBOARDING_STEP_FIELDS,
  ONBOARDING_STEP_SCHEMAS,
  onboardingAnswersSchema,
  type OnboardingAnswers,
  type OnboardingFormValues,
} from '@/features/onboarding/schemas/onboarding';
import { createInitialAnswers } from '@/features/onboarding/utils/create-initial-answers';

type OnboardingContextValue = {
  form: UseFormReturn<OnboardingFormValues, unknown, OnboardingAnswers>;
  stepIndex: number;
  stepCount: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  isComplete: boolean;
  canProceed: boolean;
  goNext: () => Promise<boolean>;
  goBack: () => void;
  completeOnboarding: () => Promise<boolean>;
  resetOnboarding: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

/** Dev-only: skip step validation so Continue/Finish always advances. */
const SKIP_ONBOARDING_VALIDATION = __DEV__;

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const form = useForm<OnboardingFormValues, unknown, OnboardingAnswers>({
    resolver: zodResolver(onboardingAnswersSchema),
    defaultValues: createInitialAnswers(),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const currentStepId = ONBOARDING_STEPS[stepIndex].id;
  const watchedValues = useWatch({ control: form.control }) ?? form.getValues();
  const canProceed =
    SKIP_ONBOARDING_VALIDATION ||
    ONBOARDING_STEP_SCHEMAS[currentStepId].safeParse(watchedValues).success;

  const goNext = useCallback(async () => {
    if (!SKIP_ONBOARDING_VALIDATION) {
      const fields = [...ONBOARDING_STEP_FIELDS[ONBOARDING_STEPS[stepIndex].id]];
      const isValid = await form.trigger(fields);

      if (!isValid) {
        return false;
      }
    }

    if (stepIndex >= ONBOARDING_STEPS.length - 1) {
      return true;
    }

    setStepIndex((current) => current + 1);
    return true;
  }, [form, stepIndex]);

  const goBack = useCallback(() => {
    setStepIndex((current) => Math.max(0, current - 1));
  }, []);

  const completeOnboarding = useCallback(async () => {
    if (!SKIP_ONBOARDING_VALIDATION) {
      const lastStep = ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1];
      const fields = [...ONBOARDING_STEP_FIELDS[lastStep.id]];
      const isValid = await form.trigger(fields);

      if (!isValid) {
        return false;
      }
    }

    const values = form.getValues();
    // Local-only for now; persist via API when onboarding backend is ready.
    console.log('[onboarding] completed', values);
    setIsComplete(true);
    return true;
  }, [form]);

  const resetOnboarding = useCallback(() => {
    form.reset(createInitialAnswers());
    setStepIndex(0);
    setIsComplete(false);
  }, [form]);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      form,
      stepIndex,
      stepCount: ONBOARDING_STEPS.length,
      isFirstStep: stepIndex === 0,
      isLastStep: stepIndex === ONBOARDING_STEPS.length - 1,
      isComplete,
      canProceed,
      goNext,
      goBack,
      completeOnboarding,
      resetOnboarding,
    }),
    [
      canProceed,
      completeOnboarding,
      form,
      goBack,
      goNext,
      isComplete,
      resetOnboarding,
      stepIndex,
    ],
  );

  return (
    <OnboardingContext.Provider value={value}>
      <FormProvider {...form}>{children}</FormProvider>
    </OnboardingContext.Provider>
  );
}

export function useOnboardingContext(): OnboardingContextValue {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }

  return context;
}
