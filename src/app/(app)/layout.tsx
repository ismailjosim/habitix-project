import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app/app-shell';
import { getActiveFocusSession } from '@/lib/queries/focus';
import { getUnreadNotificationCount } from '@/lib/queries/notifications';
import { getCurrentUserProfile } from '@/lib/session';

export default async function ProtectedAppLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUserProfile();

  if (!currentUser) {
    redirect('/sign-in');
  }

  const [unreadNotificationCount, activeFocusSession] = await Promise.all([
    getUnreadNotificationCount(currentUser.profile.id),
    getActiveFocusSession(currentUser.profile.id),
  ]);

  const userInfo = {
    name: currentUser.profile.displayName,
    email: currentUser.session.user.email,
    image: currentUser.session.user.image,
    role: currentUser.profile.role,
    unreadNotificationCount,
  };

  return (
    <AppShell user={userInfo} activeFocusSession={activeFocusSession}>
      {children}
    </AppShell>
  );
}
