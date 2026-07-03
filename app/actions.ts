"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  currentIdentityCookieName,
  getCurrentUserMemberships,
  resolveCurrentMembership,
} from "@/lib/identity/queries";
import { createClient } from "@/lib/supabase/server";
import { uploadTicketImages } from "@/lib/tickets/image-storage";
import {
  editTicket,
  reassignTicket,
  rejectTicket,
  reopenTicket,
  resolveTicket,
} from "@/lib/tickets/mutations";
import { isTicketSeverity, isTicketSpecialty } from "@/lib/tickets/operations";
import type { TicketOperationState } from "@/lib/tickets/types";

export type LoginActionState = {
  message: string;
};

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      message: "请输入账号和密码。",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      message: "账号或密码不正确，请检查后重试。",
    };
  }

  const cookieStore = await cookies();
  cookieStore.delete(currentIdentityCookieName);

  revalidatePath("/");
  redirect("/");
}

export async function selectIdentityAction(formData: FormData) {
  const membershipId = String(formData.get("membershipId") ?? "");

  if (!membershipId) {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect("/");
  }

  const { data, error } = await supabase
    .from("project_memberships")
    .select("id")
    .eq("id", membershipId)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (error || !data) {
    redirect("/");
  }

  const cookieStore = await cookies();
  cookieStore.set(currentIdentityCookieName, membershipId, {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  revalidatePath("/");
  redirect("/?view=assistant");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.delete(currentIdentityCookieName);

  revalidatePath("/");
  redirect("/");
}

async function getCurrentActionIdentity() {
  const [{ memberships }, cookieStore] = await Promise.all([
    getCurrentUserMemberships(),
    cookies(),
  ]);
  const selectedMembershipId =
    cookieStore.get(currentIdentityCookieName)?.value ?? null;

  return resolveCurrentMembership(memberships, selectedMembershipId);
}

function formText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function formFiles(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function actionRejected(message: string): TicketOperationState {
  return { message, ok: false };
}

async function runTicketAction(
  operation: (
    currentIdentity: NonNullable<
      Awaited<ReturnType<typeof getCurrentActionIdentity>>
    >,
  ) => Promise<TicketOperationState>,
) {
  const currentIdentity = await getCurrentActionIdentity();

  if (!currentIdentity) {
    return actionRejected("请先登录并选择项目身份。");
  }

  const result = await operation(currentIdentity);

  if (result.ok) {
    revalidatePath("/");
  }

  return result;
}

export async function resolveTicketAction(
  _previousState: TicketOperationState,
  formData: FormData,
): Promise<TicketOperationState> {
  return runTicketAction((currentIdentity) =>
    resolveTicket(
      {
        preventiveAction: formText(formData, "preventiveAction"),
        rootCause: formText(formData, "rootCause"),
        ticketId: formText(formData, "ticketId"),
      },
      currentIdentity,
    ),
  );
}

export async function rejectTicketAction(
  _previousState: TicketOperationState,
  formData: FormData,
): Promise<TicketOperationState> {
  return runTicketAction((currentIdentity) =>
    rejectTicket(
      {
        reason: formText(formData, "reason"),
        ticketId: formText(formData, "ticketId"),
      },
      currentIdentity,
    ),
  );
}

export async function editTicketAction(
  _previousState: TicketOperationState,
  formData: FormData,
): Promise<TicketOperationState> {
  return runTicketAction(async (currentIdentity) => {
    const ticketId = formText(formData, "ticketId");
    const severity = formText(formData, "severity");
    const specialty = formText(formData, "specialty");

    if (!isTicketSeverity(severity) || !isTicketSpecialty(specialty)) {
      return actionRejected("请选择有效的严重程度和专业类型。");
    }

    const keptImageUrls = formData
      .getAll("existingImageUrls")
      .map((value) => String(value).trim())
      .filter(Boolean);
    const uploadResult = await uploadTicketImages(
      ticketId,
      formFiles(formData, "newImages"),
    );

    if (uploadResult.error) {
      return actionRejected(uploadResult.error);
    }

    return editTicket(
      {
        description: formText(formData, "description"),
        existingImageUrls: keptImageUrls,
        imageUrls: [...keptImageUrls, ...uploadResult.urls],
        locationDetail: formText(formData, "locationDetail"),
        severity,
        specialty,
        summary: formText(formData, "summary"),
        ticketId,
      },
      currentIdentity,
    );
  });
}

export async function reassignTicketAction(
  _previousState: TicketOperationState,
  formData: FormData,
): Promise<TicketOperationState> {
  return runTicketAction((currentIdentity) =>
    reassignTicket(
      {
        assigneeMembershipId: formText(formData, "assigneeMembershipId"),
        reason: formText(formData, "reason"),
        ticketId: formText(formData, "ticketId"),
      },
      currentIdentity,
    ),
  );
}

export async function reopenTicketAction(
  _previousState: TicketOperationState,
  formData: FormData,
): Promise<TicketOperationState> {
  return runTicketAction((currentIdentity) =>
    reopenTicket(
      {
        reason: formText(formData, "reason"),
        ticketId: formText(formData, "ticketId"),
      },
      currentIdentity,
    ),
  );
}
