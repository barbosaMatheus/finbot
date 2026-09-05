import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** One free-text line, themed. The anchor asks for at most one at a time. */
export function LineInput({ style, ...rest }: TextInputProps) {
  const theme = useTheme();

  return (
    <TextInput
      placeholderTextColor={theme.textSecondary}
      style={[
        styles.input,
        {
          color: theme.text,
          backgroundColor: theme.backgroundElement,
          borderColor: theme.backgroundSelected,
        },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    minHeight: 44,
  },
});
