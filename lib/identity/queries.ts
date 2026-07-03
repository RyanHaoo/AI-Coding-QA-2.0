import { cookies } from "next/headers";

import type {
  ProjectMembership,
  ProjectType,
  Role,
} from "@/lib/identity/types";
import { createClient } from "@/lib/supabase/server";

export const currentIdentityCookieName = "qa_current_membership_id";

type MembershipRow = {
  id: string;
  role: string;
  profile: RelatedValue<{
    avatar_url: string | null;
    department: string;
    email: string;
    employee_number: string;
    full_name: string;
    id: string;
  }>;
  project: RelatedValue<{
    city: string;
    client_name: string;
    id: string;
    name: string;
    project_type: string;
  }>;
};

type RelatedValue<T> = T | T[] | null;

function firstRelated<T>(value: RelatedValue<T>) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function isRole(value: string): value is Role {
  return value === "inspector" || value === "builder" || value === "admin";
}

function isProjectType(value: string): value is ProjectType {
  return (
    value === "commercial" ||
    value === "industrial" ||
    value === "residential" ||
    value === "government"
  );
}

export async function getSignedInUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
}

export async function getCurrentUserMemberships(): Promise<{
  error: string | null;
  memberships: ProjectMembership[];
}> {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return {
      error: userError?.message ?? "User is not signed in.",
      memberships: [],
    };
  }

  const { data, error } = await supabase
    .from("project_memberships")
    .select(`
      id,
      role,
      profile:app_users(
        id,
        email,
        employee_number,
        full_name,
        department,
        avatar_url
      ),
      project:projects(
        id,
        name,
        city,
        client_name,
        project_type
      )
    `)
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return {
      error: error.message,
      memberships: [],
    };
  }

  const memberships = ((data ?? []) as unknown as MembershipRow[]).flatMap(
    (item) => {
      const profile = firstRelated(item.profile);
      const project = firstRelated(item.project);

      if (!profile || !project || !isRole(item.role)) {
        return [];
      }

      return [
        {
          id: item.id,
          profile: {
            avatarUrl: profile.avatar_url,
            department: profile.department,
            email: profile.email,
            employeeNumber: profile.employee_number,
            fullName: profile.full_name,
            id: profile.id,
          },
          project: {
            city: project.city,
            clientName: project.client_name,
            id: project.id,
            name: project.name,
            projectType: isProjectType(project.project_type)
              ? project.project_type
              : "commercial",
          },
          role: item.role,
        },
      ];
    },
  );

  return {
    error: null,
    memberships,
  };
}

export async function getCurrentIdentityCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(currentIdentityCookieName)?.value ?? null;
}

export function resolveCurrentMembership(
  memberships: ProjectMembership[],
  selectedMembershipId: string | null,
) {
  if (memberships.length === 1) {
    return memberships[0];
  }

  return (
    memberships.find((membership) => membership.id === selectedMembershipId) ??
    null
  );
}
