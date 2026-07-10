import type { ComponentType } from 'react';
import { View as RNView, type ViewProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// RN 0.85 legacy types declare View as a class mixin that React 19's JSX
// ElementClass no longer accepts. Cast until the project opts into RN's
// strict TypeScript API (or Expo ships compatible types).
const View = RNView as unknown as ComponentType<ViewProps>;

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
};

export function ThemedView({ style, lightColor, darkColor, type, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();

  return <View style={[{ backgroundColor: theme[type ?? 'background'] }, style]} {...otherProps} />;
}
