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

import { useAuth } from '@/features/auth/use-auth';
import { submitOnboarding } from '@/features/onboarding/api/onboarding-api';
import {
  getOnboardingSteps,
  type OnboardingStepConfig,
} from '@/features/onboarding/constants/steps';
import {
  ONBOARDING_STEP_FIELDS,
  ONBOARDING_STEP_SCHEMAS,
  onboardingAnswersSchema,
  onboardingFormSchema,
  type OnboardingFormValues,
} from '@/features/onboarding/schemas/onboarding';
import { createInitialAnswers } from '@/features/onboarding/utils/create-initial-answers';
import { ApiError } from '@/lib/api-client';

type OnboardingContextValue = {
  form: UseFormReturn<OnboardingFormValues>;
  steps: OnboardingStepConfig[];
  stepIndex: number;
  stepCount: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  isComplete: boolean;
  isSubmitting: boolean;
  canProceed: boolean;
  accountError: string | null;
  goNext: () => Promise<boolean>;
  goBack: () => void;
  completeOnboarding: () => Promise<boolean>;
  resetOnboarding: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

/** Dev-only: skip profile-step validation so Continue/Finish always advances. */
const SKIP_ONBOARDING_VALIDATION = __DEV__;

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, register } = useAuth();
  const [includeCreateAccount] = useState(() => !isAuthenticated);
  const steps = useMemo(
    () => getOnboardingSteps(includeCreateAccount),
    [includeCreateAccount],
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: createInitialAnswers(),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const currentStep = steps[stepIndex];
  const currentStepId = currentStep.id;
  const watchedValues = useWatch({ control: form.control }) ?? form.getValues();
  const canProceed =
    currentStepId === 'createAccount'
      ? ONBOARDING_STEP_SCHEMAS.createAccount.safeParse(watchedValues).success
      : SKIP_ONBOARDING_VALIDATION ||
        ONBOARDING_STEP_SCHEMAS[currentStepId].safeParse(watchedValues).success;

  const isFirstStep =
    stepIndex === 0 || steps[stepIndex - 1]?.id === 'createAccount';

  const goNext = useCallback(async () => {
    const stepId = steps[stepIndex].id;
    const fields = [...ONBOARDING_STEP_FIELDS[stepId]];

    if (stepId === 'createAccount') {
      const isValid = await form.trigger(fields);
      if (!isValid) {
        return false;
      }

      const { email, password } = form.getValues();
      setIsSubmitting(true);
      setAccountError(null);

      try {
        await register({ email, password });
        form.setValue('password', '');
        form.setValue('confirmPassword', '');
      } catch (err) {
        setAccountError(
          err instanceof ApiError
            ? err.message
            : 'Unable to create account. Please try again.',
        );
        return false;
      } finally {
        setIsSubmitting(false);
      }
    } else if (!SKIP_ONBOARDING_VALIDATION) {
      const isValid = await form.trigger(fields);
      if (!isValid) {
        return false;
      }
    }

    if (stepIndex >= steps.length - 1) {
      return true;
    }

    setStepIndex((current) => current + 1);
    return true;
  }, [form, register, stepIndex, steps]);

  const goBack = useCallback(() => {
    setStepIndex((current) => {
      const previousIndex = current - 1;
      if (previousIndex < 0) {
        return current;
      }
      // Account is created on Continue; don't allow returning to that step.
      if (steps[previousIndex]?.id === 'createAccount') {
        return current;
      }
      return previousIndex;
    });
  }, [steps]);

  const completeOnboarding = useCallback(async () => {
    const lastStep = steps[steps.length - 1];
    const fields = [...ONBOARDING_STEP_FIELDS[lastStep.id]];
    const isValid = await form.trigger(fields);

    if (!isValid && !SKIP_ONBOARDING_VALIDATION) {
      return false;
    }

    const { email: _email, password: _password, confirmPassword: _confirm, ...answers } =
      form.getValues();
    const parsed = onboardingAnswersSchema.safeParse(answers);

    if (!parsed.success) {
      setAccountError('Please finish all onboarding answers before continuing.');
      return false;
    }

    setIsSubmitting(true);
    setAccountError(null);

    try {
      await submitOnboarding(parsed.data);
      setIsComplete(true);
      return true;
    } catch (err) {
      setAccountError(
        err instanceof ApiError
          ? err.message
          : 'Unable to save onboarding. Please try again.',
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [form, steps]);

  const resetOnboarding = useCallback(() => {
    form.reset(createInitialAnswers());
    setStepIndex(0);
    setIsComplete(false);
    setAccountError(null);
  }, [form]);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      form,
      steps,
      stepIndex,
      stepCount: steps.length,
      isFirstStep,
      isLastStep: stepIndex === steps.length - 1,
      isComplete,
      isSubmitting,
      canProceed,
      accountError,
      goNext,
      goBack,
      completeOnboarding,
      resetOnboarding,
    }),
    [
      accountError,
      canProceed,
      completeOnboarding,
      form,
      goBack,
      goNext,
      isComplete,
      isFirstStep,
      isSubmitting,
      resetOnboarding,
      stepIndex,
      steps,
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
