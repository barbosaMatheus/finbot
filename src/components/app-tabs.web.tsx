import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
} from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import { Pressable, useColorScheme, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from './themed-view';

import { Colors, Spacing } from '@/constants/theme';

export default function AppTabs() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const bottomInset = Math.max(insets.bottom, Spacing.two);
  const tabBarHeight = 56 + bottomInset;

  const slotStyle = StyleSheet.flatten([styles.slot, { paddingBottom: tabBarHeight }]);
  const tabBarStyle = StyleSheet.flatten([
    styles.tabBar,
    {
      backgroundColor: colors.background,
      borderTopColor: colors.backgroundSelected,
      paddingBottom: bottomInset,
    },
  ]);

  return (
    <Tabs>
      <TabSlot style={slotStyle} />
      <TabList asChild>
        <View style={tabBarStyle}>
          <TabTrigger name="home" href="/" asChild>
            <TabButton accessibilityLabel="Home" icon="house.fill" />
          </TabTrigger>
          <TabTrigger name="chat" href="/chat" asChild>
            <TabButton accessibilityLabel="Chat" icon="bubble.left.fill" />
          </TabTrigger>
        </View>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & {
  icon: 'house.fill' | 'bubble.left.fill';
  accessibilityLabel: string;
};

export function TabButton({
  isFocused,
  icon,
  accessibilityLabel,
  style,
  ...props
}: TabButtonProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <Pressable
      {...props}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={(state) =>
        StyleSheet.flatten([
          typeof style === 'function' ? style(state) : style,
          styles.tabButton,
          state.pressed && styles.pressed,
        ])
      }>
      <ThemedView style={styles.tabButtonContent}>
        <SymbolView
          name={{ ios: icon, web: icon === 'house.fill' ? 'home' : 'chat' }}
          size={24}
          tintColor={isFocused ? colors.text : colors.textSecondary}
        />
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    height: '100%',
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two,
    minHeight: 56,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.7,
  },
});
