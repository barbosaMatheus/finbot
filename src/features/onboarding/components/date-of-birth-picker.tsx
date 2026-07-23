import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  formatDateOfBirth,
  getDefaultDateOfBirth,
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

export function DateOfBirthPicker({ value, error, onChange }: DateOfBirthPickerProps) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = parseDateOfBirth(value) ?? getDefaultDateOfBirth();

  function handleValueChange(_event: unknown, date: Date) {
    onChange(formatDateOfBirth(date));
    if (Platform.OS === 'android') {
      setIsOpen(false);
    }
  }

  return (
    <ThemedView style={styles.field}>
      <ThemedText type="smallBold">Date of birth</ThemedText>

      <Pressable
        accessibilityRole="button"
        onPress={() => setIsOpen((current) => !current)}
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: error ? '#e5484d' : theme.backgroundSelected,
            opacity: pressed ? 0.85 : 1,
          },
        ]}>
        <ThemedText
          style={styles.triggerText}
          themeColor={value ? 'text' : 'textSecondary'}>
          {value || 'Select date'}
        </ThemedText>
      </Pressable>

      {isOpen ? (
        <DateTimePicker
          accentColor="#1B7F4E"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={getLatestDateOfBirth()}
          minimumDate={getEarliestDateOfBirth()}
          mode="date"
          onDismiss={() => setIsOpen(false)}
          onValueChange={handleValueChange}
          presentation={Platform.OS === 'android' ? 'dialog' : 'inline'}
          value={selectedDate}
        />
      ) : null}

      {Platform.OS === 'ios' && isOpen ? (
        <Pressable onPress={() => setIsOpen(false)} style={styles.doneButton}>
          <ThemedText type="smallBold" style={styles.doneLabel}>
            Done
          </ThemedText>
        </Pressable>
      ) : null}

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
  triggerText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  doneButton: {
    alignSelf: 'flex-end',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  doneLabel: {
    color: '#1B7F4E',
  },
  error: {
    color: '#e5484d',
  },
});
