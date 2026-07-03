import {
  getCurrentIdentityCookie,
  getCurrentUserMemberships,
  getSignedInUser,
  resolveCurrentMembership,
} from "@/lib/identity/queries";

export async function resolveAssistantIdentity() {
  const [user, { memberships }, selectedMembershipId] = await Promise.all([
    getSignedInUser(),
    getCurrentUserMemberships(),
    getCurrentIdentityCookie(),
  ]);

  if (!user) {
    return {
      currentIdentity: null,
      error: "请先登录。",
      status: 401,
      userId: null,
    } as const;
  }

  const currentIdentity = resolveCurrentMembership(
    memberships,
    selectedMembershipId,
  );

  if (!currentIdentity) {
    return {
      currentIdentity: null,
      error: "请先选择项目身份。",
      status: 403,
      userId: user.id,
    } as const;
  }

  return {
    currentIdentity,
    error: null,
    status: 200,
    userId: user.id,
  } as const;
}
