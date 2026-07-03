import { AppShell } from "@/components/app-shell/app-shell";
import { NoPermission } from "@/components/app-shell/no-permission";
import { PageContent } from "@/components/app-shell/page-content";
import {
  EmptyIdentityState,
  IdentitySelection,
} from "@/components/auth/identity-selection";
import { LoginForm } from "@/components/auth/login-form";
import {
  getCurrentIdentityCookie,
  getCurrentUserMemberships,
  getSignedInUser,
  resolveCurrentMembership,
} from "@/lib/identity/queries";
import {
  getNavigationForRole,
  isViewAllowed,
  normalizeView,
} from "@/lib/identity/navigation";

type HomeProps = {
  searchParams?: Promise<{
    view?: string | string[];
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const user = await getSignedInUser();

  if (!user) {
    return <LoginForm />;
  }

  const [{ error, memberships }, selectedMembershipId, params] =
    await Promise.all([
      getCurrentUserMemberships(),
      getCurrentIdentityCookie(),
      searchParams,
    ]);

  if (memberships.length === 0) {
    return <EmptyIdentityState error={error} />;
  }

  const currentIdentity = resolveCurrentMembership(
    memberships,
    selectedMembershipId,
  );

  if (!currentIdentity) {
    return <IdentitySelection memberships={memberships} />;
  }

  const activeView = normalizeView(params?.view);
  const navigation = getNavigationForRole(currentIdentity.role);
  const allowed = isViewAllowed(currentIdentity.role, activeView);

  return (
    <AppShell
      activeView={activeView}
      currentIdentity={currentIdentity}
      navigation={navigation}
    >
      {allowed ? (
        <PageContent currentIdentity={currentIdentity} view={activeView} />
      ) : (
        <NoPermission currentIdentity={currentIdentity} />
      )}
    </AppShell>
  );
}
