import { RouteShell } from '@/components/route-shell';
import { RetryScreen } from '@/features/processing/components/retry-screen';

export default function RetryRoute() {
  return (
    <RouteShell>
      <RetryScreen />
    </RouteShell>
  );
}
