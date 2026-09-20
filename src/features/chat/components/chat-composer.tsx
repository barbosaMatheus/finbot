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
  /** Hard limit on how many characters a user can send in one message. */
  maxLength?: number;
};

export function ChatComposer({
  value,
  onChangeText,
  onSend,
  disabled = false,
  maxLength,
}: ChatComposerProps) {
  const theme = useTheme();
  const canSend = value.trim().length > 0 && !disabled;
  const charactersLeft = maxLength ? maxLength - value.length : null;

  return (
    <>
      <ThemedView style={[styles.composer, { borderTopColor: theme.backgroundSelected }]}>
        <TextInput
          multiline
          maxLength={maxLength}
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
      {maxLength ? (
        <ThemedText
          type="small"
          themeColor="textSecondary"
          style={[
            styles.counter,
            { opacity: charactersLeft !== null && charactersLeft < 10 ? 1 : 0.6 },
          ]}>
          {value.length}/{maxLength}
        </ThemedText>
      ) : null}
    </>
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
  counter: {
    alignSelf: 'flex-end',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
});