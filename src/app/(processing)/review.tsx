import { RouteShell } from '@/components/route-shell';
import { ReviewScreen } from '@/features/review/components/review-screen';

export default function ReviewRoute() {
  return (
    <RouteShell>
      <ReviewScreen />
    </RouteShell>
  );
}
