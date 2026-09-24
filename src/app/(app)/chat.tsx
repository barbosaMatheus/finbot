import { ChatWindow } from '@/features/chat/components/chat-window';
import { formatPeriod, formatSignedMoney, targetTitle } from '@/features/gameplan/format';
import { useAnchor } from '@/features/gameplan/hooks/use-anchor';

/**
 * Chat with the current plan as its context line. Features never import
 * each other, so the route composes the two here.
 */
export default function ChatScreen() {
  const { anchor } = useAnchor();

  const contextLine =
    anchor?.status === 'ready' && anchor.plan && anchor.period
      ? `${formatPeriod(anchor.period.start, anchor.period.end)} · ${anchor.plan.targets
          .map((target) => targetTitle(target.definition))
          .join(' · ')} · ${formatSignedMoney(anchor.plan.live?.freeCash ?? anchor.plan.freeCash.freeCash)} left`
      : null;

  return <ChatWindow contextLine={contextLine} />;
}
