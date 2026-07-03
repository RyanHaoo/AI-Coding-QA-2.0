"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { currentIdentityCookieName } from "@/lib/identity/queries";
import { createClient } from "@/lib/supabase/server";

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
