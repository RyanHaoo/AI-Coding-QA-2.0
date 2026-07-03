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
import {
  getAdminTickets,
  getMemberTickets,
  getReassignCandidates,
  getTicketDetail,
} from "@/lib/tickets/queries";
import { parseTicketQueryParams } from "@/lib/tickets/query-params";

type HomeProps = {
  searchParams?: Promise<{
    ticketId?: string | string[];
    ticketSort?: string | string[];
    ticketStatus?: string | string[];
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
  const ticketQuery = parseTicketQueryParams(params);

  const [memberTickets, adminTickets, ticketDetail] = allowed
    ? await Promise.all([
        activeView === "tickets"
          ? getMemberTickets(
              currentIdentity,
              ticketQuery.ticketStatus,
              ticketQuery.ticketSort,
            )
          : Promise.resolve(undefined),
        activeView === "admin-tickets"
          ? getAdminTickets(currentIdentity)
          : Promise.resolve(undefined),
        ticketQuery.ticketId ? getTicketDetail(ticketQuery.ticketId) : null,
      ])
    : [undefined, undefined, null];
  const reassignCandidates =
    ticketDetail?.kind === "found"
      ? await getReassignCandidates(
          currentIdentity,
          ticketDetail.ticket.assignee.membershipId,
        )
      : [];

  return (
    <AppShell
      activeView={activeView}
      currentIdentity={currentIdentity}
      navigation={navigation}
    >
      {allowed ? (
        <PageContent
          adminTickets={adminTickets}
          currentIdentity={currentIdentity}
          memberTickets={memberTickets}
          reassignCandidates={reassignCandidates}
          ticketDetail={ticketDetail}
          ticketQuery={ticketQuery}
          view={activeView}
        />
      ) : (
        <NoPermission currentIdentity={currentIdentity} />
      )}
    </AppShell>
  );
}
