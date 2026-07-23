import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  formatDateOfBirth,
  getEarliestDateOfBirth,
  getLatestDateOfBirth,
  parseDateOfBirth,
} from '@/features/onboarding/utils/date-of-birth';
import { useTheme } from '@/hooks/use-theme';

type DateOfBirthPickerProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

function toInputValue(value: string): string {
  const parsed = parseDateOfBirth(value);
  if (!parsed) {
    return '';
  }

  const year = String(parsed.getFullYear());
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DateOfBirthPicker({ value, error, onChange }: DateOfBirthPickerProps) {
  const theme = useTheme();

  function handleChange(nextValue: string) {
    if (!nextValue) {
      onChange('');
      return;
    }

    const [yearText, monthText, dayText] = nextValue.split('-');
    const date = new Date(Number(yearText), Number(monthText) - 1, Number(dayText));
    onChange(formatDateOfBirth(date));
  }

  return (
    <ThemedView style={styles.field}>
      <ThemedText type="smallBold">Date of birth</ThemedText>
      <ThemedView
        style={[
          styles.trigger,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: error ? '#e5484d' : theme.backgroundSelected,
          },
        ]}>
        {/* Native date input for web; Expo UI DateTimePicker is native-only. */}
        <input
          max={toInputValue(formatDateOfBirth(getLatestDateOfBirth()))}
          min={toInputValue(formatDateOfBirth(getEarliestDateOfBirth()))}
          onChange={(event) => handleChange(event.target.value)}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: theme.text,
            fontSize: 16,
            lineHeight: '24px',
            fontWeight: 400,
            fontFamily: 'inherit',
            padding: 0,
          }}
          type="date"
          value={toInputValue(value)}
        />
      </ThemedView>
      {error ? (
        <ThemedText type="small" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.one,
    alignSelf: 'stretch',
  },
  trigger: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    minHeight: 44,
    justifyContent: 'center',
  },
  error: {
    color: '#e5484d',
  },
});
