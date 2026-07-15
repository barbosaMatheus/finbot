import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ChatComposerProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export function ChatComposer({ value, onChangeText, onSend, disabled = false }: ChatComposerProps) {
  const theme = useTheme();
  const canSend = value.trim().length > 0 && !disabled;

  return (
    <ThemedView style={[styles.composer, { borderTopColor: theme.backgroundSelected }]}>
      <TextInput
        multiline
        onChangeText={onChangeText}
        placeholder="Message FinBot..."
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.backgroundElement,
            borderColor: theme.backgroundSelected,
          },
        ]}
        value={value}
      />
      <Pressable
        disabled={!canSend}
        onPress={onSend}
        style={({ pressed }) => [
          styles.sendButton,
          {
            backgroundColor: theme.backgroundSelected,
            opacity: !canSend ? 0.4 : pressed ? 0.7 : 1,
          },
        ]}>
        <ThemedText type="smallBold">Send</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  sendButton: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    minHeight: 40,
    justifyContent: 'center',
  },
});
