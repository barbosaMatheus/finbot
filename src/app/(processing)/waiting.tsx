import { RouteShell } from '@/components/route-shell';
import { WaitingScreen } from '@/features/processing/components/waiting-screen';

export default function WaitingRoute() {
  return (
    <RouteShell>
      <WaitingScreen />
    </RouteShell>
  );
}
